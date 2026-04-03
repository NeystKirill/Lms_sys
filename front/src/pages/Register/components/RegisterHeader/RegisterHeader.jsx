import logo from '../../../../assets/logo.png'
import styles from './RegisterHeader.module.scss'

export default function RegisterHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.logoRow}>
        <img src={logo} alt="LMS Logo" className={styles.logo} />
        <span className={styles.logoText}>LMS</span>
      </div>
      <h1 className={styles.title}>Регистрация</h1>
      <p className={styles.sub}>Создайте аккаунт</p>
    </div>
  )
}
