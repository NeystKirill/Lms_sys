import logo from '../../../../assets/logo.png'
import styles from './LoginHeader.module.scss'

export default function LoginHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.logoRow}>
        <img src={logo} alt="LMS Logo" className={styles.logo} />
        <span className={styles.logoText}>LMS</span>
      </div>
      <h1 className={styles.title}>Вход в систему</h1>
      <p className={styles.sub}>Колледж ПО2406</p>
    </div>
  )
}
