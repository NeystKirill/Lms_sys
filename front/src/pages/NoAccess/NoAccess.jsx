import { Link } from 'react-router-dom'
import styles from './NoAccess.module.scss'

export default function NoAccess() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>403</span>
      <p className={styles.msg}>Нет доступа</p>
      <Link to="/" className={styles.link}>На главную</Link>
    </div>
  )
}
