import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'
import { PageLoader } from '../../components/LoadingSpinner'
import { usersAPI } from '../../lib/api'
import { statusBadge, roleLabel, fmtDate, getInitials } from '../../lib/utils'
import { Search, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [meta, setMeta]     = useState({ total: 0, page: 1, pages: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRole] = useState('')
  const [page, setPage]     = useState(1)
  const [selected, setSelected] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    usersAPI.getAll({ page: p, limit: 20, role: roleFilter || undefined })
      .then(r => { setUsers(r.data.data || []); setMeta(r.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page, roleFilter])

  const toggleStatus = async (user) => {
    const next = user.status === 'Active' ? 'Suspended' : 'Active'
    try {
      await usersAPI.updateStatus(user._id, next)
      toast.success(`User ${next === 'Active' ? 'activated' : 'suspended'}`)
      load(page)
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'name', label: 'User',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(v)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{v}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'role',   label: 'Role',   render: v => <span className="badge badge-blue">{roleLabel(v)}</span> },
    { key: 'phone',  label: 'Phone',  render: v => v || '—' },
    { key: 'status', label: 'Status', render: v => <span className={statusBadge(v)}>{v}</span> },
    { key: 'createdAt', label: 'Joined', render: v => fmtDate(v) },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <button onClick={e => { e.stopPropagation(); toggleStatus(row) }}
          className={`btn text-xs py-1 px-3 ${row.status === 'Active' ? 'btn-danger' : 'btn-primary'}`}>
          {row.status === 'Active' ? 'Suspend' : 'Activate'}
        </button>
      )
    },
  ]

  return (
    <DashboardLayout title="User Management">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40 text-sm" value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1) }}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="restaurant_owner">Restaurant Owner</option>
          <option value="delivery_agent">Courier</option>
          <option value="admin">Admin</option>
        </select>
        <span className="text-sm text-slate-500">{meta.total} users</span>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={filtered} loading={loading} emptyText="No users found" onRow={setSelected} />
        <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPage={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl font-bold text-white">
                {getInitials(selected.name)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Role</p>
                <p className="font-semibold">{roleLabel(selected.role)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <span className={statusBadge(selected.status)}>{selected.status}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Phone</p>
                <p className="font-semibold">{selected.phone || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Joined</p>
                <p className="font-semibold">{fmtDate(selected.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => toggleStatus(selected)}
                className={`btn flex-1 justify-center ${selected.status === 'Active' ? 'btn-danger' : 'btn-primary'}`}>
                {selected.status === 'Active' ? <><UserX size={16} /> Suspend User</> : <><UserCheck size={16} /> Activate User</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
