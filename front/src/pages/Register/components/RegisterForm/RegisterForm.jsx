import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { AnimatePresence, motion } from 'framer-motion'
import { registerRequest } from '../../../../api/auth'
import FormField from '../../../../components/UI/FormField/FormField'
import Button from '../../../../components/UI/Button/Button'
import styles from './RegisterForm.module.scss'

const schema = yup.object({
  name: yup.string().min(2, 'Минимум 2 символа').required('Введите имя'),
  email: yup.string().email('Некорректный email').required('Введите email'),
  password: yup.string().min(6, 'Минимум 6 символов').required('Введите пароль'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Пароли не совпадают').required('Подтвердите пароль'),
})

export default function RegisterForm() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      await registerRequest({ name: data.name, email: data.email, password: data.password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div className={styles.success} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span className={styles.check}>✓</span>
        <p>Аккаунт создан. Перенаправляем...</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <FormField label="Имя" type="text" placeholder="Кирилл Кадыров"
        error={errors.name?.message} register={register('name')} />
      <FormField label="Email" type="email" placeholder="your@email.kz"
        error={errors.email?.message} register={register('email')} />
      <FormField label="Пароль" type="password" placeholder="••••••••"
        error={errors.password?.message} register={register('password')} />
      <FormField label="Подтверждение" type="password" placeholder="••••••••"
        error={errors.confirmPassword?.message} register={register('confirmPassword')} />

      <AnimatePresence>
        {serverError && (
          <motion.p className={styles.err}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {serverError}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" loading={loading} fullWidth size="lg">Зарегистрироваться</Button>

      <p className={styles.footer}>
        Уже есть аккаунт? <Link to="/login" className={styles.link}>Войти</Link>
      </p>
    </form>
  )
}
