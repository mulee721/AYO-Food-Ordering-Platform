import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Modal from '../../components/Modal'
import { cartAPI } from '../../lib/api'
import { fmtDate } from '../../lib/utils'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPromotions() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => {
    cartAPI.getPromos().then(r => setPromos(r.data || [])).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const deletePromo = async (id) => {
    if (!confirm('Delete this promo?')) return
    try { await cartAPI.deletePromo(id); toast.success('Promo deleted'); load() }
    catch { toast.error('Failed') }
  }

  const toggleActive = async (promo) => {
    try {
      await cartAPI.updatePromo(promo._id, { active: !promo.active })
      toast.success('Updated')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <DashboardLayout title="Promotions">
      <div className="flex justify-end mb-5">
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> New Promo Code</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {promos.map(p => (
            <div key={p._id} className={`card border-l-4 ${p.active ? 'border-l-emerald-400' : 'border-l-slate-300'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-bold text-lg text-slate-800 font-mono">{p.code}</p>
                  <span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="btn-ghost p-1.5 text-xs"><Edit2 size={14} /></button>
                  <button onClick={() => deletePromo(p._id)} className="btn-ghost p-1.5 text-xs text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="font-semibold capitalize">{p.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Value</span>
                  <span className="font-semibold text-brand-600">
                    {p.type === 'percentage' ? `${p.value}%` : p.type === 'free_delivery' ? 'Free Delivery' : `${p.value} ETB`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min Order</span>
                  <span className="font-semibold">{p.minOrder} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Used</span>
                  <span className="font-semibold">{p.usageCount} times</span>
                </div>
                {p.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expires</span>
                    <span className="font-semibold">{fmtDate(p.expiresAt)}</span>
                  </div>
                )}
              </div>
              {p.description && <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">{p.description}</p>}
              <button onClick={() => toggleActive(p)} className="btn btn-secondary w-full justify-center mt-3 text-xs">
                {p.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
          {!promos.length && <div className="col-span-3 text-center py-16 text-slate-400">No promo codes yet.</div>}
        </div>
      )}

      <PromoFormModal open={showAdd || !!editing} onClose={() => { setShowAdd(false); setEditing(null) }}
        promo={editing} onSuccess={() => { setShowAdd(false); setEditing(null); load() }} />
    </DashboardLayout>
  )
}

function PromoFormModal({ open, onClose, promo, onSuccess }) {
  const [form, setForm] = useState({ code: '', type: 'fixed', value: 50, minOrder: 200, description: '' })
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (promo) setForm({ code: promo.code, type: promo.type, value: promo.value, minOrder: promo.minOrder, description: promo.description || '' }) }, [promo])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (promo) { await cartAPI.updatePromo(promo._id, form); toast.success('Updated') }
      else { await cartAPI.createPromo(form); toast.success('Promo created') }
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={promo ? 'Edit Promo' : 'New Promo Code'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Code</label>
          <input className="input text-sm font-mono uppercase" placeholder="MIRA50" value={form.code}
            onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} disabled={!!promo} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
          <select className="input text-sm" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            <option value="fixed">Fixed Amount (ETB)</option>
            <option value="percentage">Percentage (%)</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
        </div>
        {form.type !== 'free_delivery' && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Value ({form.type === 'percentage' ? '%' : 'ETB'})
            </label>
            <input type="number" className="input text-sm" value={form.value}
              onChange={e => setForm(p => ({ ...p, value: +e.target.value }))} />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Minimum Order (ETB)</label>
          <input type="number" className="input text-sm" value={form.minOrder}
            onChange={e => setForm(p => ({ ...p, minOrder: +e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
          <input className="input text-sm" placeholder="Brief description" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Saving…' : promo ? 'Save Changes' : 'Create Promo'}
        </button>
      </form>
    </Modal>
  )
}
