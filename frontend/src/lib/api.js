import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mira_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — send back to landing page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mira_token')
      localStorage.removeItem('mira_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:           (email, password) => api.post('/auth/login',    { email, password }),
  register:        (name, email, password, phone) => api.post('/auth/register', { name, email, password, phone, role: 'customer' }),
  me:              () => api.get('/auth/me'),
  forgotPassword:  (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp:       (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword:   (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
}

// ─── Restaurants ──────────────────────────────────────────────────────────────
export const restaurantsAPI = {
  getAll:        (params) => api.get('/restaurants', { params }),
  getBySlug:     (slug)   => api.get(`/restaurants/${slug}`),
  getStats:      ()       => api.get('/restaurants/stats'),
  create:        (data)   => api.post('/restaurants', data),
  update:        (id, d)  => api.put(`/restaurants/${id}`, d),
  updateStatus:  (id, s)  => api.patch(`/restaurants/${id}/status`, { status: s }),
  delete:        (id)     => api.delete(`/restaurants/${id}`),
}

// ─── Dishes ──────────────────────────────────────────────────────────────────
export const dishesAPI = {
  getAll:            (params)  => api.get('/dishes', { params }),
  getByRestaurant:   (rid)     => api.get(`/dishes/restaurant/${rid}`),
  getCategories:     ()        => api.get('/dishes/categories'),
  getBySlug:         (slug)    => api.get(`/dishes/${slug}`),
  create:            (data)    => api.post('/dishes', data),
  update:            (id, d)   => api.put(`/dishes/${id}`, d),
  toggleAvailability:(id)      => api.patch(`/dishes/${id}/availability`),
  delete:            (id)      => api.delete(`/dishes/${id}`),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  place:           (data)            => api.post('/orders', data),
  myOrders:        (params)          => api.get('/orders/my', { params }),
  getAll:          (params)          => api.get('/orders', { params }),
  getByRef:        (ref)             => api.get(`/orders/ref/${ref}`),
  track:           (ref)             => api.get(`/orders/track/${ref}`),
  updateStatus:    (id, status, note)=> api.patch(`/orders/${id}/status`, { status, note }),
  assignCourier:   (id, courierId, courierName) => api.patch(`/orders/${id}/assign-courier`, { courierId, courierName }),
  platformStats:   ()                => api.get('/orders/stats/platform'),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile:      ()        => api.get('/users/profile'),
  updateProfile:   (data)    => api.put('/users/profile', data),
  getAddresses:    ()        => api.get('/users/addresses'),
  addAddress:      (data)    => api.post('/users/addresses', data),
  deleteAddress:   (id)      => api.delete(`/users/addresses/${id}`),
  getFavorites:    ()        => api.get('/users/favorites'),
  toggleFavorite:  (dishId)  => api.post(`/users/favorites/${dishId}`),
  getAll:          (params)  => api.get('/users', { params }),
  updateStatus:    (id, s)   => api.put(`/users/${id}/status`, { status: s }),
}

// ─── Cart / Promos ────────────────────────────────────────────────────────────
export const cartAPI = {
  calculate:     (items, promoCode) => api.post('/cart/calculate', { items, promoCode }),
  validatePromo: (code, subtotal)   => api.post('/cart/validate-promo', { code, subtotal }),
  getPromos:     ()                 => api.get('/cart/promos'),
  createPromo:   (data)             => api.post('/cart/promos', data),
  updatePromo:   (id, data)         => api.put(`/cart/promos/${id}`, data),
  deletePromo:   (id)               => api.delete(`/cart/promos/${id}`),
}

// ─── Couriers ─────────────────────────────────────────────────────────────────
export const couriersAPI = {
  getAll:           (params)        => api.get('/couriers', { params }),
  getStats:         ()              => api.get('/couriers/stats'),
  getMe:            ()              => api.get('/couriers/me'),
  getById:          (id)            => api.get(`/couriers/${id}`),
  create:           (data)          => api.post('/couriers', data),
  toggleOnline:     (id)            => api.patch(`/couriers/${id}/toggle-online`),
  recordDelivery:   (id, earnings)  => api.patch(`/couriers/${id}/record-delivery`, { earnings }),
  update:           (id, data)      => api.put(`/couriers/${id}`, data),
}
