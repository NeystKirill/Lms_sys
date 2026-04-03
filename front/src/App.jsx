import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import useAuthStore from './store/authStore'

import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Materials from './pages/Materials/Materials'
import Attendance from './pages/Attendance/Attendance'
import Profile from './pages/Profile/Profile'
import Manage from './pages/Manage/Manage'
import NoAccess from './pages/NoAccess/NoAccess'
import NotFound from './pages/NotFound/NotFound'

const RoleRedirect = () => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to="/dashboard" replace />
}

const Private = ({ children, roles }) => (
  <ProtectedRoute allowedRoles={roles || ['student', 'teacher', 'admin']}>
    {children}
  </ProtectedRoute>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/no-access" element={<NoAccess />} />
        <Route path="/" element={<RoleRedirect />} />

        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/materials" element={<Private><Materials /></Private>} />
        <Route path="/attendance" element={<Private><Attendance /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />
        <Route
          path="/manage"
          element={<Private roles={['teacher', 'admin']}><Manage /></Private>}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
