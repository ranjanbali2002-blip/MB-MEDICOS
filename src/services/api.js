import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
})

// Attach token from localStorage to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve())
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original)).catch(e => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      try {
        await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
        processQueue(null)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr)
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: ({ identifier, password }) => api.post('/auth/login', { identifier, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  verifyEmail: (email, otp) => api.post('/auth/verify-email', { email, otp }),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
}

// Medicines
export const medicinesApi = {
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  getCategories: () => api.get('/medicines/categories'),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
}

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  add: (medicineId, qty = 1) => api.post('/cart/add', { medicineId, qty }),
  updateItem: (medicineId, qty) => api.put(`/cart/item/${medicineId}`, { qty }),
  removeItem: (medicineId) => api.delete(`/cart/item/${medicineId}`),
  clear: () => api.delete('/cart'),
}

// Orders
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getPending: () => api.get('/orders/pending'),
  getById: (id) => api.get(`/orders/${id}`),
  place: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  assign: (id) => api.patch(`/orders/${id}/assign`),
  rate: (id, rating, review) => api.post(`/orders/${id}/rate`, { rating, review }),
  uploadPrescription: (file) => {
    const form = new FormData()
    form.append('prescription', file)
    return api.post('/orders/upload-prescription', form)
  },
}

// Users
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
  addAddress: (data) => api.post('/users/address', data),
  deleteAddress: (addrId) => api.delete(`/users/address/${addrId}`),
  setDriverStatus: (isOnline) => api.patch('/users/driver/status', { isOnline }),
}

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getRevenueChart: () => api.get('/admin/revenue-chart'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getDrivers: () => api.get('/admin/drivers'),
  verifyDriver: (id, isVerified) => api.patch(`/admin/drivers/${id}/verify`, { isVerified }),
  assignDriver: (orderId, driverId) => api.patch(`/admin/orders/${orderId}/assign`, { driverId }),
}
