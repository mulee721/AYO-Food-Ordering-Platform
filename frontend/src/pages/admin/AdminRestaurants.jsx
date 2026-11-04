import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import { restaurantsAPI } from '../../lib/api'
import { statusBadge, fmtDate } from '../../lib/utils'
import { Search, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminRestaurants() {
  const [data, setData]     = useState([])
  const [meta, setMeta]     = useState({ total: 0, page: 1, pages: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)

  const load = (p = 1) => {
    setLoading(true)
    restaurantsAPI.getAll({ page: p, limit: 20, search: search || undefined })
      .then(r => { setData(r.data.data || []); setMeta(r.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load(page) }, [page])

  const toggleStatus = async (r) => {
    const next = r.status === 'Open' ? 'Closed' : 'Open'
    try {
      await restaurantsAPI.updateStatus(r._id, next)
      toast.success(`Restaurant ${next}`)
      load(page)
    } catch (err) { toast.error('Failed') }
  }

  const deleteR = async (id) => {
    if (!confirm('Delete this restaurant?')) return
    try { await restaurantsAPI.delete(id); toast.success('Deleted'); load(page); setSelected(null) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const columns = [
    {
      key: 'name', label: 'Restaurant',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
            {row.image ? <img src={row.image} alt={v} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> :
              <div className="w-full h-full flex items-center justify-center">🍽️</div>}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{v}</p>
            <p className="text-xs text-slate-400">{row.cuisine}</p>
          </div>
        </div>
      )
    },
    { key: 'status',   label: 'Status',   render: v => <span className={statusBadge(v)}>{v}</span> },
    { key: 'rating',   label: 'Rating',   render: v => <span className="font-semibold">★ {v}</span> },
    { key: 'priceLevel', label: 'Price' },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={e => { e.stopPropagation(); toggleStatus(row) }}
            className="btn btn-secondary text-xs py-1 px-2.5">
            {row.status === 'Open' ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} className="text-slate-400" />}
            {row.status === 'Open' ? 'Close' : 'Open'}
          </button>
          <button onClick={e => { e.stopPropagation(); deleteR(row._id) }}
            className="btn btn-danger text-xs py-1 px-2.5">
            <Trash2 size={12} />
          </button>
        </div>
      )
    },
  ]

  return (
    <DashboardLayout title="Restaurant Management">
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search restaurants…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            onKeyDown={e => e.key === 'Enter' && load(1)} />
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Restaurant</button>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={data} loading={loading} emptyText="No restaurants found" onRow={setSelected} />
        <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPage={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Cuisine', selected.cuisine], ['Status', selected.status],
                ['Rating', `★ ${selected.rating} (${selected.reviewsCount} reviews)`],
                ['Delivery Fee', `${selected.fee} ETB`],
                ['Min Order', `${selected.minOrder} ETB`],
                ['Price Level', selected.priceLevel],
                ['Address', selected.address],
                ['Phone', selected.phone],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-sm">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => toggleStatus(selected)} className="btn btn-secondary flex-1 justify-center text-sm">
                Toggle {selected.status === 'Open' ? 'Closed' : 'Open'}
              </button>
              <button onClick={() => deleteR(selected._id)} className="btn btn-danger text-sm">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <AddRestaurantModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); load(1) }} />
    </DashboardLayout>
  )
}

function AddRestaurantModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ slug: '', name: '', cuisine: '', address: '', phone: '', fee: 35, minOrder: 150 })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.slug || !form.name || !form.cuisine) { toast.error('Slug, name, and cuisine are required'); return }
    setLoading(true)
    try {
      await restaurantsAPI.create(form)
      toast.success('Restaurant created!')
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Restaurant">
      <form onSubmit={submit} className="space-y-3">
        {[
          { label: 'Slug (unique ID)', key: 'slug', placeholder: 'e.g. my-restaurant' },
          { label: 'Name', key: 'name', placeholder: 'Restaurant name' },
          { label: 'Cuisine', key: 'cuisine', placeholder: 'e.g. Ethiopian Cuisine' },
          { label: 'Address', key: 'address', placeholder: 'Full address' },
          { label: 'Phone', key: 'phone', placeholder: '+251 9xx xxx xxx' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
            <input className="input text-sm" placeholder={f.placeholder}
              value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Fee (ETB)</label>
            <input type="number" className="input text-sm" value={form.fee}
              onChange={e => setForm(p => ({ ...p, fee: +e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order (ETB)</label>
            <input type="number" className="input text-sm" value={form.minOrder}
              onChange={e => setForm(p => ({ ...p, minOrder: +e.target.value }))} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
          {loading ? 'Creating…' : 'Create Restaurant'}
        </button>
      </form>
    </Modal>
  )
}
