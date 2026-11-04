import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../contexts/ThemeContext'
import { Bell, ShoppingCart, ChevronDown, Sun, Moon } from 'lucide-react'
import { getInitials } from '../lib/utils'

export default function Topbar({ title, subtitle }) {
  const { user }      = useAuth()
  const { itemCount } = useCart()
  const { isDark, toggle } = useTheme()

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-[#1a1f2e] border-b border-slate-100 dark:border-white/8 flex-shrink-0 sticky top-0 z-30 transition-colors">
      <div>
        {title    && <h1 className="font-display font-bold text-slate-800 dark:text-white text-base leading-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Date */}
        <span className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">{dateStr}</span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
          {isDark
            ? <Sun  size={17} className="text-gold" />
            : <Moon size={17} className="text-slate-500" />
          }
        </button>

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
          <Bell size={17} className="text-slate-500 dark:text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a1f2e]" />
        </button>

        {/* Cart (customer only) */}
        {user?.role === 'customer' && (
          <Link to="/customer/cart"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
            <ShoppingCart size={17} className="text-slate-500 dark:text-slate-400" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {itemCount}
              </span>
            )}
          </Link>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer ml-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 hidden md:block" />
        </div>
      </div>
    </header>
  )
}
