import api from './axios'

export const getMyAttendance = () => api.get('/attendance/my')
export const getGroupAttendance = () => api.get('/attendance/group')
export const getWeekLessons = (offset = 0) => api.get(`/attendance/week-lessons?offset=${offset}`)
export const getLessonAttendance = (lessonId) => api.get(`/attendance/lesson/${lessonId}`)
export const markBulk = (lessonId, records) => api.post('/attendance/bulk', { lessonId, records })
export const removeAttendance = (lessonId, studentId) =>
  api.delete(`/attendance/lesson/${lessonId}/student/${studentId}`)
