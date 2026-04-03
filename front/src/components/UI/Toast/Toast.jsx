import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Toast.module.scss'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [message, onClose])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`${styles.toast} ${styles[type]}`}
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <span className={styles.icon}>
            {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className={styles.msg}>{message}</span>
          <button className={styles.close} onClick={onClose} aria-label="Закрыть">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
