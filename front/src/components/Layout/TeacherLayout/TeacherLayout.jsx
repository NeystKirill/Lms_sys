import Navbar from '../Navbar/Navbar'
import styles from './TeacherLayout.module.scss'

export default function TeacherLayout({ children }) {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.main} role="main">
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
