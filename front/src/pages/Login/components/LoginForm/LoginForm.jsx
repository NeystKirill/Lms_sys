import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { AnimatePresence, motion } from 'framer-motion'
import { loginRequest } from '../../../../api/auth'
import useAuthStore from '../../../../store/authStore'
import FormField from '../../../../components/UI/FormField/FormField'
import Button from '../../../../components/UI/Button/Button'
import styles from './LoginForm.module.scss'

const schema = yup.object({
  email: yup.string().email('Некорректный email').required('Введите email'),
  password: yup.string().min(6, 'Минимум 6 символов').required('Введите пароль'),
})

export default function LoginForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError('')
    try {
      const res = await loginRequest(data)
      const { token, user } = res.data
      setAuth(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.response?.data?.message || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <FormField
        label="Email"
        type="email"
        placeholder="your@email.kz"
        error={errors.email?.message}
        register={register('email')}
      />
      <FormField
        label="Пароль"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        register={register('password')}
      />

      <AnimatePresence>
        {serverError && (
          <motion.p
            className={styles.err}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {serverError}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" loading={loading} fullWidth size="lg">
        Войти
      </Button>

      <p className={styles.footer}>
        Нет аккаунта?{' '}
        <Link to="/register" className={styles.link}>Регистрация</Link>
      </p>
    </form>
  )
}
