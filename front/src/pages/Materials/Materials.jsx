import { useEffect, useState, useMemo } from 'react'
import useAuthStore from '../../store/authStore'
import useLayout from '../../utils/useLayout'
import Loader from '../../components/UI/Loader/Loader'
import Button from '../../components/UI/Button/Button'
import Modal from '../../components/UI/Modal/Modal'
import Toast from '../../components/UI/Toast/Toast'
import { getWeekSchedule } from '../../api/schedule'
import { getMaterialsByLesson, createMaterial, updateMaterial, deleteMaterial } from '../../api/materials'
import styles from './Materials.module.scss'

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const TYPE_META = {
  video: { icon: '🎬', label: 'Видео', color: '#ef4444' },
  link:  { icon: '🔗', label: 'Ссылка', color: '#6366f1' },
  file:  { icon: '📄', label: 'Файл', color: '#f59e0b' },
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

export default function Materials() {
  const { user } = useAuthStore()
  const Layout = useLayout()
  const canEdit = user?.role === 'teacher' || user?.role === 'admin'

  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [search, setSearch] = useState('')

  const [materials, setMaterials] = useState([])
  const [matLoading, setMatLoading] = useState(false)

  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formSaving, setFormSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = (message, type = 'success') => setToast({ message, type })

  useEffect(() => {
    setLoading(true)
    getWeekSchedule(weekOffset)
      .then((res) => {
        const d = res.data.days || []
        setDays(d)
        const today = new Date()
        const todayDay = d.find((day) => isSameDay(day.date, today))
        const firstDay = todayDay || d[0]
        if (firstDay) {
          setSelectedDay(firstDay)
          setSelectedLesson(firstDay.lessons?.[0] || null)
        } else {
          setSelectedDay(null)
          setSelectedLesson(null)
        }
      })
      .catch(() => setDays([]))
      .finally(() => setLoading(false))
  }, [weekOffset])

  useEffect(() => {
    if (!selectedLesson) { setMaterials([]); return }
    setMatLoading(true)
    getMaterialsByLesson(selectedLesson._id)
      .then((r) => setMaterials(r.data.materials || []))
      .catch(() => setMaterials([]))
      .finally(() => setMatLoading(false))
  }, [selectedLesson])

  const filteredLessons = useMemo(() => {
    if (!selectedDay) return []
    const q = search.toLowerCase()
    return selectedDay.lessons.filter(
      (l) => !q || l.topic?.toLowerCase().includes(q) || l.subjectId?.name?.toLowerCase().includes(q)
    )
  }, [selectedDay, search])

  const handleSelectDay = (day) => {
    setSelectedDay(day)
    setSelectedLesson(day.lessons?.[0] || null)
    setSearch('')
  }

  const handleCreate = async (data) => {
    setFormSaving(true)
    try {
      const res = await createMaterial({ ...data, lessonId: selectedLesson._id })
      setMaterials((prev) => [res.data.material, ...prev])
      setAddModal(false)
      showToast('Материал добавлен')
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка', 'error')
    } finally {
      setFormSaving(false)
    }
  }

  const handleEdit = async (data) => {
    setFormSaving(true)
    try {
      const res = await updateMaterial(editModal._id, data)
      setMaterials((prev) => prev.map((m) => m._id === editModal._id ? res.data.material : m))
      setEditModal(null)
      showToast('Материал обновлён')
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка', 'error')
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteMaterial(deleteConfirm._id)
      setMaterials((prev) => prev.filter((m) => m._id !== deleteConfirm._id))
      setDeleteConfirm(null)
      showToast('Материал удалён')
    } catch (err) {
      showToast(err.response?.data?.message || 'Ошибка', 'error')
    }
  }

  const monday = (() => {
    const d = new Date()
    const day = d.getDay()
    d.setDate(d.getDate() - ((day + 6) % 7) + weekOffset * 7)
    d.setHours(0, 0, 0, 0)
    return d
  })()
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const weekLabel = weekOffset === 0 ? 'Эта неделя'
    : weekOffset === 1 ? 'Следующая неделя'
    : weekOffset === -1 ? 'Прошлая неделя'
    : `${weekOffset > 0 ? '+' : ''}${weekOffset} нед.`

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Материалы</h1>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o - 1)}>←</button>
            <div className={styles.weekMeta}>
              <span className={styles.weekLabel}>{weekLabel}</span>
              <span className={styles.weekRange}>
                {monday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} —{' '}
                {friday.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <button className={styles.navBtn} onClick={() => setWeekOffset((o) => o + 1)}>→</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.center}><Loader size="md" /></div>
        ) : (
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.dayTabs}>
                {days.map((day) => {
                  const d = new Date(day.date)
                  const isToday = isSameDay(day.date, new Date())
                  const isActive = selectedDay && isSameDay(day.date, selectedDay.date)
                  return (
                    <button
                      key={day.date}
                      className={`${styles.dayTab} ${isActive ? styles.dayActive : ''} ${isToday ? styles.dayToday : ''}`}
                      onClick={() => handleSelectDay(day)}
                    >
                      <span className={styles.dayName}>{DAY_NAMES[d.getDay()]}</span>
                      <span className={styles.dayDate}>{d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                      <span className={styles.dayCount}>{day.lessons.length}</span>
                    </button>
                  )
                })}
              </div>

              {selectedDay && (
                <>
                  <div className={styles.searchWrap}>
                    <input
                      className={styles.search}
                      placeholder="Поиск по паре..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className={styles.lessonList}>
                    {filteredLessons.length === 0 ? (
                      <p className={styles.empty}>Ничего не найдено</p>
                    ) : (
                      filteredLessons.map((lesson) => (
                        <button
                          key={lesson._id}
                          className={`${styles.lessonItem} ${selectedLesson?._id === lesson._id ? styles.lessonActive : ''} ${lesson.status === 'cancelled' ? styles.lessonCancelled : ''}`}
                          onClick={() => setSelectedLesson(lesson)}
                        >
                          <div className={styles.lessonNum}>{lesson.lessonNumber}</div>
                          <div className={styles.lessonBody}>
                            <p className={styles.lessonSubject}>{lesson.subjectId?.name}</p>
                            <p className={styles.lessonTopic}>{lesson.topic || 'Тема не указана'}</p>
                            <p className={styles.lessonTime}>{lesson.startTime} – {lesson.endTime}</p>
                            {lesson.status === 'cancelled' && <span className={styles.cancelledTag}>Отменена</span>}
                            {lesson.status === 'replaced' && <span className={styles.replacedTag}>Замена</span>}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </aside>

            <div className={styles.panel}>
              {selectedLesson ? (
                <>
                  <div className={styles.panelTop}>
                    <div className={styles.panelInfo}>
                      <p className={styles.panelSubject}>{selectedLesson.subjectId?.name}</p>
                      <h2 className={styles.panelTitle}>{selectedLesson.topic || 'Тема не указана'}</h2>
                      <p className={styles.panelMeta}>
                        {selectedLesson.teacherId?.name}
                        {' · '}
                        {selectedLesson.startTime} – {selectedLesson.endTime}
                        {selectedDay && (
                          <>
                            {' · '}
                            {new Date(selectedDay.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </>
                        )}
                      </p>
                      {selectedLesson.description && (
                        <p className={styles.panelDesc}>{selectedLesson.description}</p>
                      )}
                      {selectedLesson.status === 'cancelled' && (
                        <div className={styles.statusBanner + ' ' + styles.cancelledBanner}>
                          ❌ Пара отменена{selectedLesson.statusNote ? ` — ${selectedLesson.statusNote}` : ''}
                        </div>
                      )}
                      {selectedLesson.status === 'replaced' && (
                        <div className={styles.statusBanner + ' ' + styles.replacedBanner}>
                          🔄 Замена{selectedLesson.statusNote ? ` — ${selectedLesson.statusNote}` : ''}
                        </div>
                      )}
                    </div>
                    {canEdit && (
                      <div className={styles.panelActions}>
                        <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>+ Материал</Button>
                      </div>
                    )}
                  </div>

                  <div className={styles.divider} />

                  {matLoading ? (
                    <div className={styles.center}><Loader size="sm" /></div>
                  ) : materials.length === 0 ? (
                    <div className={styles.emptyPanel}>
                      <p className={styles.emptyPanelText}>Материалы не добавлены</p>
                      {canEdit && (
                        <Button variant="secondary" size="sm" onClick={() => setAddModal(true)}>
                          + Добавить первый материал
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className={styles.materialsList}>
                      {materials.map((m) => {
                        const meta = TYPE_META[m.type] || TYPE_META.link
                        return (
                          <div key={m._id} className={styles.materialCard}>
                            <span className={styles.materialIcon}>{meta.icon}</span>
                            <div className={styles.materialBody}>
                              <div className={styles.materialRow}>
                                <a
                                  href={m.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.materialTitle}
                                >
                                  {m.title}
                                </a>
                                <span className={styles.materialType} style={{ color: meta.color }}>
                                  {meta.label}
                                </span>
                              </div>
                              {m.description && <p className={styles.materialDesc}>{m.description}</p>}
                              <p className={styles.materialAuthor}>
                                {m.addedBy?.name} · {new Date(m.createdAt).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            {canEdit && (
                              <div className={styles.materialActions}>
                                <button className={styles.matEditBtn} onClick={() => setEditModal(m)}>✏️</button>
                                <button className={styles.matDeleteBtn} onClick={() => setDeleteConfirm(m)}>🗑️</button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.panelEmpty}>
                  <p>Выберите пару из списка</p>
                </div>
              )}
            </div>
          </div>
        )}

        <MaterialModal
          open={addModal}
          onClose={() => setAddModal(false)}
          onSubmit={handleCreate}
          saving={formSaving}
          title="Добавить материал"
        />
        <MaterialModal
          open={!!editModal}
          onClose={() => setEditModal(null)}
          onSubmit={handleEdit}
          saving={formSaving}
          title="Редактировать материал"
          defaultValues={editModal}
        />

        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Удалить материал?" size="sm">
          <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
            Удалить «{deleteConfirm?.title}»? Это действие нельзя отменить.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="danger" onClick={handleDelete}>Удалить</Button>
          </div>
        </Modal>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </Layout>
  )
}

function MaterialModal({ open, onClose, onSubmit, saving, title, defaultValues }) {
  const [form, setForm] = useState({ title: '', type: 'link', url: '', description: '' })

  useEffect(() => {
    if (open) {
      setForm({
        title: defaultValues?.title || '',
        type: defaultValues?.type || 'link',
        url: defaultValues?.url || '',
        description: defaultValues?.description || '',
      })
    }
  }, [open, defaultValues])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    onSubmit(form)
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Название *</label>
            <input
              className={styles.formInput}
              placeholder="Например: Лекция по HTML"
              value={form.title}
              onChange={set('title')}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Тип</label>
            <div className={styles.typeButtons}>
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.typeBtn} ${form.type === key ? styles.typeBtnActive : ''}`}
                  onClick={() => setForm((f) => ({ ...f, type: key }))}
                >
                  {meta.icon} {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Ссылка / URL *</label>
            <input
              className={styles.formInput}
              placeholder="https://..."
              value={form.url}
              onChange={set('url')}
              required
              type="url"
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Описание</label>
            <textarea
              className={styles.formTextarea}
              placeholder="Краткое описание материала..."
              value={form.description}
              onChange={set('description')}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button variant="secondary" type="button" onClick={onClose}>Отмена</Button>
          <Button variant="primary" type="submit" loading={saving}>
            {defaultValues ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
