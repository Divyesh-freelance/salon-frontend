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
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'stylists')
    return adminApi
      .post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
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
  // Receives a raw File, wraps in FormData — compatible with ImageUploadField
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'settings')
    return adminApi
      .post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
}

export const socialVideosApi = {
  getAll: (params) => api.get('/social-videos', { params }).then((r) => r.data),

  // Admin
  adminGetAll: (params) => adminApi.get('/admin/social-videos', { params }).then((r) => r.data),
  create: (data) => adminApi.post('/admin/social-videos', data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/admin/social-videos/${id}`, data).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/social-videos/${id}`).then((r) => r.data),
}

export const authApi = {
  login: (data) => adminApi.post('/admin/auth/login', data).then((r) => r.data),
  logout: () => adminApi.post('/admin/auth/logout').then((r) => r.data),
  me: () => adminApi.get('/admin/auth/me').then((r) => r.data),
  refresh: () => adminApi.post('/admin/auth/refresh').then((r) => r.data),
}

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params) => api.get('/products', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data),
  getCategories: () => api.get('/products/categories').then((r) => r.data),

  // Admin
  adminGetAll: (params) => adminApi.get('/admin/products', { params }).then((r) => r.data),
  create: (data) => adminApi.post('/admin/products', data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/admin/products/${id}`, data).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/products/${id}`).then((r) => r.data),
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'products')
    return adminApi.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },

  // Categories (admin)
  adminGetCategories: (params) => adminApi.get('/admin/product-categories', { params }).then((r) => r.data),
  createCategory: (data) => adminApi.post('/admin/product-categories', data).then((r) => r.data),
  updateCategory: (id, data) => adminApi.put(`/admin/product-categories/${id}`, data).then((r) => r.data),
  removeCategory: (id) => adminApi.delete(`/admin/product-categories/${id}`).then((r) => r.data),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data) => api.post('/orders', data).then((r) => r.data),
  verifyPayment: (id, data) => api.post(`/orders/${id}/verify-payment`, data).then((r) => r.data),
  paymentFailed: (id, data) => api.post(`/orders/${id}/payment-failed`, data).then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),

  // Admin
  adminGetAll: (params) => adminApi.get('/admin/orders', { params }).then((r) => r.data),
  adminGetById: (id) => adminApi.get(`/admin/orders/${id}`).then((r) => r.data),
  adminUpdateStatus: (id, data) => adminApi.patch(`/admin/orders/${id}/status`, data).then((r) => r.data),
}

// ─── Academy ─────────────────────────────────────────────────────────────────
export const academyApi = {
  getAll: (params) => api.get('/academy', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/academy/${slug}`).then((r) => r.data),

  // Admin
  adminGetAll: (params) => adminApi.get('/admin/academy', { params }).then((r) => r.data),
  create: (data) => adminApi.post('/admin/academy', data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/admin/academy/${id}`, data).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/academy/${id}`).then((r) => r.data),
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'academy')
    return adminApi.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },
}

// ─── Discounts ────────────────────────────────────────────────────────────────
export const discountsApi = {
  getAll: (params) => api.get('/discounts', { params }).then((r) => r.data),

  // Admin
  adminGetAll: (params) => adminApi.get('/admin/discounts', { params }).then((r) => r.data),
  create: (data) => adminApi.post('/admin/discounts', data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/admin/discounts/${id}`, data).then((r) => r.data),
  remove: (id) => adminApi.delete(`/admin/discounts/${id}`).then((r) => r.data),
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'discounts')
    return adminApi.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },
}

// ─── Customers (admin) ────────────────────────────────────────────────────────
export const customersApi = {
  getAll: (params) => adminApi.get('/admin/customers', { params }).then((r) => r.data),
  getById: (id) => adminApi.get(`/admin/customers/${id}`).then((r) => r.data),
}
