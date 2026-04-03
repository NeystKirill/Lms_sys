import styles from './PageWrapper.module.scss'

export default function PageWrapper({ children }) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
