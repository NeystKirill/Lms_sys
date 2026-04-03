import useAuthStore from '../store/authStore'
import StudentLayout from '../components/Layout/StudentLayout/StudentLayout'
import TeacherLayout from '../components/Layout/TeacherLayout/TeacherLayout'
import AdminLayout from '../components/Layout/AdminLayout/AdminLayout'

const LAYOUTS = {
  student: StudentLayout,
  teacher: TeacherLayout,
  admin: AdminLayout,
}

export default function useLayout() {
  const { user } = useAuthStore()
  return LAYOUTS[user?.role] || StudentLayout
}
