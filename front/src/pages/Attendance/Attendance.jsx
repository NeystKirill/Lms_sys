import { useEffect, useState } from 'react'
import useAuthStore from '../../store/authStore'
import useLayout from '../../utils/useLayout'
import Loader from '../../components/UI/Loader/Loader'
import Toast from '../../components/UI/Toast/Toast'
import {
  getMyAttendance, getGroupAttendance, getWeekLessons, getLessonAttendance, markBulk,
} from '../../api/attendance'
import { getLessonGrades, setBulkGrades } from '../../api/grades'
import styles from './Attendance.module.scss'

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function groupByDay(lessons) {
  const map = {}
  lessons.forEach((l) => {
    const key = new Date(l.date).toDateString()
    if (!map[key]) map[key] = { date: l.date, lessons: [] }
    map[key].lessons.push(l)
  })
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date))
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

export default function Attendance() {
  const { user } = useAuthStore()
  const Layout = useLayout()
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'
  return <Layout>{isTeacher ? <TeacherView /> : <StudentView />}</Layout>
}

// ─── Student View ─────────────────────────────────────────────────────────────

function StudentView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('all')

  useEffect(() => {
    getMyAttendance()
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.center}><Loader size="md" /></div>

  const pct = data?.percent ?? 0
  const present = data?.present ?? 0
  const late = data?.late ?? 0
  const absent = data?.absent ?? 0
  const total = data?.total ?? 0

  const allSubjects = [...new Set((data?.records || []).map((r) => r.lessonId?.subjectId?.name).filter(Boolean))]
  const filteredRecords = (data?.records || []).filter(
    (r) => subjectFilter === 'all' || r.lessonId?.subjectId?.name === subjectFilter
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Посещаемость</h1>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { val: `${pct}%`, lab: 'Посещаемость', hi: true, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' },
          { val: present, lab: 'Присутствовал', color: '#22c55e' },
          { val: late,    lab: 'Опоздал',       color: '#f59e0b' },
          { val: absent,  lab: 'Пропустил',     color: '#ef4444' },
          { val: total,   lab: 'Всего пар',      color: '#6366f1' },
        ].map((s) => (
          <div key={s.lab} className={`${styles.statCard} ${s.hi ? styles.statHi : ''}`} style={{ '--accent': s.color }}>
            <p className={styles.statVal} style={s.hi ? { color: s.color } : {}}>{s.val}</p>
            <p className={styles.statLab}>{s.lab}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' }}
          />
        </div>
        <span className={styles.progressLabel}>{pct}%</span>
      </div>

      {/* History */}
      <div className={styles.section}>
        <div className={styles.histHeader}>
          <p className={styles.sLabel}>История посещений</p>
          <select
            className={styles.subjectFilter}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">Все предметы</option>
            {allSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className={styles.histTable}>
          <div className={styles.histHead}>
            <span>Предмет</span>
            <span>Дата</span>
            <span>Статус</span>
          </div>
          {filteredRecords.length === 0 ? (
            <div className={styles.emptyRow}>Нет данных о посещаемости</div>
          ) : (
            filteredRecords.map((r) => (
              <div key={r._id} className={styles.histRow}>
                <span className={styles.histSubject}>{r.lessonId?.subjectId?.name || '—'}</span>
                <span className={styles.histDate}>
                  {r.lessonId?.scheduleDayId?.date
                    ? new Date(r.lessonId.scheduleDayId.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
                    : '—'}
                </span>
                <span className={`${styles.statusBadge} ${styles[r.status]}`}>
                  {r.status === 'present' ? '✓ Присутствовал'
                    : r.status === 'late' ? '⏰ Опоздал'
                    : '✗ Отсутствовал'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Teacher View ─────────────────────────────────────────────────────────────

function TeacherView() {
  const [groupData, setGroupData] = useState(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDays, setWeekDays] = useState([])
  const [students, setStudents] = useState([])
  const [weekLoading, setWeekLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [markMap, setMarkMap] = useState({})
  const [gradeMap, setGradeMap] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedLesson, setSavedLesson] = useState(null)
  const [activeTab, setActiveTab] = useState('attendance') // 'attendance' | 'grades'
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = (msg, type = 'success') => setToast({ message: msg, type })

  useEffect(() => {
    getGroupAttendance()
      .then((r) => setGroupData(r.data))
      .catch(() => {})
      .finally(() => setGroupLoading(false))
  }, [])

  useEffect(() => {
    setWeekLoading(true)
    setSelectedDay(null)
    setSelectedLesson(null)
    setMarkMap({})
    setGradeMap({})
    getWeekLessons(weekOffset)
      .then((r) => {
        const grouped = groupByDay(r.data.lessons || [])
        setWeekDays(grouped)
        setStudents(r.data.students || [])
        const today = new Date()
        const todayGroup = grouped.find((d) => isSameDay(d.date, today))
        const firstGroup = todayGroup || grouped[0]
        if (firstGroup) {
          setSelectedDay(firstGroup)
          setSelectedLesson(firstGroup.lessons[0] || null)
        }
      })
      .catch(() => { setWeekDays([]); setStudents([]) })
      .finally(() => setWeekLoading(false))
  }, [weekOffset])

  useEffect(() => {
    if (!selectedLesson) return
    setMarkMap({})
    setGradeMap({})
    setSavedLesson(null)
    Promise.all([
      getLessonAttendance(selectedLesson._id),
      getLessonGrades(selectedLesson._id),
    ]).then(([attRes, gradeRes]) => {
      const aMap = {}
      attRes.data.records.forEach((rec) => { aMap[rec.studentId._id] = rec.status })
      setMarkMap(aMap)

      const gMap = {}
      gradeRes.data.grades.forEach((g) => { gMap[g.studentId._id] = g.value })
      setGradeMap(gMap)
    }).catch(() => {})
  }, [selectedLesson])

  const handleSelectDay = (day) => {
    setSelectedDay(day)
    setSelectedLesson(day.lessons[0] || null)
    setSavedLesson(null)
    setMarkMap({})
    setGradeMap({})
  }

  const handleMark = (studentId, status) => {
    setMarkMap((prev) => ({ ...prev, [studentId]: status }))
    setSavedLesson(null)
  }

  const handleGrade = (studentId, value) => {
    setGradeMap((prev) => ({ ...prev, [studentId]: value }))
    setSavedLesson(null)
  }

  const handleSaveAttendance = async () => {
    if (!selectedLesson || !students.length) return
    setSaving(true)
    try {
      const records = students.map((s) => ({ studentId: s._id, status: markMap[s._id] || 'absent' }))
      await markBulk(selectedLesson._id, records)
      setSavedLesson(selectedLesson._id)
      showToast('Посещаемость сохранена')
      getGroupAttendance().then((r) => setGroupData(r.data)).catch(() => {})
    } catch {
      showToast('Ошибка сохранения', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveGrades = async () => {
    if (!selectedLesson || !students.length) return
    setSaving(true)
    try {
      const grades = students
        .filter((s) => gradeMap[s._id] !== undefined && gradeMap[s._id] !== '')
        .map((s) => ({ studentId: s._id, value: gradeMap[s._id] }))
      if (grades.length === 0) { showToast('Нет оценок для сохранения', 'error'); setSaving(false); return }
      await setBulkGrades(selectedLesson._id, grades)
      setSavedLesson(selectedLesson._id + '_grades')
      showToast('Оценки сохранены')
    } catch {
      showToast('Ошибка сохранения', 'error')
    } finally {
      setSaving(false)
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
    <div className={styles.page}>
      <h1 className={styles.title}>Посещаемость и оценки</h1>

      <div className={styles.teacherLayout}>
        <div className={styles.teacherTop}>
        {/* Left: analytics */}
        <div className={styles.leftPanel}>
          <p className={styles.sLabel}>Аналитика — {groupData?.group || '...'}</p>
          {groupLoading ? (
            <div className={styles.center}><Loader size="md" /></div>
          ) : !groupData?.students?.length ? (
            <p className={styles.emptyRow}>Студенты не найдены</p>
          ) : (
            <div className={styles.analytics}>
              <div className={styles.analyticsHead}>
                <span>Студент</span>
                <span>Был</span>
                <span>Опозд.</span>
                <span>Пропуск</span>
                <span>%</span>
              </div>
              {groupData.students.map((s) => (
                <div key={s._id} className={styles.analyticsRow}>
                  <div className={styles.analyticsName}>
                    <span className={styles.analyticsAvatar}>{s.name[0]}</span>
                    <span className={styles.analyticsNameText}>{s.name}</span>
                  </div>
                  <span className={styles.aCell}>{s.present}</span>
                  <span className={`${styles.aCell} ${s.late > 0 ? styles.lateTxt : ''}`}>{s.late}</span>
                  <span className={`${styles.aCell} ${s.absent > 0 ? styles.absentTxt : ''}`}>{s.absent}</span>
                  <div className={styles.pctWrap}>
                    <span className={`${styles.pctVal} ${s.percent >= 80 ? styles.good : s.percent >= 60 ? styles.mid : styles.bad}`}>
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: marking panel */}
        <div className={styles.rightPanel}>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o - 1)}>←</button>
            <div className={styles.weekMeta}>
              <span className={styles.weekLabel}>{weekLabel}</span>
              <span className={styles.weekRange}>
                {monday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {friday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o + 1)}>→</button>
          </div>

          {weekLoading ? (
            <div className={styles.center}><Loader size="md" /></div>
          ) : weekDays.length === 0 ? (
            <div className={styles.noLessons}>Пар на этой неделе нет</div>
          ) : (
            <>
              <div className={styles.dayTabs}>
                {weekDays.map((day) => {
                  const d = new Date(day.date)
                  const isToday = isSameDay(day.date, new Date())
                  const isActive = selectedDay && isSameDay(day.date, selectedDay.date)
                  return (
                    <button
                      key={day.date}
                      className={`${styles.dayTab} ${isActive ? styles.dayTabActive : ''} ${isToday ? styles.dayTabToday : ''}`}
                      onClick={() => handleSelectDay(day)}
                    >
                      <span className={styles.dayTabName}>{DAY_NAMES[d.getDay()]}</span>
                      <span className={styles.dayTabDate}>{d.getDate()}</span>
                      <span className={styles.dayTabCount}>{day.lessons.length}</span>
                    </button>
                  )
                })}
              </div>

              {selectedDay && (
                <div className={styles.lessonTabs}>
                  {selectedDay.lessons.map((l) => (
                    <button
                      key={l._id}
                      className={`${styles.lTab} ${selectedLesson?._id === l._id ? styles.lTabActive : ''} ${l.status === 'cancelled' ? styles.lTabCancelled : ''}`}
                      onClick={() => setSelectedLesson(l)}
                    >
                      <span className={styles.lTabNum}>{l.lessonNumber}</span>
                      <div className={styles.lTabBody}>
                        <span className={styles.lTabSubj}>{l.subjectId?.name}</span>
                        <span className={styles.lTabTime}>{l.startTime} – {l.endTime}</span>
                        {l.status === 'cancelled' && <span className={styles.cancelTag}>Отменена</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedLesson && students.length > 0 && selectedLesson.status !== 'cancelled' && (
                <div className={styles.markSection}>
                  {/* Tab switcher */}
                  <div className={styles.markTabs}>
                    <button
                      className={`${styles.markTab} ${activeTab === 'attendance' ? styles.markTabActive : ''}`}
                      onClick={() => setActiveTab('attendance')}
                    >
                      📋 Посещаемость
                    </button>
                    <button
                      className={`${styles.markTab} ${activeTab === 'grades' ? styles.markTabActive : ''}`}
                      onClick={() => setActiveTab('grades')}
                    >
                      🏆 Оценки
                    </button>
                  </div>

                  <div className={styles.markTitleRow}>
                    <p className={styles.sLabel}>
                      {activeTab === 'attendance' ? 'Отметить присутствие' : 'Выставить оценки (0–100 или Н)'}
                    </p>
                    {savedLesson === selectedLesson._id && activeTab === 'attendance' && (
                      <span className={styles.savedBadge}>✓ Сохранено</span>
                    )}
                    {savedLesson === selectedLesson._id + '_grades' && activeTab === 'grades' && (
                      <span className={styles.savedBadge}>✓ Сохранено</span>
                    )}
                  </div>

                  <div className={styles.markList}>
                    {students.map((s) => (
                      <div key={s._id} className={styles.markRow}>
                        <div className={styles.markStudent}>
                          <span className={styles.markAvatar}>{s.name[0]}</span>
                          <span className={styles.markName}>{s.name}</span>
                        </div>

                        {activeTab === 'attendance' ? (
                          <div className={styles.markBtns}>
                            {[
                              { key: 'present', label: '✓ Был' },
                              { key: 'late',    label: '⏰ Опоздал' },
                              { key: 'absent',  label: '✗ Не был' },
                            ].map((opt) => {
                              const status = markMap[s._id] || null
                              return (
                                <button
                                  key={opt.key}
                                  className={`${styles.mBtn} ${status === opt.key ? styles[opt.key] : ''}`}
                                  onClick={() => handleMark(s._id, opt.key)}
                                >
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className={styles.gradeInput}>
                            <input
                              className={styles.gradeField}
                              type="text"
                              placeholder="—"
                              value={gradeMap[s._id] ?? ''}
                              onChange={(e) => {
                                const v = e.target.value
                                if (v === '' || v === 'Н' || v === 'н' || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100)) {
                                  handleGrade(s._id, v === 'н' ? 'Н' : v)
                                }
                              }}
                              maxLength={3}
                            />
                            <div className={styles.gradeQuick}>
                              {[100, 90, 80, 70, 60, 'Н'].map((v) => (
                                <button
                                  key={v}
                                  className={`${styles.gradeQuickBtn} ${String(gradeMap[s._id]) === String(v) ? styles.gradeQuickActive : ''}`}
                                  onClick={() => handleGrade(s._id, String(v))}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {activeTab === 'attendance' ? (
                    <button className={styles.saveBtn} onClick={handleSaveAttendance} disabled={saving}>
                      {saving ? 'Сохраняем...' : '💾 Сохранить посещаемость'}
                    </button>
                  ) : (
                    <button className={styles.saveBtn} onClick={handleSaveGrades} disabled={saving}>
                      {saving ? 'Сохраняем...' : '💾 Сохранить оценки'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        </div>{/* /teacherTop */}
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}
