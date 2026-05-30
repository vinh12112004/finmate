import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader, IconButton } from '../ui'
import { useAuth } from '../../hooks/useAuth'

const routeTitles = {
  '/': { title: 'FinMate', subtitle: 'Tổng quan hôm nay' },
  '/add-expense': { title: 'Khoản chi mới', subtitle: 'Nhập tay hoặc dùng giọng nói' },
  '/analytics': { title: 'Phân tích', subtitle: 'Xu hướng chi tiêu' },
  '/goals': { title: 'Mục tiêu', subtitle: 'Tiến độ tiết kiệm' },
  '/history': { title: 'Lịch sử', subtitle: 'Các khoản chi đã lưu' },
  '/notifications': { title: 'Cảnh báo', subtitle: 'Theo dõi ngân sách' },
  '/settings': { title: 'Cài đặt', subtitle: 'Tùy chọn tài chính' },
}

export function TopAppBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const route = routeTitles[location.pathname] || routeTitles['/']
  const isAddPage = location.pathname === '/add-expense'
  const initials = (user?.username || 'F').trim().slice(0, 1).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppHeader
      title={route.title}
      subtitle={route.subtitle}
      leading={
        isAddPage ? (
          <IconButton icon="arrow_back" label="Quay lại" onClick={() => navigate(-1)} />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary font-headline text-base font-extrabold">
            {initials}
          </div>
        )
      }
      actions={
        <>
          <IconButton icon="settings" label="Cài đặt" to="/settings" />
          <IconButton icon="logout" label="Đăng xuất" onClick={handleLogout} />
        </>
      }
    />
  )
}
