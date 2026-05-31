import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContextValue'

const authStorageKey = 'authUser'
const loginUrl = '/api/auth/login'
const registerUrl = '/api/auth/register'

function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem(authStorageKey)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function validateUser(data, action = 'đăng nhập') {
  if (!data || typeof data.username !== 'string' || data.id === undefined) {
    throw new Error(`Phản hồi ${action} không hợp lệ.`)
  }

  return {
    id: data.id,
    username: data.username,
  }
}

async function submitAuthRequest(url, credentials, messages) {
  let response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new Error(messages.connection)
  }

  if (!response.ok) {
    const responseText = await response.text()

    if (
      response.status === 400 &&
      responseText.toLowerCase().includes('already exists')
    ) {
      throw new Error('Tên đăng nhập đã tồn tại.')
    }

    throw new Error(messages.failure)
  }

  return validateUser(await response.json(), messages.action)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const persistUser = useCallback((nextUser) => {
    window.localStorage.setItem(authStorageKey, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }, [])

  const login = useCallback(async ({ username, password }) => {
    const nextUser = await submitAuthRequest(
      loginUrl,
      { username, password },
      {
        action: 'đăng nhập',
        connection: 'Không thể kết nối tới máy chủ đăng nhập.',
        failure: 'Tên đăng nhập hoặc mật khẩu không đúng.',
      },
    )

    return persistUser(nextUser)
  }, [persistUser])

  const register = useCallback(async ({ username, password }) => {
    const nextUser = await submitAuthRequest(
      registerUrl,
      { username, password },
      {
        action: 'đăng ký',
        connection: 'Không thể kết nối tới máy chủ đăng ký.',
        failure: 'Đăng ký thất bại. Vui lòng thử lại.',
      },
    )

    return persistUser(nextUser)
  }, [persistUser])

  const logout = useCallback(() => {
    window.localStorage.removeItem(authStorageKey)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
