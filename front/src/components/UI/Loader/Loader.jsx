import styles from './Loader.module.scss'

export default function Loader({ size = 'md', text }) {
  return (
    <div className={styles.wrap}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )
}
