import { Link } from 'react-router-dom'
import styles from './NotFound.module.scss'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <p className={styles.msg}>Страница не найдена</p>
      <Link to="/" className={styles.link}>На главную</Link>
    </div>
  )
}
