import { motion } from 'framer-motion'
import styles from './Button.module.scss'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  fullWidth = false,
  size = 'md',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[styles.btn, styles[variant], styles[size], fullWidth ? styles.full : ''].join(' ')}
      whileHover={{ opacity: disabled || loading ? 1 : 0.85 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </motion.button>
  )
}
