import Navbar from '../Navbar/Navbar'
import styles from './StudentLayout.module.scss'

export default function StudentLayout({ children }) {
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
