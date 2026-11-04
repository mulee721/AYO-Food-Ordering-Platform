import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import { couriersAPI } from '../../lib/api'
import { currency, getInitials } from '../../lib/utils'
import { Plus, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([couriersAPI.getAll(), couriersAPI.getStats()])
      .then(([c, s]) => { setCouriers(c.data || []); setStats(s.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const columns = [
    {
      key: 'name', label: 'Courier',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(v)}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${row.isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{v}</p>
            <p className="text-xs text-slate-400">{row.vehicle?.split('(')[0]?.trim() || '—'}</p>
          </div>
        </div>
      )
    },
    { key: 'isOnline',        label: 'Status',    render: v => v ? <span className="badge-green">Online</span> : <span className="badge-gray">Offline</span> },
    { key: 'zone',            label: 'Zone',      render: v => v || '—' },
    { key: 'rating',          label: 'Rating',    render: v => `★ ${v}` },
    { key: 'deliveriesToday', label: 'Today',     render: v => `${v} deliveries` },
    { key: 'earningsToday',   label: 'Earnings',  render: v => currency(v) },
  ]

  return (
    <DashboardLayout title="Courier Fleet">
      {/* Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Couriers', value: stats.total },
            { label: 'Online Now',     value: stats.online },
            { label: 'Total Deliveries', value: stats.totalDeliveries },
            { label: 'Platform Paid',  value: currency(stats.totalEarnings) },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="font-display font-bold text-xl text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Courier</button>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={couriers} loading={loading} emptyText="No couriers found" onRow={setSelected} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Courier Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                {getInitials(selected.name)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.phone}</p>
                <span className={selected.isOnline ? 'badge-green' : 'badge-gray'}>{selected.isOnline ? '● Online' : '● Offline'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Vehicle', selected.vehicle],
                ['Zone',    selected.zone],
                ['Rating',  `★ ${selected.rating}`],
                ['Deliveries Today', selected.deliveriesToday],
                ['Earnings Today', currency(selected.earningsToday)],
                ['Total Deliveries', selected.totalDeliveries],
                ['Total Earnings', currency(selected.totalEarnings)],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{k}</p>
                  <p className="font-semibold">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <AddCourierModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); load() }} />
    </DashboardLayout>
  )
}

function AddCourierModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ userId: '', name: '', phone: '', vehicle: '', zone: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.userId || !form.name) { toast.error('User ID and name required'); return }
    setLoading(true)
    try {
      await couriersAPI.create(form)
      toast.success('Courier profile created!')
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Courier Profile">
      <form onSubmit={submit} className="space-y-3">
        {[
          { label: 'User ID (MongoDB _id)', key: 'userId', placeholder: 'User _id from database' },
          { label: 'Full Name', key: 'name', placeholder: 'Courier name' },
          { label: 'Phone', key: 'phone', placeholder: '+251 9xx xxx xxx' },
          { label: 'Vehicle', key: 'vehicle', placeholder: 'e.g. TVS Apache 160' },
          { label: 'Zone', key: 'zone', placeholder: 'e.g. Bole / Atlas' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
            <input className="input text-sm" placeholder={f.placeholder}
              value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Creating…' : 'Create Courier'}
        </button>
      </form>
    </Modal>
  )
}
