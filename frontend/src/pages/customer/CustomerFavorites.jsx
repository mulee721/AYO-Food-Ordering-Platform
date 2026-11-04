import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import EmptyState from '../../components/EmptyState'
import { PageLoader } from '../../components/LoadingSpinner'
import { useCart } from '../../contexts/CartContext'
import { usersAPI, dishesAPI } from '../../lib/api'
import { currency } from '../../lib/utils'
import { Heart, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function CustomerFavorites() {
  const { addItem } = useCart()
  const [favIds, setFavIds]   = useState([])
  const [dishes, setDishes]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data: ids } = await usersAPI.getFavorites()
      setFavIds(ids || [])
      if (ids?.length) {
        const { data } = await dishesAPI.getAll({ limit: 100 })
        const all = data.data || []
        setDishes(all.filter(d => ids.includes(d.slug) || ids.includes(d._id)))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const removeFav = async (dish) => {
    try {
      await usersAPI.toggleFavorite(dish.slug || dish._id)
      toast.success('Removed from favorites')
      setDishes(prev => prev.filter(d => d._id !== dish._id))
    } catch { toast.error('Failed') }
  }

  if (loading) return <DashboardLayout title="Favorites"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="My Favorites">
      {!dishes.length ? (
        <EmptyState icon="❤️" title="No favorites yet" description="Browse the menu and heart the dishes you love!"
          action={<Link to="/customer/restaurants" className="btn-primary">Browse Restaurants</Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {dishes.map(dish => (
            <div key={dish._id} className="card group">
              <div className="h-36 -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-2xl bg-slate-100 relative">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.onerror = null; e.target.style.display = 'none' }} />
                ) : <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>}
                <button onClick={() => removeFav(dish)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-400 hover:bg-white transition-colors shadow">
                  <Heart size={15} className="fill-red-400" />
                </button>
              </div>
              <p className="font-semibold text-slate-800 truncate">{dish.name}</p>
              <p className="text-xs text-slate-400">{dish.restaurant}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-brand-600">{currency(dish.price)}</span>
                <button onClick={() => { addItem(dish); toast.success(`${dish.name} added to cart!`) }}
                  className="btn btn-primary text-xs py-1.5 px-3">
                  <Plus size={13} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
