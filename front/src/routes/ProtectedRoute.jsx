import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, checkTokenValid, user } = useAuthStore()

  if (!isAuthenticated || !checkTokenValid()) {
    return <Navigate to="/login" replace />
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-access" replace />
  }

  return children
}

export default ProtectedRoute
