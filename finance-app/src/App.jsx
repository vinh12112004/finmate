import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { MainLayout } from './components/layout/MainLayout'
import { AuthProvider } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import { AddExpensePage } from './pages/AddExpensePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { DashboardPage } from './pages/DashboardPage'
import { GoalsPage } from './pages/GoalsPage'
import { HistoryPage } from './pages/HistoryPage'
import { LoginPage } from './pages/LoginPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'add-expense', element: <AddExpensePage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'goals', element: <GoalsPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <RouterProvider router={router} />
      </FinanceProvider>
    </AuthProvider>
  )
}

export default App
