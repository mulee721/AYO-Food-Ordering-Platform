import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import Modal from '../../components/Modal'
import { ordersAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import toast from 'react-hot-toast'

const STATUSES = ['Pending Acceptance','Preparing','Ready for Pickup','Courier Assigned','Picked Up','On the Way','Delivered','Cancelled']

export default function RestaurantOrders() {
  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState({ total: 0, page: 1, pages: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatus] = useState('')
  const [page, setPage]       = useState(1)
  const [selected, setSelected] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    ordersAPI.getAll({ page: p, limit: 20, status: statusFilter || undefined })
      .then(r => { setOrders(r.data.data || []); setMeta(r.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load(page) }, [page, statusFilter])

  const next = (status) => {
    const transitions = {
      'Pending Acceptance': 'Preparing',
      'Preparing': 'Ready for Pickup',
    }
    return transitions[status]
  }

  const advance = async (id, status) => {
    try { await ordersAPI.updateStatus(id, status); toast.success('Status updated'); load(page); setSelected(null) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const columns = [
    { key: 'ref',       label: 'Order ID',  render: v => <span className="font-mono text-xs text-brand-600 font-bold">{v}</span> },
    { key: 'customer',  label: 'Customer',  render: v => v?.name || '—' },
    { key: 'items',     label: 'Items',     render: v => `${(v||[]).length} item(s)` },
    { key: 'total',     label: 'Total',     render: v => <b>{currency(v)}</b> },
    { key: 'status',    label: 'Status',    render: v => <OrderStatusBadge status={v} /> },
    { key: 'createdAt', label: 'Time',      render: v => fmtDateTime(v) },
    {
      key: '_id', label: 'Action',
      render: (_, row) => {
        const n = next(row.status)
        return n ? (
          <button onClick={e => { e.stopPropagation(); advance(row._id, n) }}
            className="btn btn-primary text-xs py-1 px-3">→ {n}</button>
        ) : row.status === 'Pending Acceptance' ? (
          <button onClick={e => { e.stopPropagation(); advance(row._id, 'Cancelled') }}
            className="btn btn-danger text-xs py-1 px-2.5">Reject</button>
        ) : null
      }
    },
  ]

  return (
    <DashboardLayout title="Orders">
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="input w-48 text-sm" value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="self-center text-sm text-slate-500">{meta.total} total orders</span>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={orders} loading={loading} emptyText="No orders yet" onRow={setSelected} />
        <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPage={setPage} />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.ref}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={selected.status} />
              <span className="text-sm text-slate-500">{fmtDateTime(selected.createdAt)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Customer</p>
                <p className="font-semibold">{selected.customer?.name}</p>
                <p className="text-xs text-slate-500">{selected.customer?.phone}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Delivery Address</p>
                <p className="font-semibold text-xs">{selected.deliveryAddress}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Order Items</p>
              {selected.items?.map((it, i) => (
                <div key={i} className="flex justify-between text-sm bg-slate-50 rounded-xl px-3 py-2 mb-1.5">
                  <span>{it.quantity}× {it.name}</span>
                  <span className="font-semibold">{currency(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="bg-brand-50 rounded-xl p-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{currency(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>{currency(selected.deliveryFee)}</span></div>
              {selected.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{currency(selected.discount)}</span></div>}
              <div className="flex justify-between font-bold text-brand-600 border-t border-brand-100 mt-1 pt-1"><span>Total</span><span>{currency(selected.total)}</span></div>
            </div>
            {next(selected.status) && (
              <button onClick={() => advance(selected._id, next(selected.status))} className="btn-primary w-full justify-center">
                → Mark as {next(selected.status)}
              </button>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
