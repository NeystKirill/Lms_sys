import api from './axios'

export const getTodaySchedule = () => api.get('/schedule/today')
export const getWeekSchedule = (weekOffset = 0) => api.get(`/schedule/week?offset=${weekOffset}`)

export const getNextWeekSchedule = () => api.get('/schedule/next-week')
export const getScheduleOptions = () => api.get('/schedule/options')
export const cancelLesson = (id, statusNote) => api.patch(`/schedule/lesson/${id}/cancel`, { statusNote })
export const restoreLesson = (id) => api.patch(`/schedule/lesson/${id}/restore`)
export const replaceLesson = (id, data) => api.patch(`/schedule/lesson/${id}/replace`, data)
