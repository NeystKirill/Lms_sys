import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Loader from '../../../../components/UI/Loader/Loader'
import { getWeekSchedule } from '../../../../api/schedule'
import styles from './WeekSchedule.module.scss'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']

const SLOTS = [
  { num: 1, start: '13:30', end: '15:00' },
  { num: 2, start: '15:20', end: '16:50' },
  { num: 3, start: '17:00', end: '18:30' },
  { num: 4, start: '18:40', end: '20:10' },
]

const COLORS = [
  { bg: 'rgba(45,125,210,0.10)', border: 'rgba(45,125,210,0.40)', text: '#4f9fe0' },
  { bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.40)', text: '#a78bfa' },
  { bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.45)',  text: '#f59e0b' },
  { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.40)',  text: '#34d399' },
  { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.40)', text: '#f87171' },
]

function colorFor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function getMonday(offset = 0) {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7) + offset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function fmt(d, opts) {
  return d.toLocaleDateString('ru-RU', opts)
}

export default function WeekSchedule({ canEdit }) {
  const [offset, setOffset] = useState(0)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  const monday = getMonday(offset)

  useEffect(() => {
    setLoading(true)
    setActive(null)
    getWeekSchedule(offset)
      .then(r => setDays(r.data.days || []))
      .catch(() => setDays([]))
      .finally(() => setLoading(false))
  }, [offset])

  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const getLesson = (date, num) => {
    const ds = date.toDateString()
    const found = days.find(d => new Date(d.date).toDateString() === ds)
    return found?.lessons?.find(l => l.lessonNumber === num) || null
  }

  const isToday = d => new Date().toDateString() === d.toDateString()

  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const range = `${fmt(monday, { day: 'numeric', month: 'short' })} — ${fmt(friday, { day: 'numeric', month: 'short' })}`
  const weekLabel = offset === 0 ? 'Текущая неделя'
    : offset === 1 ? 'Следующая неделя'
    : offset === -1 ? 'Прошлая неделя'
    : offset > 0 ? `+${offset} нед.` : `${offset} нед.`

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <h2 className={styles.weekTitle}>{weekLabel}</h2>
          <p className={styles.weekRange}>{range}</p>
        </div>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={() => setOffset(o => o - 1)}>←</button>
          {offset !== 0 && (
            <button className={styles.nowBtn} onClick={() => setOffset(0)}>Сегодня</button>
          )}
          <button className={styles.navBtn} onClick={() => setOffset(o => o + 1)}>→</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}><Loader size="md" /></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thTime} scope="col" />
                {dates.map((date, i) => {
                  const today = isToday(date)
                  return (
                    <th
                      key={i}
                      scope="col"
                      className={`${styles.thDay} ${today ? styles.thDayToday : ''}`}
                    >
                      <span className={styles.dayShort}>{DAYS[i]}</span>
                      <span className={`${styles.dayNum} ${today ? styles.dayNumToday : ''}`}>
                        {String(date.getDate()).padStart(2, '0')}
                      </span>
                      {today && <span className={styles.todayDot} />}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot, si) => (
                <tr key={slot.num} className={styles.row}>
                  <td className={styles.tdTime}>
                    <span className={styles.pairNum}>{slot.num}</span>
                    <span className={styles.pairTime}>{slot.start}</span>
                    <span className={styles.pairSep}>—</span>
                    <span className={styles.pairTime}>{slot.end}</span>
                  </td>

                  {dates.map((date, di) => {
                    const lesson = getLesson(date, slot.num)
                    const today = isToday(date)
                    const key = `${si}-${di}`
                    const isOpen = active === key
                    const c = lesson ? colorFor(lesson.subjectId?.name) : null
                    const isCancelled = lesson?.status === 'cancelled'
                    const isReplaced = lesson?.status === 'replaced'

                    return (
                      <td
                        key={di}
                        className={`${styles.tdCell} ${today ? styles.tdCellToday : ''}`}
                      >
                        {lesson ? (
                          <motion.button
                            className={`${styles.card} ${isCancelled ? styles.cardCancelled : ''} ${isReplaced ? styles.cardReplaced : ''}`}
                            style={{
                              background: isCancelled ? 'rgba(239,68,68,0.06)' : c.bg,
                              borderColor: isCancelled ? 'rgba(239,68,68,0.3)' : isReplaced ? 'rgba(245,158,11,0.4)' : c.border,
                            }}
                            onClick={() => setActive(isOpen ? null : key)}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <p className={styles.cardSubject} style={{ color: isCancelled ? '#ef4444' : c.text }}>
                              {isCancelled ? '❌ Отменена' : isReplaced ? '🔄 ' + lesson.subjectId?.name : lesson.subjectId?.name}
                            </p>
                            <p className={styles.cardTopic}>{lesson.topic}</p>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  className={styles.cardDetail}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                                >
                                  <span className={styles.cardTeacher}>
                                    {lesson.teacherId?.name}
                                  </span>
                                  <span className={styles.cardTime}>
                                    {slot.start} – {slot.end}
                                  </span>
                                  {lesson.description && (
                                    <span className={styles.cardRoom}>
                                      {lesson.description}
                                    </span>
                                  )}
                                  {canEdit && (
                                    <button
                                      className={styles.editBtn}
                                      style={{ color: c.text, borderColor: c.border }}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      Редактировать
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        ) : (
                          <div className={styles.emptySlot} />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
