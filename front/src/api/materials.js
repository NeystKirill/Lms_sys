import api from './axios'

export const getMaterialsByLesson = (lessonId) => api.get(`/materials/lesson/${lessonId}`)
export const createMaterial = (data) => api.post('/materials', data)
export const updateMaterial = (id, data) => api.put(`/materials/${id}`, data)
export const deleteMaterial = (id) => api.delete(`/materials/${id}`)
