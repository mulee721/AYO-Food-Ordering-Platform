import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Modal from '../../components/Modal'
import { dishesAPI, restaurantsAPI } from '../../lib/api'
import { currency, statusBadge } from '../../lib/utils'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RestaurantMenu() {
  const [dishes, setDishes]     = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [editing, setEditing]   = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      dishesAPI.getAll({ limit: 100 }),
      restaurantsAPI.getAll({ limit: 20 }),
    ]).then(([d, r]) => {
      setDishes(d.data.data || [])
      setRestaurants(r.data.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleAvail = async (id) => {
    try { await dishesAPI.toggleAvailability(id); toast.success('Availability updated'); load() }
    catch { toast.error('Failed') }
  }

  const deleteDish = async (id) => {
    if (!confirm('Delete this dish?')) return
    try { await dishesAPI.delete(id); toast.success('Dish deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const cats = [...new Set(dishes.map(d => d.category))]
  const filtered = dishes.filter(d =>
    (!search || d.name.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || d.category === catFilter)
  )

  return (
    <DashboardLayout title="Menu Management">
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search dishes…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44 text-sm" value={catFilter} onChange={e => setCat(e.target.value)}>
          <option value="">All Categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Dish</button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading menu…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(dish => (
            <div key={dish._id} className={`card relative overflow-hidden ${!dish.available ? 'opacity-60' : ''}`}>
              <div className="h-36 -mx-5 -mt-5 mb-4 overflow-hidden bg-slate-100">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover"
                    onError={e => { e.target.onerror = null; e.target.src = '' }} />
                ) : <div className="w-full h-full flex items-center justify-center text-4xl">🍲</div>}
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{dish.name}</p>
                  <p className="text-xs text-slate-400">{dish.category} · {dish.restaurant}</p>
                </div>
                <span className={dish.available ? 'badge-green' : 'badge-red'}>{dish.available ? 'Available' : 'Sold Out'}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-brand-600">{currency(dish.price)}</span>
                  {dish.originalPrice && <span className="text-xs text-slate-400 line-through ml-2">{currency(dish.originalPrice)}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>★ {dish.rating}</span>
                  <span className="text-slate-300">·</span>
                  <span>{dish.reviews} reviews</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleAvail(dish._id)}
                  className="btn btn-secondary flex-1 text-xs py-1.5 justify-center">
                  {dish.available ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} />}
                  {dish.available ? 'Mark Sold Out' : 'Mark Available'}
                </button>
                <button onClick={() => setEditing(dish)} className="btn btn-secondary px-2.5 py-1.5"><Edit2 size={13} /></button>
                <button onClick={() => deleteDish(dish._id)} className="btn btn-danger px-2.5 py-1.5"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="col-span-3 text-center py-16 text-slate-400">No dishes found.</div>
          )}
        </div>
      )}

      <DishFormModal open={showAdd || !!editing} onClose={() => { setShowAdd(false); setEditing(null) }}
        dish={editing} restaurants={restaurants} onSuccess={() => { setShowAdd(false); setEditing(null); load() }} />
    </DashboardLayout>
  )
}

function DishFormModal({ open, onClose, dish, restaurants, onSuccess }) {
  const [form, setForm] = useState({
    slug: '', restaurantId: '', restaurant: '', name: '', category: 'Ethiopian Cuisine',
    price: 200, originalPrice: '', prepTime: '20 min', calories: '', dietary: '', description: '', available: true, isPopular: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dish) setForm({
      slug: dish.slug, restaurantId: dish.restaurantId, restaurant: dish.restaurant,
      name: dish.name, category: dish.category, price: dish.price,
      originalPrice: dish.originalPrice || '', prepTime: dish.prepTime || '20 min',
      calories: dish.calories || '', dietary: (dish.dietary || []).join(', '),
      description: dish.description || '', available: dish.available, isPopular: dish.isPopular
    })
  }, [dish])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Name and price required'); return }
    setLoading(true)
    const payload = { ...form, dietary: form.dietary ? form.dietary.split(',').map(s => s.trim()) : [], originalPrice: form.originalPrice || undefined }
    try {
      if (dish) { await dishesAPI.update(dish._id, payload); toast.success('Dish updated') }
      else { await dishesAPI.create(payload); toast.success('Dish created') }
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const f = (key, value) => setForm(p => ({ ...p, [key]: value }))

  return (
    <Modal open={open} onClose={onClose} title={dish ? 'Edit Dish' : 'Add New Dish'} size="lg">
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        {!dish && <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">Slug (unique)</label>
          <input className="input text-sm" placeholder="e.g. d20" value={form.slug} onChange={e => f('slug', e.target.value)} /></div>}
        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Dish Name *</label>
          <input className="input text-sm" placeholder="Dish name" value={form.name} onChange={e => f('name', e.target.value)} /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
          <input className="input text-sm" placeholder="Ethiopian Cuisine" value={form.category} onChange={e => f('category', e.target.value)} /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Price (ETB) *</label>
          <input type="number" className="input text-sm" value={form.price} onChange={e => f('price', +e.target.value)} /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Original Price (optional)</label>
          <input type="number" className="input text-sm" placeholder="For strikethrough" value={form.originalPrice} onChange={e => f('originalPrice', +e.target.value || '')} /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Prep Time</label>
          <input className="input text-sm" placeholder="20 min" value={form.prepTime} onChange={e => f('prepTime', e.target.value)} /></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1">Calories</label>
          <input className="input text-sm" placeholder="500 kcal" value={form.calories} onChange={e => f('calories', e.target.value)} /></div>
        <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">Dietary Tags (comma separated)</label>
          <input className="input text-sm" placeholder="Vegetarian, Vegan, Fasting Friendly" value={form.dietary} onChange={e => f('dietary', e.target.value)} /></div>
        <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
          <textarea className="input text-sm h-20 resize-none" value={form.description} onChange={e => f('description', e.target.value)} /></div>
        {!dish && <>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Restaurant ID (slug)</label>
            <input className="input text-sm" placeholder="selam-kitchen" value={form.restaurantId} onChange={e => f('restaurantId', e.target.value)} /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Restaurant Display Name</label>
            <input className="input text-sm" placeholder="Selam Kitchen" value={form.restaurant} onChange={e => f('restaurant', e.target.value)} /></div>
        </>}
        <div className="col-span-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-brand-500" checked={form.available} onChange={e => f('available', e.target.checked)} />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-brand-500" checked={form.isPopular} onChange={e => f('isPopular', e.target.checked)} />
            Mark as Popular
          </label>
        </div>
        <div className="col-span-2">
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Saving…' : dish ? 'Save Changes' : 'Create Dish'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
