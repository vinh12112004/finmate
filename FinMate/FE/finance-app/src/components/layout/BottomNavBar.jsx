import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'grid_view', label: 'Trang chủ', end: true },
  { to: '/history', icon: 'receipt_long', label: 'Lịch sử' },
  { to: '/add-expense', icon: 'add_circle', label: 'Thêm' },
  { to: '/goals', icon: 'flag', label: 'Mục tiêu' },
  { to: '/analytics', icon: 'insights', label: 'Phân tích' },
  { to: '/notifications', icon: 'notifications', label: 'Cảnh báo' },
]

export function BottomNavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-safe">
      <div className="mx-auto mb-3 flex max-w-md items-center justify-between rounded-xl border border-outline-variant/70 bg-surface-container-lowest/95 px-2 py-2 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'tap-target flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-0.5 py-1.5 transition-colors',
                item.to === '/add-expense'
                  ? isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-primary-container/55 text-primary hover:bg-primary-container'
                  : isActive
                    ? 'bg-surface-container-high text-primary'
                    : 'text-on-surface-variant hover:text-primary',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-[21px]"
                  style={{ fontVariationSettings: `"FILL" ${isActive ? 1 : 0}` }}
                >
                  {item.icon}
                </span>
                <span className="mt-0.5 truncate font-label text-[9px] font-bold">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
