import { motion } from 'framer-motion'
import styles from './AuthCard.module.scss'

export default function AuthCard({ children }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  )
}
