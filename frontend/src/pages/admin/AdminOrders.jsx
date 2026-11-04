import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import Modal from '../../components/Modal'
import { ordersAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['Pending Acceptance','Preparing','Ready for Pickup','Courier Assigned','Picked Up','On the Way','Delivered','Cancelled']

export default function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState({ total: 0, page: 1, pages: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]       = useState(1)
  const [selected, setSelected] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    ordersAPI.getAll({ page: p, limit: 20, status: statusFilter || undefined })
      .then(r => { setOrders(r.data.data || []); setMeta(r.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load(page) }, [page, statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status)
      toast.success('Order status updated')
      load(page); setSelected(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const columns = [
    { key: 'ref',       label: 'Order ID',   render: v => <span className="font-mono text-xs text-brand-600 font-semibold">{v}</span> },
    { key: 'customer',  label: 'Customer',   render: v => v?.name || '—' },
    { key: 'restaurant',label: 'Restaurant' },
    { key: 'total',     label: 'Amount',     render: v => <b>{currency(v)}</b> },
    { key: 'status',    label: 'Status',     render: v => <OrderStatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date',       render: v => fmtDateTime(v) },
  ]

  return (
    <DashboardLayout title="Orders Management">
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="input w-48 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-slate-500 self-center">{meta.total} orders</span>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={orders} loading={loading} emptyText="No orders found" onRow={setSelected} />
        <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPage={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.ref}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Restaurant</p>
                <p className="font-semibold">{selected.restaurant}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Customer</p>
                <p className="font-semibold">{selected.customer?.name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Total</p>
                <p className="font-bold text-brand-600">{currency(selected.total)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Payment</p>
                <p className="font-semibold">{selected.paymentMethod}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Items</p>
              <div className="space-y-2">
                {selected.items?.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm bg-slate-50 rounded-xl px-3 py-2">
                    <span>{it.quantity}× {it.name}</span>
                    <span className="font-semibold">{currency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.filter(s => s !== selected.status).map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    className="btn btn-secondary text-xs py-1.5">
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
