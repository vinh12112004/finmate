import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActionButton,
  AlertBanner,
  AppPage,
  BottomSheet,
  Surface,
  TextField,
} from '../components/ui'
import { useFinance } from '../hooks/useFinance'

const defaultCategories = [
  { label: 'Ăn uống', icon: 'restaurant' },
  { label: 'Cà phê', icon: 'local_cafe' },
  { label: 'Di chuyển', icon: 'directions_bus' },
  { label: 'Học tập', icon: 'book' },
  { label: 'Đăng ký', icon: 'subscriptions' },
]

const categoryIcons = Object.fromEntries(
  defaultCategories.map((category) => [category.label, category.icon]),
)

const voicePreviewUrl = '/api/voice/expense/preview'

async function readErrorMessage(response, fallback) {
  const responseText = await response.text()

  if (!responseText) return fallback

  try {
    const data = JSON.parse(responseText)
    return data.message || data.error || fallback
  } catch {
    return responseText
  }
}

function buildAdviceSignature({ amount, category, note }) {
  return JSON.stringify({
    amount: Number(amount),
    category: String(category || '').trim(),
    note: String(note || '').trim(),
  })
}

export function AddExpensePage() {
  const navigate = useNavigate()
  const { addTransaction, getExpenseRecommendation, transactions } = useFinance()
  const [form, setForm] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    title: '',
  })
  const [customCategory, setCustomCategory] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAdvice, setIsCheckingAdvice] = useState(false)
  const [expenseAdvice, setExpenseAdvice] = useState(null)
  const [voiceText, setVoiceText] = useState('')
  const [voicePreview, setVoicePreview] = useState({
    amount: '',
    category: '',
    note: '',
  })
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isVoiceParsing, setIsVoiceParsing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSavingVoice, setIsSavingVoice] = useState(false)
  const [isCheckingVoiceAdvice, setIsCheckingVoiceAdvice] = useState(false)
  const [voiceAdvice, setVoiceAdvice] = useState(null)
  const [voiceError, setVoiceError] = useState('')

  const categories = useMemo(() => {
    const usedCategories = transactions
      .map((transaction) => transaction.category)
      .filter(Boolean)

    return [...new Set([...defaultCategories.map((item) => item.label), ...usedCategories])]
      .sort((a, b) => {
        const aIndex = defaultCategories.findIndex((item) => item.label === a)
        const bIndex = defaultCategories.findIndex((item) => item.label === b)

        if (aIndex >= 0 && bIndex >= 0) {
          return aIndex - bIndex
        }

        if (aIndex >= 0) return -1
        if (bIndex >= 0) return 1

        return a.localeCompare(b, 'vi')
      })
      .map((label) => ({
        label,
        icon: categoryIcons[label] || 'receipt_long',
      }))
  }, [transactions])

  const updateField = (field, value) => {
    setExpenseAdvice(null)
    setForm((current) => ({ ...current, [field]: value }))
  }

  const selectCategory = (category) => {
    setExpenseAdvice(null)
    setCustomCategory('')
    setForm((current) => ({
      ...current,
      category: current.category === category ? '' : category,
    }))
  }

  const updateCustomCategory = (value) => {
    setExpenseAdvice(null)
    setCustomCategory(value)
    setForm((current) => ({
      ...current,
      category: value.trim() ? '' : current.category,
    }))
  }

  const updateVoicePreview = (field, value) => {
    setVoiceAdvice(null)
    setVoiceError('')
    setVoicePreview((current) => ({ ...current, [field]: value }))
  }

  const closeVoiceSheet = () => {
    if (isSavingVoice || isCheckingVoiceAdvice) return
    setIsVoiceModalOpen(false)
    setVoiceAdvice(null)
    setVoiceError('')
  }

  const handleParseVoice = async (textOverride) => {
    const text = (textOverride ?? voiceText).trim()

    if (!text) {
      setVoiceError('Vui lòng nhập hoặc nói nội dung khoản chi.')
      return
    }

    setVoiceError('')
    setVoiceAdvice(null)
    setIsVoiceParsing(true)

    try {
      const response = await fetch(voicePreviewUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Không thể phân tích khoản chi.'),
        )
      }

      const data = await response.json()
      const amount = Number(data.amount || 0)

      if (!amount || amount <= 0) {
        throw new Error('AI không thể nhận diện số tiền hợp lệ.')
      }

      setVoiceText(text)
      setVoicePreview({
        amount: String(amount),
        category: data.category || 'Khác',
        note: data.note || text,
      })
      setVoiceAdvice(null)
      setIsVoiceModalOpen(true)
    } catch (parseError) {
      setVoiceError(parseError.message || 'Không thể phân tích khoản chi.')
    } finally {
      setIsVoiceParsing(false)
    }
  }

  const handleStartVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError(
        'Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bạn có thể nhập nội dung vào ô bên dưới.',
      )
      return
    }

    setVoiceError('')

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'vi-VN'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onerror = (event) => {
        const message =
          event.error === 'not-allowed'
            ? 'Vui lòng cấp quyền microphone để ghi khoản chi bằng giọng nói.'
            : 'Không thể nhận diện giọng nói. Vui lòng thử lại hoặc nhập vào ô bên dưới.'

        setVoiceError(message)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript)
          .filter(Boolean)
          .join(' ')
          .trim()

        if (!transcript) {
          setVoiceError('Không nghe được nội dung khoản chi.')
          return
        }

        setVoiceText(transcript)
        handleParseVoice(transcript)
      }

      recognition.start()
    } catch {
      setIsListening(false)
      setVoiceError('Không thể khởi động microphone. Vui lòng thử lại.')
    }
  }

  const handleConfirmVoiceExpense = async () => {
    const amount = Number(voicePreview.amount)
    const category = voicePreview.category.trim() || 'Khác'
    const note = voicePreview.note.trim() || voiceText.trim()

    if (!amount || amount <= 0) {
      setVoiceError('Số tiền phải lớn hơn 0.')
      return
    }

    if (!note) {
      setVoiceError('Vui lòng nhập ghi chú hoặc tên khoản chi.')
      return
    }

    setVoiceError('')

    const adviceSignature = buildAdviceSignature({ amount, category, note })
    const hasConfirmedCurrentAdvice =
      voiceAdvice?.shouldWarn && voiceAdvice.signature === adviceSignature

    if (!hasConfirmedCurrentAdvice) {
      setIsCheckingVoiceAdvice(true)

      try {
        const recommendation = await getExpenseRecommendation({
          amount,
          category,
          note,
        })

        if (recommendation?.shouldWarn) {
          setVoiceAdvice({
            message:
              recommendation.message ||
              'Khoản chi này có thể ảnh hưởng tới mục tiêu tài chính của bạn.',
            shouldWarn: true,
            signature: adviceSignature,
          })
          return
        }

        setVoiceAdvice(null)
      } catch (recommendationError) {
        setVoiceError(
          recommendationError.message ||
            'Không thể lấy lời khuyên từ AI. Vui lòng thử lại.',
        )
        return
      } finally {
        setIsCheckingVoiceAdvice(false)
      }
    }

    setIsSavingVoice(true)

    try {
      await addTransaction({
        amount,
        category,
        note,
      })
      setVoiceAdvice(null)
      setIsVoiceModalOpen(false)
      navigate('/')
    } catch (saveError) {
      setVoiceError(saveError.message || 'Không thể lưu khoản chi.')
    } finally {
      setIsSavingVoice(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    const category = customCategory.trim() || form.category || 'Khác'
    const note = form.title.trim()

    if (!amount || amount <= 0) {
      setError('Số tiền phải lớn hơn 0.')
      return
    }
    if (!note) {
      setError('Vui lòng nhập ghi chú hoặc tên khoản chi.')
      return
    }
    if (!form.date) {
      setError('Vui lòng chọn ngày.')
      return
    }

    setError('')

    const adviceSignature = buildAdviceSignature({ amount, category, note })
    const hasConfirmedCurrentAdvice =
      expenseAdvice?.shouldWarn && expenseAdvice.signature === adviceSignature

    if (!hasConfirmedCurrentAdvice) {
      setIsCheckingAdvice(true)

      try {
        const recommendation = await getExpenseRecommendation({
          amount,
          category,
          note,
        })

        if (recommendation?.shouldWarn) {
          setExpenseAdvice({
            message:
              recommendation.message ||
              'Khoản chi này có thể ảnh hưởng tới mục tiêu tài chính của bạn.',
            shouldWarn: true,
            signature: adviceSignature,
          })
          return
        }

        setExpenseAdvice(null)
      } catch (recommendationError) {
        setError(
          recommendationError.message ||
            'Không thể lấy lời khuyên từ AI. Vui lòng thử lại.',
        )
        return
      } finally {
        setIsCheckingAdvice(false)
      }
    }

    setIsSubmitting(true)

    try {
      await addTransaction({
        amount,
        category,
        note,
      })
      setExpenseAdvice(null)
      navigate('/')
    } catch (submitError) {
      setError(submitError.message || 'Không thể lưu khoản chi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isManualBusy = isSubmitting || isCheckingAdvice
  const isVoiceBusy = isSavingVoice || isCheckingVoiceAdvice

  return (
    <AppPage
      eyebrow="Khoản chi mới"
      title="Bạn vừa chi gì?"
      description="Dùng microphone để FinMate gợi ý nhanh, hoặc nhập thủ công như trước."
    >
      <Surface className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={isVoiceParsing || isListening || isVoiceBusy}
            onClick={handleStartVoice}
            className={`tap-target flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-[0_12px_30px_rgba(15,118,110,0.22)] transition-transform disabled:cursor-not-allowed disabled:opacity-60 ${
              isListening ? 'scale-105 ring-4 ring-primary-container' : 'hover:scale-105'
            }`}
            aria-label="Ghi khoản chi bằng giọng nói"
          >
            <span
              className="material-symbols-outlined icon-fill text-[32px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>
          <div className="min-w-0">
            <h2 className="font-headline text-lg font-extrabold text-on-surface">
              Ghi bằng giọng nói
            </h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-on-surface-variant">
              Nói ví dụ: “Mua cà phê 35 nghìn”.
            </p>
          </div>
        </div>

        <TextField
          label="Nội dung giọng nói"
          multiline
          rows={3}
          disabled={isVoiceParsing || isListening}
          placeholder="Ví dụ: Mình vừa mua cà phê 35 nghìn"
          value={voiceText}
          onChange={(event) => setVoiceText(event.target.value)}
        />

        <ActionButton
          className="w-full"
          disabled={isVoiceParsing || isListening}
          icon="auto_awesome"
          onClick={() => handleParseVoice()}
        >
          {isVoiceParsing
            ? 'Đang phân tích...'
            : isListening
              ? 'Đang nghe...'
              : 'Phân tích bằng AI'}
        </ActionButton>

        {!isVoiceModalOpen && voiceError ? (
          <AlertBanner tone="error">{voiceError}</AlertBanner>
        ) : null}
      </Surface>

      <form onSubmit={handleSubmit}>
        <Surface className="space-y-5">
          <div>
            <h2 className="font-headline text-lg font-extrabold text-on-surface">
              Nhập thủ công
            </h2>
            <p className="mt-1 font-body text-sm text-on-surface-variant">
              Luồng nhập hiện có vẫn được giữ nguyên.
            </p>
          </div>

          <TextField
            label="Số tiền"
            disabled={isManualBusy}
            placeholder="0"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            inputClassName="font-headline text-2xl font-extrabold"
          />

          <div>
            <p className="mb-2 font-label text-sm font-bold text-on-surface-variant">
              Danh mục
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((category) => {
                const isSelected = form.category === category.label
                return (
                  <button
                    key={category.label}
                    type="button"
                    disabled={isManualBusy}
                    onClick={() => selectCategory(category.label)}
                    className={`min-h-12 rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isSelected
                        ? 'border-primary bg-primary-container/60 text-primary'
                        : 'border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-center gap-2 font-label text-sm font-bold">
                      <span className="material-symbols-outlined text-[20px]">
                        {category.icon}
                      </span>
                      {category.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <TextField
            label="Danh mục khác"
            disabled={isManualBusy}
            placeholder="Nhập nếu danh mục chưa có"
            value={customCategory}
            onChange={(event) => updateCustomCategory(event.target.value)}
          />

          <TextField
            label="Ngày"
            disabled={isManualBusy}
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />

          <TextField
            label="Ghi chú"
            disabled={isManualBusy}
            placeholder="Khoản chi này dùng cho việc gì?"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
          />

          {error ? <AlertBanner tone="error">{error}</AlertBanner> : null}

          {expenseAdvice?.shouldWarn ? (
            <AlertBanner tone="error">
              <span className="block font-headline text-sm font-extrabold">
                Lời khuyên từ AI
              </span>
              <span className="mt-1 block">{expenseAdvice.message}</span>
            </AlertBanner>
          ) : null}

          <ActionButton
            type="submit"
            disabled={isManualBusy}
            size="lg"
            className="w-full"
          >
            {isCheckingAdvice
              ? 'Đang kiểm tra...'
              : isSubmitting
                ? 'Đang lưu...'
                : expenseAdvice?.shouldWarn
                  ? 'Vẫn lưu khoản chi'
                  : 'Lưu khoản chi'}
          </ActionButton>
        </Surface>
      </form>

      <BottomSheet
        open={isVoiceModalOpen}
        title="Xác nhận khoản chi"
        description="Bạn có thể sửa lại trước khi lưu vào database."
        onClose={closeVoiceSheet}
        footer={
          <>
            <ActionButton
              variant="secondary"
              disabled={isVoiceBusy}
              onClick={closeVoiceSheet}
            >
              Hủy
            </ActionButton>
            <ActionButton
              disabled={isVoiceBusy}
              onClick={handleConfirmVoiceExpense}
            >
              {isCheckingVoiceAdvice
                ? 'Đang kiểm tra...'
                : isSavingVoice
                  ? 'Đang lưu...'
                  : voiceAdvice?.shouldWarn
                    ? 'Vẫn lưu khoản chi'
                    : 'Xác nhận lưu'}
            </ActionButton>
          </>
        }
      >
        <TextField
          label="Số tiền"
          disabled={isVoiceBusy}
          min="0"
          step="0.01"
          type="number"
          value={voicePreview.amount}
          onChange={(event) => updateVoicePreview('amount', event.target.value)}
        />
        <TextField
          label="Danh mục"
          disabled={isVoiceBusy}
          placeholder="Khác"
          value={voicePreview.category}
          onChange={(event) =>
            updateVoicePreview('category', event.target.value)
          }
        />
        <TextField
          label="Ghi chú"
          multiline
          rows={3}
          disabled={isVoiceBusy}
          placeholder={voiceText || 'Khoản chi này dùng cho việc gì?'}
          value={voicePreview.note}
          onChange={(event) => updateVoicePreview('note', event.target.value)}
        />
        {voiceAdvice?.shouldWarn ? (
          <AlertBanner tone="error">
            <span className="block font-headline text-sm font-extrabold">
              Lời khuyên từ AI
            </span>
            <span className="mt-1 block">{voiceAdvice.message}</span>
          </AlertBanner>
        ) : null}
        {voiceError ? <AlertBanner tone="error">{voiceError}</AlertBanner> : null}
      </BottomSheet>
    </AppPage>
  )
}
