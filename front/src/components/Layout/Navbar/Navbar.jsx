import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import useAuthStore from '../../../store/authStore'
import useThemeStore from '../../../store/themeStore'
import logo from '../../../assets/logo.png'
import styles from './Navbar.module.scss'

const NAV_LINKS = {
  student: [
    { to: '/dashboard', label: 'Расписание' },
    { to: '/materials', label: 'Материалы' },
    { to: '/attendance', label: 'Посещаемость' },
  ],
  teacher: [
    { to: '/dashboard', label: 'Расписание' },
    { to: '/materials', label: 'Материалы' },
    { to: '/attendance', label: 'Посещаемость' },
    { to: '/manage', label: 'Управление' },
  ],
  admin: [
    { to: '/dashboard', label: 'Расписание' },
    { to: '/materials', label: 'Материалы' },
    { to: '/attendance', label: 'Посещаемость' },
    { to: '/manage', label: 'Управление' },
  ],
}

const ROLE_LABELS = { student: 'Студент', teacher: 'Учитель', admin: 'Админ' }

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = NAV_LINKS[user?.role] || NAV_LINKS.student

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={styles.header} role="banner">
      <nav className={styles.navbar} role="navigation" aria-label="Основная навигация">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <NavLink to="/dashboard" className={styles.logoLink} aria-label="Главная">
              <img src={logo} alt="LMS Logo" className={styles.logoImg} />
              <span className={styles.logoText}>LMS</span>
            </NavLink>
          </div>

          <ul className={styles.navList} role="list">
            {links.map((link) => (
              <li key={link.to} role="listitem">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button
              className={styles.themeBtn}
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              {theme === 'dark' ? '☀' : '●'}
            </button>

            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</span>
                <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                <span className={`${styles.chevron} ${menuOpen ? styles.up : ''}`}>▾</span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className={styles.dropdown}
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={styles.dropUser}>
                      <div className={styles.dropAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className={styles.dropName}>{user?.name}</p>
                        <span className={`${styles.dropRole} ${styles[user?.role]}`}>
                          {ROLE_LABELS[user?.role]}
                        </span>
                      </div>
                    </div>
                    <div className={styles.dropDivider} />
                    <button role="menuitem" className={styles.dropItem}
                      onClick={() => { navigate('/profile'); setMenuOpen(false) }}>
                      Профиль
                    </button>
                    <button role="menuitem" className={`${styles.dropItem} ${styles.dropOut}`}
                      onClick={handleLogout}>
                      Выйти
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
