import api from './axios'

export const getMyGrades = () => api.get('/grades/my')
export const getGroupGrades = () => api.get('/grades/group')
export const getLessonGrades = (lessonId) => api.get(`/grades/lesson/${lessonId}`)
export const setBulkGrades = (lessonId, grades) => api.post('/grades/bulk', { lessonId, grades })
