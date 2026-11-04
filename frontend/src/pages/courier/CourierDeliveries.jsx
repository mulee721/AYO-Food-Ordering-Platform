import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { ordersAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function CourierDeliveries() {
  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState({ total: 0, page: 1, pages: 1, limit: 20 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)

  const load = (p = 1) => {
    setLoading(true)
    ordersAPI.getAll({ page: p, limit: 20 })
      .then(r => { setOrders(r.data.data || []); setMeta(r.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load(page) }, [page])

  const advance = async (id, status) => {
    try { await ordersAPI.updateStatus(id, status); toast.success('Updated'); load(page) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const nextStatus = { 'Courier Assigned': 'Picked Up', 'Picked Up': 'On the Way', 'On the Way': 'Delivered' }

  const columns = [
    { key: 'ref',       label: 'Order ID',   render: v => <span className="font-mono text-xs text-brand-600 font-bold">{v}</span> },
    { key: 'restaurant',label: 'Restaurant' },
    { key: 'customer',  label: 'Customer',   render: v => v?.name || '—' },
    { key: 'total',     label: 'Amount',     render: v => currency(v) },
    { key: 'status',    label: 'Status',     render: v => <OrderStatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date',       render: v => fmtDateTime(v) },
    {
      key: '_id', label: 'Action',
      render: (_, row) => {
        const n = nextStatus[row.status]
        return n ? (
          <button onClick={e => { e.stopPropagation(); advance(row._id, n) }}
            className="btn btn-primary text-xs py-1 px-3">→ {n === 'Delivered' ? '✓ Delivered' : n}</button>
        ) : null
      }
    },
  ]

  return (
    <DashboardLayout title="My Deliveries">
      <div className="card p-0">
        <Table columns={columns} data={orders} loading={loading} emptyText="No deliveries yet" />
        <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPage={setPage} />
      </div>
    </DashboardLayout>
  )
}
