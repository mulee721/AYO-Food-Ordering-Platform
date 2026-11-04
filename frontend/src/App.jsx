import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Landing
import LandingPage from './pages/landing/LandingPage'

// Auth
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import AdminOrders      from './pages/admin/AdminOrders'
import AdminCouriers    from './pages/admin/AdminCouriers'
import AdminPromotions  from './pages/admin/AdminPromotions'
import AdminReports     from './pages/admin/AdminReports'

// Restaurant
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard'
import RestaurantOrders    from './pages/restaurant/RestaurantOrders'
import RestaurantMenu      from './pages/restaurant/RestaurantMenu'
import RestaurantProfile   from './pages/restaurant/RestaurantProfile'

// Courier
import CourierDashboard  from './pages/courier/CourierDashboard'
import CourierDeliveries from './pages/courier/CourierDeliveries'
import CourierEarnings   from './pages/courier/CourierEarnings'
import AvailableOrders   from './pages/courier/AvailableOrders'

// Customer
import CustomerDashboard  from './pages/customer/CustomerDashboard'
import CustomerRestaurants from './pages/customer/CustomerRestaurants'
import RestaurantDetail   from './pages/customer/RestaurantDetail'
import Cart               from './pages/customer/Cart'
import Checkout           from './pages/customer/Checkout'
import CustomerOrders     from './pages/customer/CustomerOrders'
import OrderTracking      from './pages/customer/OrderTracking'
import CustomerFavorites  from './pages/customer/CustomerFavorites'
import CustomerAddresses  from './pages/customer/CustomerAddresses'
import CustomerWallet    from './pages/customer/CustomerWallet'

// Shared
import ProfileSettings from './pages/shared/ProfileSettings'

import { PageLoader } from './components/LoadingSpinner'

// ─── Protected Route ────────────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!user) return <Navigate to="/" state={{ from: location }} replace />

  if (roles && !roles.includes(user.role)) {
    // Redirect to the correct dashboard
    const redirect = {
      admin:            '/admin',
      restaurant_owner: '/restaurant',
      delivery_agent:   '/courier',
      customer:         '/customer',
    }[user.role] || '/login'
    return <Navigate to={redirect} replace />
  }

  return children
}

// ─── Root redirect based on role ─────────────────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  // Authenticated users go to their dashboard; unauthenticated users see the landing page
  if (!user) return <LandingPage />
  const map = { admin: '/admin', restaurant_owner: '/restaurant', delivery_agent: '/courier', customer: '/customer' }
  return <Navigate to={map[user.role] || '/customer'} replace />
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { background: '#1e2d47', color: '#fff', fontSize: '14px', borderRadius: '12px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Root — shows landing page (public) or dashboard redirect (authenticated) */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<LandingPage />} />

          {/* Public auth */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Admin ── */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"        element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/restaurants"  element={<ProtectedRoute roles={['admin']}><AdminRestaurants /></ProtectedRoute>} />
          <Route path="/admin/orders"       element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/couriers"     element={<ProtectedRoute roles={['admin']}><AdminCouriers /></ProtectedRoute>} />
          <Route path="/admin/promotions"   element={<ProtectedRoute roles={['admin']}><AdminPromotions /></ProtectedRoute>} />
          <Route path="/admin/reports"      element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings"     element={<ProtectedRoute roles={['admin']}><ProfileSettings /></ProtectedRoute>} />

          {/* ── Restaurant Owner ── */}
          <Route path="/restaurant" element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantDashboard /></ProtectedRoute>} />
          <Route path="/restaurant/orders"   element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantOrders /></ProtectedRoute>} />
          <Route path="/restaurant/menu"     element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantMenu /></ProtectedRoute>} />
          <Route path="/restaurant/profile"  element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantProfile /></ProtectedRoute>} />
          <Route path="/restaurant/reviews"  element={<ProtectedRoute roles={['restaurant_owner']}><RestaurantProfile /></ProtectedRoute>} />
          <Route path="/restaurant/earnings" element={<ProtectedRoute roles={['restaurant_owner']}><AdminReports /></ProtectedRoute>} />
          <Route path="/restaurant/settings" element={<ProtectedRoute roles={['restaurant_owner']}><ProfileSettings /></ProtectedRoute>} />

          {/* ── Courier ── */}
          <Route path="/courier" element={<ProtectedRoute roles={['delivery_agent']}><CourierDashboard /></ProtectedRoute>} />
          <Route path="/courier/available"  element={<ProtectedRoute roles={['delivery_agent']}><AvailableOrders /></ProtectedRoute>} />
          <Route path="/courier/deliveries" element={<ProtectedRoute roles={['delivery_agent']}><CourierDeliveries /></ProtectedRoute>} />
          <Route path="/courier/earnings"   element={<ProtectedRoute roles={['delivery_agent']}><CourierEarnings /></ProtectedRoute>} />
          <Route path="/courier/profile"    element={<ProtectedRoute roles={['delivery_agent']}><ProfileSettings /></ProtectedRoute>} />
          <Route path="/courier/settings"   element={<ProtectedRoute roles={['delivery_agent']}><ProfileSettings /></ProtectedRoute>} />

          {/* ── Customer ── */}
          <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/restaurants"      element={<ProtectedRoute roles={['customer']}><CustomerRestaurants /></ProtectedRoute>} />
          <Route path="/customer/restaurant/:slug" element={<ProtectedRoute roles={['customer']}><RestaurantDetail /></ProtectedRoute>} />
          <Route path="/customer/cart"             element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="/customer/checkout"         element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="/customer/orders"           element={<ProtectedRoute roles={['customer']}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/customer/order/:ref"       element={<ProtectedRoute roles={['customer']}><OrderTracking /></ProtectedRoute>} />
          <Route path="/customer/favorites"        element={<ProtectedRoute roles={['customer']}><CustomerFavorites /></ProtectedRoute>} />
          <Route path="/customer/addresses"        element={<ProtectedRoute roles={['customer']}><CustomerAddresses /></ProtectedRoute>} />
          <Route path="/customer/wallet"           element={<ProtectedRoute roles={['customer']}><CustomerWallet /></ProtectedRoute>} />
          <Route path="/customer/reviews"          element={<ProtectedRoute roles={['customer']}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/customer/settings"         element={<ProtectedRoute roles={['customer']}><ProfileSettings /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}
