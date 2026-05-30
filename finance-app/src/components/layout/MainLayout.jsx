import { Outlet } from 'react-router-dom'
import { BottomNavBar } from './BottomNavBar'
import { TopAppBar } from './TopAppBar'

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-on-surface font-body antialiased">
      <TopAppBar />
      <Outlet />
      <BottomNavBar />
    </div>
  )
}
