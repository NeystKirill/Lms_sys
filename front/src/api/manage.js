import api from './axios'

export const getUsers = () => api.get('/manage/users')
export const createUser = (data) => api.post('/manage/users', data)
export const updateUser = (id, data) => api.put(`/manage/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/manage/users/${id}`)

export const getGroups = () => api.get('/manage/groups')
export const updateGroup = (id, data) => api.put(`/manage/groups/${id}`, data)
