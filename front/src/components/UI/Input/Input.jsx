import styles from './Input.module.scss'

export default function Input({ type = 'text', placeholder, error = false, register, ...rest }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`${styles.input} ${error ? styles.error : ''}`}
      {...(register || {})}
      {...rest}
    />
  )
}
