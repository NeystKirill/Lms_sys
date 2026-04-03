import { AnimatePresence, motion } from 'framer-motion'
import Input from '../Input/Input'
import styles from './FormField.module.scss'

export default function FormField({ label, type = 'text', placeholder, error, register }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <Input type={type} placeholder={placeholder} error={!!error} register={register} />
      <AnimatePresence>
        {error && (
          <motion.span
            className={styles.error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
