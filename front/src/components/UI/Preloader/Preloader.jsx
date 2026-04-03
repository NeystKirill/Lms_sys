import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../../assets/logo.png'
import styles from './Preloader.module.scss'

export default function Preloader({ onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 500)
    }, 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.preloader}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className={styles.logoWrap}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logo} alt="LMS" className={styles.logo} />
          </motion.div>

          <motion.div
            className={styles.textRow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {['L', 'M', 'S'].map((l, i) => (
              <motion.span
                key={l}
                className={styles.letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {l}
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            className={styles.sub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            Система управления обучением
          </motion.p>

          <motion.div
            className={styles.bar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1.1, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
