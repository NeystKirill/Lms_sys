import LessonCard from '../LessonCard/LessonCard'
import styles from './DayColumn.module.scss'

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const DAY_NAMES_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

export default function DayColumn({ date, lessons, canEdit, onEdit }) {
  const d = new Date(date)
  const isToday = new Date().toDateString() === d.toDateString()
  const dayNum = d.getDay()

  return (
    <div className={`${styles.column} ${isToday ? styles.today : ''}`}>
      <div className={styles.header}>
        <span className={styles.dayName}>{DAY_NAMES[dayNum]}</span>
        <span className={styles.dayDate}>{d.getDate()}</span>
        {isToday && <span className={styles.todayBadge}>сегодня</span>}
      </div>
      <div className={styles.lessons}>
        {lessons.length === 0 ? (
          <div className={styles.empty}>—</div>
        ) : (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              canEdit={canEdit}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  )
}
