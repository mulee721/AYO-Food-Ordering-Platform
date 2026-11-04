import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { PageLoader } from '../../components/LoadingSpinner'
import { restaurantsAPI } from '../../lib/api'
import { statusBadge } from '../../lib/utils'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RestaurantProfile() {
  const [restaurant, setRestaurant] = useState(null)
  const [form, setForm]             = useState({})
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    restaurantsAPI.getAll({ limit: 1 }).then(r => {
      const rest = r.data.data?.[0]
      if (rest) { setRestaurant(rest); setForm(rest) }
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    if (!restaurant) return
    setSaving(true)
    try {
      await restaurantsAPI.update(restaurant._id, form)
      toast.success('Restaurant profile updated!')
      restaurantsAPI.getAll({ limit: 1 }).then(r => setRestaurant(r.data.data?.[0]))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const toggleStatus = async () => {
    if (!restaurant) return
    const next = restaurant.status === 'Open' ? 'Closed' : 'Open'
    try {
      await restaurantsAPI.updateStatus(restaurant._id, next)
      setRestaurant(r => ({ ...r, status: next }))
      toast.success(`Restaurant is now ${next}`)
    } catch { toast.error('Failed') }
  }

  if (loading) return <DashboardLayout title="Restaurant Profile"><PageLoader /></DashboardLayout>
  if (!restaurant) return <DashboardLayout title="Restaurant Profile"><div className="text-center py-20 text-slate-400">No restaurant profile found.</div></DashboardLayout>

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }))

  return (
    <DashboardLayout title="Restaurant Profile">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Status toggle */}
        <div className={`card flex items-center justify-between ${restaurant.status === 'Open' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
          <div>
            <p className="font-semibold text-slate-800">Kitchen Status</p>
            <p className="text-sm text-slate-500">Toggle to open or close your restaurant for orders</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={statusBadge(restaurant.status)}>{restaurant.status}</span>
            <button onClick={toggleStatus}
              className={`relative w-14 h-7 rounded-full transition-all ${restaurant.status === 'Open' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all`}
                style={{ left: restaurant.status === 'Open' ? '30px' : '2px' }} />
            </button>
          </div>
        </div>

        {/* Edit form */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Restaurant Details</h3>
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Restaurant Name</label>
              <input className="input text-sm" value={form.name || ''} onChange={e => f('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cuisine Type</label>
              <input className="input text-sm" value={form.cuisine || ''} onChange={e => f('cuisine', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price Level</label>
              <select className="input text-sm" value={form.priceLevel || '$$'} onChange={e => f('priceLevel', e.target.value)}>
                <option value="$">$ — Budget</option>
                <option value="$$">$$ — Moderate</option>
                <option value="$$$">$$$ — Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Time (min)</label>
              <input type="number" className="input text-sm" value={form.time || 30} onChange={e => f('time', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Fee (ETB)</label>
              <input type="number" className="input text-sm" value={form.fee || 35} onChange={e => f('fee', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order (ETB)</label>
              <input type="number" className="input text-sm" value={form.minOrder || 150} onChange={e => f('minOrder', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input className="input text-sm" value={form.phone || ''} onChange={e => f('phone', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
              <input className="input text-sm" value={form.address || ''} onChange={e => f('address', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea className="input text-sm h-20 resize-none" value={form.description || ''} onChange={e => f('description', e.target.value)} />
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
