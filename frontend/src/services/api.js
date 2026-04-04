import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// Request interceptor: add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 with token refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Never retry auth endpoints themselves — pass errors straight to caller
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
    if (isAuthEndpoint) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await api.post('/auth/refresh-token')
        const { accessToken } = response.data.data
        localStorage.setItem('token', accessToken)
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  // Admin only
  getAllUsers: (params) => api.get('/auth/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/auth/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id, role) => api.put(`/auth/admin/users/${id}/role`, { role }),
  updateUserAdmin: (id, data) => api.put(`/auth/admin/users/${id}`, data),
  updateUserPasswordAdmin: (id, password) => api.put(`/auth/admin/users/${id}/password`, { password })
}

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteImage: (id, imageUrl) => api.post(`/products/${id}/images/delete`, { imageUrl })
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyVoucher: (code) => api.post('/cart/voucher', { code })
}

export const siteAPI = {
  getPublicSettings: () => api.get('/settings/public')
}

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getUserOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  getAll: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
}

export const reviewAPI = {
  create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  getProductReviews: (productId, params) =>
    api.get(`/reviews/product/${productId}`, { params }),
  getAll: (params) => api.get('/reviews/admin/all', { params }),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  delete: (id) => api.delete(`/reviews/${id}`),
  getUserReviews: () => api.get('/reviews/my')
}

export const voucherAPI = {
  getActive: () => api.get('/vouchers/active'),
  validate: (code) => api.post('/vouchers/validate', { code }),
  getAll: () => api.get('/vouchers'),
  create: (data) => api.post('/vouchers', data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`)
}

export const paymentAPI = {
  createVnpay: (orderId) => api.post('/payments/vnpay/create', { orderId }),
  vnpayReturn: (params) => api.get('/payments/vnpay/return', { params }),
  createMomo: (orderId) => api.post('/payments/momo/create', { orderId }),
  momoReturn: (params) => api.get('/payments/momo/return', { params })
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenue: (params) => api.get('/admin/revenue', { params }),
  getTopProducts: () => api.get('/admin/top-products'),
  getOrderStats: () => api.get('/admin/order-status-distribution'),
  getRecentOrders: () => api.get('/admin/recent-orders'),
  getLowStock: (params) => api.get('/admin/low-stock', { params }),
  getRecentUsers: () => api.get('/admin/recent-users'),
  getPendingReviews: () => api.get('/admin/pending-reviews'),
  getSettings: (params) => api.get('/admin/settings', { params }),
  updateSettings: (data) => api.patch('/admin/settings', data)
}

// ─── Message API ────────────────────────────────────────────────────────────
export const messageAPI = {
  // Public
  sendMessage: (data) => api.post('/messages', data),

  // Admin
  getAll: () => api.get('/messages/admin/all'),
  reply: (id, data) => api.patch(`/messages/admin/${id}/reply`, data),
  updateStatus: (id, status) => api.patch(`/messages/admin/${id}/status`, { status }),
  delete: (id) => api.delete(`/messages/admin/${id}`),
  getMyMessages: () => api.get('/messages/my'),
  getConversations: () => api.get('/messages/admin/conversations'),
  getConversationHistory: (email) => api.get(`/messages/admin/conversation/${email}`),
}
