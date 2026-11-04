import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { PageLoader } from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { restaurantsAPI, ordersAPI, usersAPI, cartAPI, dishesAPI } from '../../lib/api'
import { resolveImageUrl, getFallbackImage } from '../../lib/imageResolver'
import { currency, fmtDateTime, statusBadge, getInitials } from '../../lib/utils'
import { Search, Star, Clock, ShoppingBag, MapPin, ChevronRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['🍲 Ethiopian', '🍔 Burgers', '🍕 Pizza', '🍗 Chicken', '🥗 Vegetarian', '🍝 Pasta', '🍟 Snacks', '🥤 Drinks']

export default function CustomerDashboard() {
  const { user }    = useAuth()
  const { addItem, itemCount } = useCart()
  const [restaurants, setRestaurants] = useState([])
  const [dishes, setDishes]           = useState([])
  const [orders, setOrders]           = useState([])
  const [promos, setPromos]           = useState([])
  const [addresses, setAddresses]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')

  useEffect(() => {
    Promise.all([
      restaurantsAPI.getAll({ featured: true, limit: 6 }),
      dishesAPI.getAll({ popularOnly: true, limit: 6 }),
      ordersAPI.myOrders({ limit: 3 }),
      cartAPI.getPromos(),
      usersAPI.getAddresses().catch(() => ({ data: [] })),
    ]).then(([r, d, o, p, a]) => {
      setRestaurants(r.data.data || [])
      setDishes(d.data.data || [])
      setOrders(o.data.data || [])
      setPromos(p.data || [])
      setAddresses(a.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Customer Dashboard"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Customer Dashboard" subtitle="Good food. Happy moments.">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-navy-900 min-h-[160px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/90 to-transparent" />
        </div>
        <div className="relative z-10 p-7 max-w-lg">
          <h2 className="font-display font-black text-white text-2xl sm:text-3xl leading-tight mb-1">
            Delicious Food<br />Delivered to Your Door
          </h2>
          <p className="text-slate-300 text-sm mb-4">Your favorite restaurants, at your fingertips.</p>
          <div className="flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-8 text-sm h-10" placeholder="Search restaurants or dishes…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Link to="/customer/restaurants" className="btn-primary text-sm px-4 h-10">Search</Link>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(c => (
          <Link key={c} to={`/customer/restaurants?category=${encodeURIComponent(c.split(' ').slice(1).join(' '))}`}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-sm">
            {c}
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* Popular Restaurants */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Popular Restaurants</h3>
            <Link to="/customer/restaurants" className="text-xs text-brand-500 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {restaurants.map(r => (
              <Link key={r._id} to={`/customer/restaurant/${r.slug}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer block">
                <div className="h-28 -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-2xl bg-slate-100">
                  {r.image ? (
                    <img src={resolveImageUrl(r.image)} alt={r.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = getFallbackImage(r.cuisine); e.target.onerror = null }} />
                  ) : <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>}
                </div>
                <p className="font-semibold text-slate-800 text-sm truncate">{r.name}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span>{r.rating}</span>
                  <span className="text-slate-300">·</span>
                  <Clock size={11} />
                  <span>{r.time} min</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">My Orders</h3>
            <Link to="/customer/orders" className="text-xs text-brand-500 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {orders.length ? orders.map(o => (
              <Link key={o._id} to={`/customer/order/${o.ref}`} className="card flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer block p-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={18} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-brand-600 font-bold">{o.ref}</p>
                  <p className="text-xs text-slate-500 truncate">{o.restaurant}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">{currency(o.total)}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </Link>
            )) : (
              <div className="card text-center py-8 text-slate-400 text-sm">
                <ShoppingBag size={28} className="mx-auto mb-2 text-slate-300" />
                No orders yet
                <br />
                <Link to="/customer/restaurants" className="text-brand-500 font-semibold text-xs mt-1 hover:underline">Browse Restaurants →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Promo banner */}
        {promos[0] && (
          <div className="card bg-gradient-to-r from-brand-500 to-brand-600 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 bottom-4 w-16 h-16 rounded-full bg-white/5" />
            <p className="text-xs font-bold uppercase tracking-wide text-brand-100 mb-1">Special Offer</p>
            <p className="font-display font-black text-xl mb-1">
              {promos[0].type === 'percentage' ? `Get ${promos[0].value}% OFF` :
               promos[0].type === 'fixed' ? `Get ${promos[0].value} ETB OFF` : 'Free Delivery!'}
            </p>
            <p className="text-brand-100 text-xs mb-4">{promos[0].description || `On orders over ${promos[0].minOrder} ETB`}</p>
            <p className="text-xs mb-1 text-brand-100">Use code:</p>
            <p className="font-mono font-bold bg-white/20 px-3 py-1.5 rounded-xl text-sm inline-block">{promos[0].code}</p>
          </div>
        )}

        {/* Wallet card */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">My Wallet</p>
          <p className="font-display font-black text-3xl text-slate-800 mb-4">0.00 ETB</p>
          <button className="btn-primary w-full justify-center text-sm">
            <Zap size={15} /> Add Money
          </button>
        </div>

        {/* Saved addresses */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800">Saved Addresses</p>
            <Link to="/customer/addresses" className="text-xs text-brand-500 font-semibold hover:underline">Manage</Link>
          </div>
          <div className="space-y-2">
            {addresses.slice(0, 2).map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-brand-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-700 text-xs">{a.label}</p>
                  <p className="text-slate-400 text-xs truncate">{a.address}</p>
                </div>
              </div>
            ))}
            {!addresses.length && (
              <Link to="/customer/addresses" className="text-xs text-brand-500 hover:underline">+ Add your first address</Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
