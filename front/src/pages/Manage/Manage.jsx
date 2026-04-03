import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import useLayout from '../../utils/useLayout'
import Modal from '../../components/UI/Modal/Modal'
import Toast from '../../components/UI/Toast/Toast'
import Button from '../../components/UI/Button/Button'
import FormField from '../../components/UI/FormField/FormField'
import Loader from '../../components/UI/Loader/Loader'
import { getUsers, createUser, updateUser, deleteUser, getGroups } from '../../api/manage'
import { getWeekSchedule, getScheduleOptions, cancelLesson, restoreLesson, replaceLesson } from '../../api/schedule'
import styles from './Manage.module.scss'

const ROLE_LABELS = { student: 'Студент', teacher: 'Учитель', admin: 'Администратор' }
const DAY_NAMES_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const userSchema = yup.object({
  name: yup.string().min(2, 'Минимум 2 символа').required('Введите имя'),
  email: yup.string().email('Некорректный email').required('Введите email'),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (s) => s.min(6, 'Минимум 6 символов').required('Введите пароль'),
    otherwise: (s) => s.optional(),
  }),
  role: yup.string().oneOf(['student', 'teacher', 'admin']).required('Выберите роль'),
})

export default function Manage() {
  const { user: currentUser } = useAuthStore()
  const Layout = useLayout()
  const isAdmin = currentUser?.role === 'admin'

  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [saving, setSaving] = useState(false)

  const showToast = (message, type = 'success') => setToast({ message, type })

  useEffect(() => {
    setLoading(true)
    Promise.all([getUsers(), getGroups()])
      .then(([u, g]) => {
        setUsers(u.data.users || [])
        setGroups(g.data.groups || [])
      })
      .catch(() => showToast('Ошибка загрузки данных', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleCreate = async (data) => {
    setSaving(true)
    try {
      const res = await createUser(data)
      setUsers((prev) => [...prev, { ...res.data.user, _id: res.data.user.id }])
      setAddModal(false)
      showToast('Пользователь создан')
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (data) => {
    setSaving(true)
    try {
      const res = await updateUser(editModal._id, data)
      setUsers((prev) => prev.map((u) => u._id === editModal._id ? res.data.user : u))
      setEditModal(null)
      showToast('Данные обновлены')
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteUser(deleteConfirm._id)
      setUsers((prev) => prev.filter((u) => u._id !== deleteConfirm._id))
      setDeleteConfirm(null)
      showToast('Пользователь удалён')
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка', 'error')
    }
  }

  const TABS = [
    { key: 'users', label: `👥 Пользователи (${users.length})` },
    { key: 'groups', label: `🏫 Группы (${groups.length})` },
    ...(isAdmin ? [{ key: 'schedule', label: '📅 Расписание' }] : []),
  ]

  return (
    <Layout>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Управление</h1>
            <p className={styles.sub}>{isAdmin ? 'Полный контроль системы' : 'Просмотр пользователей и групп'}</p>
          </div>
          {isAdmin && tab === 'users' && (
            <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>
              + Добавить пользователя
            </Button>
          )}
        </header>

        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.center}><Loader size="md" text="Загружаем данные..." /></div>
        ) : tab === 'users' ? (
          <UsersTab
            filteredUsers={filteredUsers}
            currentUser={currentUser}
            isAdmin={isAdmin}
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            setEditModal={setEditModal}
            setDeleteConfirm={setDeleteConfirm}
          />
        ) : tab === 'groups' ? (
          <GroupsTab groups={groups} />
        ) : (
          <ScheduleTab showToast={showToast} />
        )}
      </div>

      <UserModal open={addModal} onClose={() => setAddModal(false)} onSubmit={handleCreate} saving={saving} title="Добавить пользователя" isEdit={false} />
      <UserModal open={!!editModal} onClose={() => setEditModal(null)} onSubmit={handleEdit} saving={saving} title="Редактировать пользователя" defaultValues={editModal} isEdit={true} />

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Подтверждение" size="sm">
        <div className={styles.confirmBody}>
          <p className={styles.confirmText}>
            Удалить пользователя <strong>{deleteConfirm?.name}</strong>? Это действие нельзя отменить.
          </p>
          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="danger" onClick={handleDelete}>Удалить</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </Layout>
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────
function UsersTab({ filteredUsers, currentUser, isAdmin, search, setSearch, roleFilter, setRoleFilter, setEditModal, setDeleteConfirm }) {
  return (
    <section>
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.roleSelect} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Все роли</option>
          <option value="student">Студенты</option>
          <option value="teacher">Учителя</option>
          <option value="admin">Администраторы</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Роль</th>
              {isAdmin && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={isAdmin ? 4 : 3} className={styles.emptyCell}>Пользователи не найдены</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.tableRow}>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.userAvatar}>{u.name[0]}</span>
                      <span className={styles.userName}>{u.name}</span>
                      {u._id === currentUser?.id && <span className={styles.youBadge}>Вы</span>}
                    </div>
                  </td>
                  <td className={styles.emailCell}>{u.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.editBtn} onClick={() => setEditModal(u)}>Изменить</button>
                        {u._id !== currentUser?.id && (
                          <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(u)}>Удалить</button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Groups tab ───────────────────────────────────────────────────────────────
function GroupsTab({ groups }) {
  return (
    <section>
      <div className={styles.groupGrid}>
        {groups.map((g) => (
          <article key={g._id} className={styles.groupCard}>
            <header className={styles.groupHeader}>
              <h2 className={styles.groupName}>{g.name}</h2>
              <span className={styles.groupCount}>{g.students?.length} студентов</span>
            </header>
            <div className={styles.groupBody}>
              <div className={styles.groupSection}>
                <p className={styles.groupSectionLabel}>Студенты</p>
                <ul className={styles.memberList}>
                  {(g.students || []).map((s) => (
                    <li key={s._id} className={styles.memberItem}>
                      <span className={styles.memberAvatar}>{s.name[0]}</span>
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.groupSection}>
                <p className={styles.groupSectionLabel}>Учителя</p>
                <ul className={styles.memberList}>
                  {(g.teachers || []).map((t) => (
                    <li key={t.teacherId?._id} className={styles.memberItem}>
                      <span className={styles.memberAvatar}>{t.teacherId?.name?.[0]}</span>
                      <div>
                        <span>{t.teacherId?.name}</span>
                        <span className={`${styles.teacherRole} ${t.role === 'main' ? styles.main : ''}`}>
                          {t.role === 'main' ? 'Куратор' : 'Учитель'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// ─── Schedule tab (admin only) ────────────────────────────────────────────────
function ScheduleTab({ showToast }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState({ subjects: [], teachers: [] })
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [actionModal, setActionModal] = useState(null) // 'cancel' | 'replace'
  const [actionSaving, setActionSaving] = useState(false)
  const [replaceForm, setReplaceForm] = useState({ subjectId: '', teacherId: '', statusNote: '', topic: '' })
  const [cancelNote, setCancelNote] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getWeekSchedule(weekOffset), getScheduleOptions()])
      .then(([sched, opts]) => {
        setDays(sched.data.days || [])
        setOptions(opts.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [weekOffset])

  const refreshSchedule = () => {
    getWeekSchedule(weekOffset).then((r) => setDays(r.data.days || [])).catch(() => {})
  }

  const handleCancel = async () => {
    setActionSaving(true)
    try {
      await cancelLesson(selectedLesson._id, cancelNote)
      setActionModal(null)
      setSelectedLesson(null)
      setCancelNote('')
      showToast('Пара отменена')
      refreshSchedule()
    } catch {
      showToast('Ошибка', 'error')
    } finally {
      setActionSaving(false)
    }
  }

  const handleRestore = async (lesson) => {
    try {
      await restoreLesson(lesson._id)
      showToast('Пара восстановлена')
      refreshSchedule()
    } catch {
      showToast('Ошибка', 'error')
    }
  }

  const handleReplace = async () => {
    setActionSaving(true)
    try {
      const data = {}
      if (replaceForm.subjectId) data.subjectId = replaceForm.subjectId
      if (replaceForm.teacherId) data.teacherId = replaceForm.teacherId
      if (replaceForm.topic) data.topic = replaceForm.topic
      if (replaceForm.statusNote) data.statusNote = replaceForm.statusNote
      await replaceLesson(selectedLesson._id, data)
      setActionModal(null)
      setSelectedLesson(null)
      setReplaceForm({ subjectId: '', teacherId: '', statusNote: '', topic: '' })
      showToast('Пара изменена')
      refreshSchedule()
    } catch {
      showToast('Ошибка', 'error')
    } finally {
      setActionSaving(false)
    }
  }

  const monday = (() => {
    const d = new Date(); const day = d.getDay()
    d.setDate(d.getDate() - ((day + 6) % 7) + weekOffset * 7)
    d.setHours(0, 0, 0, 0); return d
  })()
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const weekLabel = weekOffset === 0 ? 'Эта неделя' : weekOffset === 1 ? 'Следующая' : weekOffset === -1 ? 'Прошлая' : `${weekOffset > 0 ? '+' : ''}${weekOffset} нед.`

  return (
    <section>
      <div className={styles.schedWeekNav}>
        <button className={styles.schedNavBtn} onClick={() => setWeekOffset((o) => o - 1)}>← Назад</button>
        <div className={styles.schedWeekLabel}>
          <strong>{weekLabel}</strong>
          <span>
            {monday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} —{' '}
            {friday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <button className={styles.schedNavBtn} onClick={() => setWeekOffset((o) => o + 1)}>Вперёд →</button>
      </div>

      {loading ? (
        <div className={styles.center}><Loader size="md" /></div>
      ) : days.length === 0 ? (
        <p className={styles.emptyCell}>Расписание не найдено</p>
      ) : (
        <div className={styles.schedGrid}>
          {days.map((day) => (
            <div key={day.date} className={styles.schedDay}>
              <div className={styles.schedDayHeader}>
                <span className={styles.schedDayName}>
                  {DAY_NAMES_SHORT[new Date(day.date).getDay()]}
                </span>
                <span className={styles.schedDayDate}>
                  {new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className={styles.schedLessons}>
                {(day.lessons || []).map((lesson) => (
                  <div
                    key={lesson._id}
                    className={`${styles.schedLesson} ${lesson.status === 'cancelled' ? styles.schedLessonCancelled : ''} ${lesson.status === 'replaced' ? styles.schedLessonReplaced : ''}`}
                  >
                    <div className={styles.schedLessonHead}>
                      <span className={styles.schedLessonNum}>{lesson.lessonNumber}</span>
                      <span className={styles.schedLessonTime}>{lesson.startTime}–{lesson.endTime}</span>
                      {lesson.status === 'cancelled' && <span className={styles.schedTag + ' ' + styles.schedTagCancel}>Отменена</span>}
                      {lesson.status === 'replaced' && <span className={styles.schedTag + ' ' + styles.schedTagReplace}>Замена</span>}
                    </div>
                    <p className={styles.schedSubj}>{lesson.subjectId?.name}</p>
                    <p className={styles.schedTopic}>{lesson.topic}</p>
                    <p className={styles.schedTeacher}>{lesson.teacherId?.name}</p>
                    {lesson.statusNote && <p className={styles.schedNote}>{lesson.statusNote}</p>}

                    <div className={styles.schedActions}>
                      {lesson.status === 'cancelled' ? (
                        <button className={styles.schedRestoreBtn} onClick={() => handleRestore(lesson)}>
                          ↺ Восстановить
                        </button>
                      ) : (
                        <>
                          <button
                            className={styles.schedCancelBtn}
                            onClick={() => { setSelectedLesson(lesson); setCancelNote(''); setActionModal('cancel') }}
                          >
                            ✕ Отменить
                          </button>
                          <button
                            className={styles.schedReplaceBtn}
                            onClick={() => {
                              setSelectedLesson(lesson)
                              setReplaceForm({ subjectId: '', teacherId: '', statusNote: '', topic: '' })
                              setActionModal('replace')
                            }}
                          >
                            ⇄ Замена
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      <Modal open={actionModal === 'cancel'} onClose={() => setActionModal(null)} title="Отменить пару" size="sm">
        <p className={styles.modalDesc}>
          Отменить пару <strong>№{selectedLesson?.lessonNumber}</strong> — {selectedLesson?.subjectId?.name}?
        </p>
        <div className={styles.formField} style={{ marginBottom: 20 }}>
          <label className={styles.formLabel}>Причина (необязательно)</label>
          <input
            className={styles.formInput}
            placeholder="Напр.: болезнь преподавателя"
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
          />
        </div>
        <div className={styles.confirmActions}>
          <Button variant="secondary" onClick={() => setActionModal(null)}>Отмена</Button>
          <Button variant="danger" onClick={handleCancel} loading={actionSaving}>Отменить пару</Button>
        </div>
      </Modal>

      {/* Replace modal */}
      <Modal open={actionModal === 'replace'} onClose={() => setActionModal(null)} title="Заменить пару">
        <p className={styles.modalDesc}>
          Изменить параметры пары <strong>№{selectedLesson?.lessonNumber}</strong> — {selectedLesson?.subjectId?.name}
        </p>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Новый предмет (оставьте пустым для без изменений)</label>
            <select
              className={styles.formSelect}
              value={replaceForm.subjectId}
              onChange={(e) => setReplaceForm((f) => ({ ...f, subjectId: e.target.value }))}
            >
              <option value="">— Без изменений —</option>
              {options.subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Новый преподаватель</label>
            <select
              className={styles.formSelect}
              value={replaceForm.teacherId}
              onChange={(e) => setReplaceForm((f) => ({ ...f, teacherId: e.target.value }))}
            >
              <option value="">— Без изменений —</option>
              {options.teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Новая тема</label>
            <input
              className={styles.formInput}
              placeholder="Тема замены..."
              value={replaceForm.topic}
              onChange={(e) => setReplaceForm((f) => ({ ...f, topic: e.target.value }))}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Причина замены</label>
            <input
              className={styles.formInput}
              placeholder="Напр.: замещение"
              value={replaceForm.statusNote}
              onChange={(e) => setReplaceForm((f) => ({ ...f, statusNote: e.target.value }))}
            />
          </div>
        </div>
        <div className={styles.confirmActions} style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setActionModal(null)}>Отмена</Button>
          <Button variant="primary" onClick={handleReplace} loading={actionSaving}>Применить замену</Button>
        </div>
      </Modal>
    </section>
  )
}

// ─── User Modal ───────────────────────────────────────────────────────────────
function UserModal({ open, onClose, onSubmit, saving, title, defaultValues, isEdit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEdit },
    defaultValues: defaultValues || { role: 'student' },
  })

  useEffect(() => {
    if (open) reset(defaultValues || { role: 'student' })
  }, [open, defaultValues, reset])

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          <FormField label="Имя" placeholder="Иванов Иван" error={errors.name?.message} register={register('name')} />
          <FormField label="Email" type="email" placeholder="user@lms.kz" error={errors.email?.message} register={register('email')} />
          {!isEdit && (
            <FormField label="Пароль" type="password" placeholder="••••••••" error={errors.password?.message} register={register('password')} />
          )}
          <div className={styles.formField}>
            <label className={styles.formLabel}>Роль</label>
            <select className={styles.formSelect} {...register('role')} aria-invalid={!!errors.role}>
              <option value="student">Студент</option>
              <option value="teacher">Учитель</option>
              <option value="admin">Администратор</option>
            </select>
            {errors.role && <span className={styles.formError}>{errors.role.message}</span>}
          </div>
        </div>
        <div className={styles.modalActions}>
          <Button variant="secondary" type="button" onClick={onClose}>Отмена</Button>
          <Button variant="primary" type="submit" loading={saving}>
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
