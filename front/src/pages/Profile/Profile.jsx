import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useAuthStore from '../../store/authStore'
import useLayout from '../../utils/useLayout'
import FormField from '../../components/UI/FormField/FormField'
import Button from '../../components/UI/Button/Button'
import Toast from '../../components/UI/Toast/Toast'
import Loader from '../../components/UI/Loader/Loader'
import { getMyAttendance } from '../../api/attendance'
import { getMyGrades } from '../../api/grades'
import { getGroupAttendance } from '../../api/attendance'
import { getGroupGrades } from '../../api/grades'
import styles from './Profile.module.scss'

const ROLE_LABELS = { student: 'Студент', teacher: 'Учитель', admin: 'Администратор' }

const schema = yup.object({
  name: yup.string().min(2, 'Минимум 2 символа').required('Введите имя'),
})

export default function Profile() {
  const { user } = useAuthStore()
  const Layout = useLayout()

  if (user?.role === 'admin') return <Layout><AdminProfile /></Layout>
  if (user?.role === 'teacher') return <Layout><TeacherProfile /></Layout>
  return <Layout><StudentProfile /></Layout>
}

// ─── Student Profile ────────────────────────────────────────────────────────

function StudentProfile() {
  const { user, setAuth, token } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [attendance, setAttendance] = useState(null)
  const [grades, setGrades] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: user?.name || '' },
  })

  useEffect(() => {
    Promise.all([getMyAttendance(), getMyGrades()])
      .then(([a, g]) => {
        setAttendance(a.data)
        setGrades(g.data)
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setAuth(token, { ...user, name: data.name })
    setSaving(false)
    setEditing(false)
    setToast({ message: 'Имя обновлено', type: 'success' })
  }

  const pct = attendance?.percent ?? 0
  const avg = grades?.average

  // Build subject grade map
  const subjectMap = {}
  ;(grades?.grades || []).forEach((g) => {
    const subj = g.lessonId?.subjectId?.name || 'Другое'
    if (!subjectMap[subj]) subjectMap[subj] = { values: [], count: 0 }
    if (g.value !== 'Н' && !isNaN(Number(g.value))) {
      subjectMap[subj].values.push(Number(g.value))
    }
    subjectMap[subj].count++
  })

  return (
    <div className={styles.page}>
      <div className={styles.profileHero}>
        <div className={styles.heroAvatar}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{user?.name}</h1>
          <span className={`${styles.roleBadge} ${styles[user?.role]}`}>
            {ROLE_LABELS[user?.role]}
          </span>
          <p className={styles.heroEmail}>{user?.email}</p>
          <p className={styles.heroGroup}>Группа: <strong>ПО2406</strong></p>
        </div>
        <div className={styles.heroActions}>
          {!editing && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              ✏️ Изменить имя
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className={styles.editCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Имя" placeholder="Ваше имя" error={errors.name?.message} register={register('name')} />
            <div className={styles.editActions}>
              <Button variant="secondary" type="button" onClick={() => { reset({ name: user?.name }); setEditing(false) }} size="sm">Отмена</Button>
              <Button variant="primary" type="submit" loading={saving} size="sm">Сохранить</Button>
            </div>
          </form>
        </div>
      )}

      {loadingData ? (
        <div className={styles.center}><Loader size="md" /></div>
      ) : (
        <>
          {/* Attendance Analytics */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📊 Моя посещаемость</h2>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statBig}`}>
                <div className={styles.statCircle} style={{ '--pct': pct }}>
                  <span className={styles.statCircleVal}>{pct}%</span>
                </div>
                <p className={styles.statLabel}>Посещаемость</p>
              </div>
              <div className={styles.statsSmall}>
                {[
                  { val: attendance?.present ?? 0, label: 'Присутствовал', color: '#22c55e' },
                  { val: attendance?.late ?? 0, label: 'Опоздал', color: '#f59e0b' },
                  { val: attendance?.absent ?? 0, label: 'Пропустил', color: '#ef4444' },
                  { val: attendance?.total ?? 0, label: 'Всего пар', color: '#6366f1' },
                ].map((s) => (
                  <div key={s.label} className={styles.statSmallCard} style={{ '--accent': s.color }}>
                    <span className={styles.statSmallVal}>{s.val}</span>
                    <span className={styles.statSmallLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${pct}%`,
                    background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span className={styles.progressLabel}>{pct}%</span>
            </div>
          </section>

          {/* Grades Analytics */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏆 Мои оценки</h2>
            {(grades?.grades || []).length === 0 ? (
              <p className={styles.empty}>Оценок пока нет</p>
            ) : (
              <>
                <div className={styles.avgBanner}>
                  <span className={styles.avgLabel}>Средний балл</span>
                  <span className={`${styles.avgVal} ${avg >= 80 ? styles.good : avg >= 60 ? styles.mid : styles.bad}`}>
                    {avg !== null ? avg : '—'}
                  </span>
                </div>

                <div className={styles.subjectGrades}>
                  {Object.entries(subjectMap).map(([subj, data]) => {
                    const subjAvg = data.values.length > 0
                      ? Math.round(data.values.reduce((a, b) => a + b, 0) / data.values.length)
                      : null
                    return (
                      <div key={subj} className={styles.subjCard}>
                        <p className={styles.subjName}>{subj}</p>
                        <div className={styles.subjStats}>
                          <span className={styles.subjAvg}>
                            {subjAvg !== null ? `${subjAvg} / 100` : '—'}
                          </span>
                          <span className={styles.subjCount}>{data.count} оценок</span>
                        </div>
                        {subjAvg !== null && (
                          <div className={styles.subjBar}>
                            <div
                              className={styles.subjBarFill}
                              style={{
                                width: `${subjAvg}%`,
                                background: subjAvg >= 80 ? '#22c55e' : subjAvg >= 60 ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className={styles.gradesHistory}>
                  <p className={styles.histTitle}>История оценок</p>
                  <div className={styles.gradesTable}>
                    <div className={styles.gradesHead}>
                      <span>Предмет</span>
                      <span>Дата</span>
                      <span>Оценка</span>
                    </div>
                    {(grades?.grades || []).slice(0, 20).map((g) => (
                      <div key={g._id} className={styles.gradesRow}>
                        <span className={styles.gradeSubj}>{g.lessonId?.subjectId?.name || '—'}</span>
                        <span className={styles.gradeDate}>
                          {g.lessonId?.scheduleDayId?.date
                            ? new Date(g.lessonId.scheduleDayId.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                            : '—'}
                        </span>
                        <span className={`${styles.gradeBadge} ${
                          g.value === 'Н' ? styles.gradeN
                            : Number(g.value) >= 80 ? styles.gradeGood
                            : Number(g.value) >= 60 ? styles.gradeMid
                            : styles.gradeBad
                        }`}>
                          {g.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}

// ─── Teacher Profile ─────────────────────────────────────────────────────────

function TeacherProfile() {
  const { user, setAuth, token } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [groupAttendance, setGroupAttendance] = useState(null)
  const [groupGrades, setGroupGrades] = useState(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: user?.name || '' },
  })

  useEffect(() => {
    Promise.all([getGroupAttendance(), getGroupGrades()])
      .then(([a, g]) => {
        setGroupAttendance(a.data)
        setGroupGrades(g.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setAuth(token, { ...user, name: data.name })
    setSaving(false)
    setEditing(false)
    setToast({ message: 'Имя обновлено', type: 'success' })
  }

  // Merge attendance and grades by student id
  const students = (groupAttendance?.students || []).map((s) => {
    const gradeData = (groupGrades?.students || []).find((g) => g._id === s._id)
    return { ...s, average: gradeData?.average ?? null }
  })

  return (
    <div className={styles.page}>
      <div className={styles.profileHero}>
        <div className={`${styles.heroAvatar} ${styles.teacherAvatar}`}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{user?.name}</h1>
          <span className={`${styles.roleBadge} ${styles[user?.role]}`}>Учитель</span>
          <p className={styles.heroEmail}>{user?.email}</p>
          <p className={styles.heroGroup}>Группа: <strong>{groupAttendance?.group || 'ПО2406'}</strong></p>
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>✏️ Изменить имя</Button>
        )}
      </div>

      {editing && (
        <div className={styles.editCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Имя" placeholder="Ваше имя" error={errors.name?.message} register={register('name')} />
            <div className={styles.editActions}>
              <Button variant="secondary" type="button" onClick={() => { reset({ name: user?.name }); setEditing(false) }} size="sm">Отмена</Button>
              <Button variant="primary" type="submit" loading={saving} size="sm">Сохранить</Button>
            </div>
          </form>
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>👥 Аналитика группы {groupAttendance?.group || ''}</h2>
        {loading ? (
          <div className={styles.center}><Loader size="md" /></div>
        ) : students.length === 0 ? (
          <p className={styles.empty}>Студенты не найдены</p>
        ) : (
          <div className={styles.groupTable}>
            <div className={styles.groupHead}>
              <span>Студент</span>
              <span>Присут.</span>
              <span>Опоздал</span>
              <span>Пропуск</span>
              <span>Посещ.</span>
              <span>Ср. балл</span>
            </div>
            {students.map((s) => (
              <div key={s._id} className={styles.groupRow}>
                <div className={styles.groupStudentCell}>
                  <span className={styles.groupAvatar}>{s.name[0]}</span>
                  <span className={styles.groupStudentName}>{s.name}</span>
                </div>
                <span className={styles.gCell}>{s.present}</span>
                <span className={`${styles.gCell} ${s.late > 0 ? styles.lateText : ''}`}>{s.late}</span>
                <span className={`${styles.gCell} ${s.absent > 0 ? styles.absentText : ''}`}>{s.absent}</span>
                <div className={styles.gPctCell}>
                  <span className={`${styles.pctBadge} ${s.percent >= 80 ? styles.good : s.percent >= 60 ? styles.mid : styles.bad}`}>
                    {s.percent}%
                  </span>
                  <div className={styles.miniBar}>
                    <div
                      className={styles.miniBarFill}
                      style={{
                        width: `${s.percent}%`,
                        background: s.percent >= 80 ? '#22c55e' : s.percent >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <span className={`${styles.gCell} ${styles.avgCell} ${
                  s.average === null ? '' : s.average >= 80 ? styles.good : s.average >= 60 ? styles.mid : styles.bad
                }`}>
                  {s.average !== null ? s.average : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}

// ─── Admin Profile (replaces Manage page visually) ────────────────────────────

function AdminProfile() {
  const { user } = useAuthStore()

  return (
    <div className={styles.page}>
      <div className={styles.profileHero}>
        <div className={`${styles.heroAvatar} ${styles.adminAvatar}`}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{user?.name}</h1>
          <span className={`${styles.roleBadge} ${styles[user?.role]}`}>Администратор</span>
          <p className={styles.heroEmail}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.adminCards}>
        {[
          { icon: '👥', title: 'Управление пользователями', desc: 'Добавляйте, редактируйте и удаляйте учителей, студентов и администраторов', link: '/manage' },
          { icon: '📅', title: 'Управление расписанием', desc: 'Изменяйте пары, отменяйте занятия или назначайте замену', link: '/manage?tab=schedule' },
          { icon: '🏫', title: 'Группы', desc: 'Управление учебными группами и составом студентов', link: '/manage?tab=groups' },
          { icon: '📊', title: 'Аналитика системы', desc: 'Общая статистика посещаемости и успеваемости всех групп', link: '/attendance' },
        ].map((card) => (
          <a key={card.title} href={card.link} className={styles.adminCard}>
            <span className={styles.adminCardIcon}>{card.icon}</span>
            <div className={styles.adminCardBody}>
              <h3 className={styles.adminCardTitle}>{card.title}</h3>
              <p className={styles.adminCardDesc}>{card.desc}</p>
            </div>
            <span className={styles.adminCardArrow}>→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
