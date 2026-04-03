import useAuthStore from '../../store/authStore'
import useLayout from '../../utils/useLayout'
import WeekSchedule from './components/WeekSchedule/WeekSchedule'
import styles from './Dashboard.module.scss'

const ROLE_GREETINGS = {
  student: (name) => `Привет, ${name} 👋`,
  teacher: (name) => `Добрый день, ${name}`,
  admin: () => 'Расписание',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const Layout = useLayout()
  const canEdit = user?.role === 'teacher' || user?.role === 'admin'
  const greeting = ROLE_GREETINGS[user?.role] || ROLE_GREETINGS.student
  const firstName = user?.name?.split(' ').slice(-1)[0] || user?.name

  return (
    <Layout>
      <div className={styles.page}>
        <section className={styles.hero} aria-label="Заголовок страницы">
          <div>
            <h1 className={styles.title}>{greeting(firstName)}</h1>
            <p className={styles.sub}>
              {user?.role === 'student' ? 'Группа ПО2406' :
               user?.role === 'teacher' ? 'Расписание занятий' :
               'Управление расписанием'}
            </p>
          </div>
          {canEdit && (
            <div className={styles.heroBadge}>
              <span className={`${styles.roleDot} ${styles[user?.role]}`} />
              {user?.role === 'teacher' ? 'Режим учителя' : 'Режим администратора'}
            </div>
          )}
        </section>

        <section aria-label="Расписание на неделю">
          <WeekSchedule canEdit={canEdit} />
        </section>
      </div>
    </Layout>
  )
}
