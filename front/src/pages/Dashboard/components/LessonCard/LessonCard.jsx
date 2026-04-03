import styles from './LessonCard.module.scss'

export default function LessonCard({ lesson, canEdit, onEdit }) {
  return (
    <div className={styles.card}>
      <div className={styles.num}>{lesson.lessonNumber}</div>
      <div className={styles.body}>
        <p className={styles.topic}>{lesson.topic || 'Тема не указана'}</p>
        <p className={styles.subject}>{lesson.subjectId?.name}</p>
        <p className={styles.time}>{lesson.startTime} — {lesson.endTime}</p>
        <p className={styles.teacher}>{lesson.teacherId?.name}</p>
      </div>
      {canEdit && (
        <button className={styles.editBtn} onClick={() => onEdit(lesson)}>
          ✏️
        </button>
      )}
    </div>
  )
}
