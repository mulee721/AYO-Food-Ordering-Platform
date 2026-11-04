import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import { usersAPI } from '../../lib/api'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerAddresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ label: '', address: '', note: '' })
  const [saving, setSaving]       = useState(false)

  const load = () => {
    usersAPI.getAddresses().then(r => setAddresses(r.data || [])).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const deleteAddr = async (id) => {
    if (!confirm('Remove this address?')) return
    try { await usersAPI.deleteAddress(id); toast.success('Address removed'); load() }
    catch { toast.error('Failed') }
  }

  const saveAddr = async (e) => {
    e.preventDefault()
    if (!form.label || !form.address) { toast.error('Label and address are required'); return }
    setSaving(true)
    try {
      await usersAPI.addAddress(form)
      toast.success('Address saved!')
      setShowAdd(false)
      setForm({ label: '', address: '', note: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout title="My Addresses">
      <div className="flex justify-end mb-5">
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Address</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : !addresses.length ? (
        <EmptyState icon="📍" title="No saved addresses" description="Add your delivery locations for faster checkout."
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}>Add First Address</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {addresses.map(a => (
            <div key={a.id} className="card flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-brand-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{a.label}</p>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{a.address}</p>
                  {a.note && <p className="text-xs text-slate-400 mt-1 italic">{a.note}</p>}
                </div>
              </div>
              <button onClick={() => deleteAddr(a.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Address">
        <form onSubmit={saveAddr} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Label *</label>
            <input className="input text-sm" placeholder="e.g. Home, Work, Mom's house"
              value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Address *</label>
            <textarea className="input text-sm h-20 resize-none" placeholder="Street, area, city…"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Note (optional)</label>
            <input className="input text-sm" placeholder="e.g. Ring bell twice"
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            {saving ? 'Saving…' : 'Save Address'}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
