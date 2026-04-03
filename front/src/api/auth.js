import api from './axios'

export const loginRequest = (data) => api.post('/auth/login', data)
export const registerRequest = (data) => api.post('/auth/register', data)
export const getMeRequest = () => api.get('/auth/me')
