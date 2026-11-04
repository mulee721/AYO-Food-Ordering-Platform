import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../lib/utils'
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingBag, Truck,
  Tag, BarChart3, Settings, ChefHat, Star, DollarSign, MapPin,
  Heart, Wallet, MessageSquare, Menu, LogOut, Package, Home,
} from 'lucide-react'

const NAV = {
  admin: [
    { to: '/admin',              label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/admin/users',        label: 'Users',       icon: Users },
    { to: '/admin/restaurants',  label: 'Restaurants', icon: UtensilsCrossed },
    { to: '/admin/orders',       label: 'Orders',      icon: ShoppingBag },
    { to: '/admin/couriers',     label: 'Couriers',    icon: Truck },
    { to: '/admin/promotions',   label: 'Promotions',  icon: Tag },
    { to: '/admin/reports',      label: 'Reports',     icon: BarChart3 },
    { to: '/admin/settings',     label: 'Settings',    icon: Settings },
  ],
  restaurant_owner: [
    { to: '/restaurant',          label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/restaurant/orders',   label: 'Orders',            icon: ShoppingBag },
    { to: '/restaurant/menu',     label: 'Menu',              icon: Menu },
    { to: '/restaurant/profile',  label: 'Restaurant Profile',icon: ChefHat },
    { to: '/restaurant/reviews',  label: 'Reviews',           icon: Star },
    { to: '/restaurant/earnings', label: 'Earnings',          icon: DollarSign },
    { to: '/restaurant/settings', label: 'Settings',          icon: Settings },
  ],
  delivery_agent: [
    { to: '/courier',             label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/courier/available',   label: 'Available Orders',  icon: Package },
    { to: '/courier/deliveries',  label: 'My Deliveries',     icon: Truck },
    { to: '/courier/earnings',    label: 'Earnings',          icon: DollarSign },
    { to: '/courier/profile',     label: 'Profile',           icon: Users },
    { to: '/courier/settings',    label: 'Settings',          icon: Settings },
  ],
  customer: [
    { to: '/customer',              label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/customer/restaurants',  label: 'Browse Restaurants',icon: UtensilsCrossed },
    { to: '/customer/orders',       label: 'My Orders',         icon: ShoppingBag },
    { to: '/customer/favorites',    label: 'Favorites',         icon: Heart },
    { to: '/customer/addresses',    label: 'Addresses',         icon: MapPin },
    { to: '/customer/wallet',       label: 'Wallet',            icon: Wallet },
    { to: '/customer/reviews',      label: 'Reviews',           icon: MessageSquare },
    { to: '/customer/settings',     label: 'Settings',          icon: Settings },
  ],
}

const BRAND_ICONS = {
  admin:            { icon: '👑', color: 'from-amber-500 to-orange-500' },
  restaurant_owner: { icon: '🍳', color: 'from-orange-500 to-red-500' },
  delivery_agent:   { icon: '🛵', color: 'from-blue-500 to-indigo-500' },
  customer:         { icon: '🛍️', color: 'from-emerald-500 to-teal-500' },
}

const DASHBOARD_TITLES = {
  admin:            { title: 'Admin Dashboard',      sub: 'Full control. Better decisions.' },
  restaurant_owner: { title: 'Restaurant Owner',     sub: 'Manage your restaurant. Grow your business.' },
  delivery_agent:   { title: 'Courier Dashboard',    sub: 'Delivering happiness, one order at a time.' },
  customer:         { title: 'Customer Dashboard',   sub: 'Good food. Happy moments.' },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const role = user.role
  const links = NAV[role] || []
  const brand = BRAND_ICONS[role] || { icon: '🍽️', color: 'from-brand-500 to-brand-600' }
  const titles = DASHBOARD_TITLES[role] || { title: 'Dashboard', sub: '' }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-navy-900 text-white flex-shrink-0">
      {/* Brand header */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${brand.color} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
            {brand.icon}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-white leading-tight">{titles.title}</p>
            <p className="text-xs text-slate-400 truncate">{titles.sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
          <span className="text-lg">🍽️</span>
          <span className="font-display font-bold text-white text-sm">AYO</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === `/${role.split('_')[0]}` || to === '/admin' || to === '/courier' || to === '/restaurant' || to === '/customer'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && <span className="badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{role.replace('_', ' ')}</p>
          </div>
          {role === 'delivery_agent' && (
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          )}
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
