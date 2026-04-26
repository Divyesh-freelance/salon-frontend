import { api, adminApi } from './axios'

export const servicesApi = {
  getAll: (params) => api.get('/services', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/services/${slug}`).then((r) => r.data),
  getCategories: () => api.get('/services/categories').then((r) => r.data),

  // Admin
  create: (data) => adminApi.post('/admin/services', data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/admin/services/${id}`, data).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/services/${id}`).then((r) => r.data),
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'services')
    return adminApi
      .post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
}

export const stylistsApi = {
  getAll: (params) => api.get('/stylists', { params }).then((r) => r.data),
  getById: (id) => api.get(`/stylists/${id}`).then((r) => r.data),

  // Admin
  create: (data) => adminApi.post('/admin/stylists', data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/admin/stylists/${id}`, data).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/stylists/${id}`).then((r) => r.data),
}

export const bookingsApi = {
  getAvailability: (params) => api.get('/bookings/availability', { params }).then((r) => r.data),
  create: (data) => api.post('/bookings', data).then((r) => r.data),
  getConfirmation: (id) => api.get(`/bookings/confirmation/${id}`).then((r) => r.data),

  // Admin
  getAll: (params) => adminApi.get('/admin/bookings', { params }).then((r) => r.data),
  getStats: () => adminApi.get('/admin/bookings/stats').then((r) => r.data),
  updateStatus: (id, status) =>
    adminApi.patch(`/admin/bookings/${id}/status`, { status }).then((r) => r.data),
}

export const galleryApi = {
  getAll: (params) => api.get('/gallery', { params }).then((r) => r.data),
  getCategories: () => api.get('/gallery/categories').then((r) => r.data),

  // Admin
  upload: (formData) =>
    adminApi.post('/admin/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/gallery/${id}`).then((r) => r.data),
}

export const settingsApi = {
  get: () => api.get('/settings').then((r) => r.data),
  getTestimonials: () => api.get('/testimonials').then((r) => r.data),

  // Admin
  update: (data) => adminApi.put('/admin/settings', data).then((r) => r.data),
  dashboard: () => adminApi.get('/admin/dashboard').then((r) => r.data),
  uploadFile: (formData) =>
    adminApi.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
}

export const authApi = {
  login: (data) => adminApi.post('/admin/auth/login', data).then((r) => r.data),
  logout: () => adminApi.post('/admin/auth/logout').then((r) => r.data),
  me: () => adminApi.get('/admin/auth/me').then((r) => r.data),
  refresh: () => adminApi.post('/admin/auth/refresh').then((r) => r.data),
}
