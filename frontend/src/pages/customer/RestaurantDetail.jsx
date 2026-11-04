import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { restaurantsAPI, dishesAPI } from '../../lib/api'
import { resolveImageUrl, getFallbackImage } from '../../lib/imageResolver'
import { currency, statusBadge } from '../../lib/utils'
import { Star, Clock, DollarSign, ShoppingCart, Plus, Minus, Search, ChevronLeft } from 'lucide-react'
import { PageLoader } from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import DashboardLayout from '../../components/DashboardLayout'
import Modal from '../../components/Modal'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

export default function RestaurantDetail() {
  const { slug }     = useParams()
  const { addItem }  = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [dishes, setDishes]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('All')
  const [search, setSearch]         = useState('')
  const [modalDish, setModalDish]   = useState(null)
  const [qty, setQty]               = useState(1)

  useEffect(() => {
    Promise.all([
      restaurantsAPI.getBySlug(slug),
      dishesAPI.getByRestaurant(slug),
    ]).then(([r, d]) => {
      setRestaurant(r.data)
      setDishes(d.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <DashboardLayout title="Restaurant"><PageLoader /></DashboardLayout>
  if (!restaurant) return <DashboardLayout title="Not Found"><div className="text-center py-20 text-slate-400">Restaurant not found.</div></DashboardLayout>

  const cats = ['All', ...new Set(dishes.map(d => d.category))]
  const filtered = dishes.filter(d =>
    (activeTab === 'All' || d.category === activeTab) &&
    (!search || d.name.toLowerCase().includes(search.toLowerCase()))
  )

  const addToCart = (dish, quantity = 1) => {
    addItem(dish, quantity)
    toast.success(`${dish.name} added to cart!`)
    setModalDish(null)
    setQty(1)
  }

  return (
    <DashboardLayout title={restaurant.name}>
      {/* Header */}
      <div className="mb-6">
        <Link to="/customer/restaurants" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-500 mb-4">
          <ChevronLeft size={16} /> Back to Restaurants
        </Link>
        <div className="card">
          <div className="h-48 -mx-5 -mt-5 mb-5 overflow-hidden rounded-t-2xl bg-slate-100">
            {restaurant.coverImage || restaurant.image ? (
              <img src={resolveImageUrl(restaurant.coverImage || restaurant.image)} alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = getFallbackImage(restaurant.cuisine); e.target.onerror = null }} />
            ) : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-slate-800">{restaurant.name}</h1>
                <span className={statusBadge(restaurant.status)}>{restaurant.status}</span>
              </div>
              <p className="text-slate-500 text-sm">{restaurant.cuisine}</p>
              <p className="text-xs text-slate-400 mt-0.5">{restaurant.address}</p>
            </div>
            <div className="flex gap-4 text-sm flex-shrink-0">
              <div className="text-center">
                <p className="font-bold text-slate-800 flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{restaurant.rating}</p>
                <p className="text-xs text-slate-400">{restaurant.reviewsCount} reviews</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800">{restaurant.time} min</p>
                <p className="text-xs text-slate-400">Delivery</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800">{restaurant.fee} ETB</p>
                <p className="text-xs text-slate-400">Delivery fee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-8 text-sm w-48" placeholder="Search dishes…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {cats.map(c => (
            <button key={c} onClick={() => setActiveTab(c)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === c ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(dish => (
          <div key={dish._id} className={`card group cursor-pointer hover:shadow-lg transition-all ${!dish.available ? 'opacity-60' : ''}`}
            onClick={() => { setModalDish(dish); setQty(1) }}>
            <div className="h-36 -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-2xl bg-slate-100 relative">
              {dish.image ? (
                <img src={resolveImageUrl(dish.image)} alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = getFallbackImage(dish.category); e.target.onerror = null }} />
              ) : <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>}
              {!dish.available && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full">Sold Out</span>
                </div>
              )}
              {dish.isPopular && (
                <div className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">Popular</div>
              )}
            </div>
            <p className="font-semibold text-slate-800 truncate">{dish.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{dish.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="font-bold text-brand-600">{currency(dish.price)}</span>
                {dish.originalPrice && <span className="text-xs text-slate-400 line-through ml-2">{currency(dish.originalPrice)}</span>}
              </div>
              {dish.available && (
                <button onClick={e => { e.stopPropagation(); addToCart(dish) }}
                  className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors shadow-md">
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {!filtered.length && <div className="col-span-3 text-center py-16 text-slate-400">No dishes found.</div>}
      </div>

      {/* Dish detail modal */}
      <Modal open={!!modalDish} onClose={() => { setModalDish(null); setQty(1) }} title={modalDish?.name}>
        {modalDish && (
          <div className="space-y-4">
            {modalDish.image && (
              <div className="h-48 -mx-6 -mt-6 overflow-hidden rounded-t-2xl mb-4">
                <img src={resolveImageUrl(modalDish.image)} alt={modalDish.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = getFallbackImage(modalDish.category); e.target.onerror = null }} />
              </div>
            )}
            <p className="text-sm text-slate-600">{modalDish.description}</p>
            <div className="flex flex-wrap gap-2">
              {(modalDish.dietary || []).map(d => (
                <span key={d} className="badge badge-green text-xs">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {modalDish.calories && <div className="bg-slate-50 rounded-xl p-2"><p className="font-bold text-slate-800">{modalDish.calories}</p><p className="text-xs text-slate-400">Calories</p></div>}
              {modalDish.prepTime && <div className="bg-slate-50 rounded-xl p-2"><p className="font-bold text-slate-800">{modalDish.prepTime}</p><p className="text-xs text-slate-400">Prep Time</p></div>}
              <div className="bg-slate-50 rounded-xl p-2"><p className="font-bold text-brand-600">{currency(modalDish.price)}</p><p className="text-xs text-slate-400">Price</p></div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3 border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors"><Minus size={14} /></button>
                <span className="w-8 text-center font-bold text-slate-800">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 transition-colors"><Plus size={14} /></button>
              </div>
              <button onClick={() => addToCart(modalDish, qty)} className="btn-primary">
                <ShoppingCart size={16} /> Add {qty} · {currency(modalDish.price * qty)}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
