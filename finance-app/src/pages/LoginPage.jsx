import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActionButton, AlertBanner, Surface, TextField } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegisterMode = mode === 'register'

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const switchMode = () => {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
    setError('')
    setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const username = form.username.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword

    if (!username) {
      setError('Vui lòng nhập tên đăng nhập.')
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.')
      return
    }

    if (isRegisterMode && password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const authAction = isRegisterMode ? register : login
      await authAction({ username, password })
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (authError) {
      setError(
        authError.message ||
          (isRegisterMode
            ? 'Đăng ký thất bại. Vui lòng thử lại.'
            : 'Đăng nhập thất bại. Vui lòng thử lại.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-8 text-on-surface font-body">
      <section className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-on-primary">
            <span className="material-symbols-outlined icon-fill text-[30px]">
              account_balance_wallet
            </span>
          </div>
          <p className="font-label text-xs font-bold uppercase text-on-surface-variant">
            FinMate
          </p>
          <h1 className="mt-2 font-headline text-3xl font-extrabold text-on-background">
            {isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập'}
          </h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-on-surface-variant">
            {isRegisterMode
              ? 'Tạo tài khoản để bắt đầu theo dõi ngân sách cá nhân.'
              : 'Tiếp tục quản lý chi tiêu với FinMate.'}
          </p>
        </div>

        <Surface>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
            />

            <TextField
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              disabled={isSubmitting}
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />

            {isRegisterMode ? (
              <TextField
                autoComplete="new-password"
                disabled={isSubmitting}
                label="Nhập lại mật khẩu"
                placeholder="Nhập lại mật khẩu"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
              />
            ) : null}

            {error ? <AlertBanner tone="error">{error}</AlertBanner> : null}

            <ActionButton
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full"
            >
              {isSubmitting
                ? isRegisterMode
                  ? 'Đang tạo tài khoản...'
                  : 'Đang đăng nhập...'
                : isRegisterMode
                  ? 'Tạo tài khoản'
                  : 'Đăng nhập'}
            </ActionButton>
          </form>
        </Surface>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={switchMode}
          className="mx-auto block min-h-11 rounded-full px-4 font-label text-sm font-bold text-primary transition-colors hover:bg-primary-container/45 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRegisterMode
            ? 'Đã có tài khoản? Đăng nhập'
            : 'Chưa có tài khoản? Đăng ký'}
        </button>
      </section>
    </main>
  )
}
