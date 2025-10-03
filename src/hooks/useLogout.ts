import { useAuth } from '@/contexts/AuthContext'

export const useLogout = () => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return { logout: handleLogout }
}
