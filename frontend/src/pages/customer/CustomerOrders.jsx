import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import Pagination from '../../components/Pagination'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { PageLoader } from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { ordersAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import { ShoppingBag, ChevronRight } from 'lucide-react'

export default function CustomerOrders() {
  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState({ total: 0, page: 1, pages: 1, limit: 10 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    setLoading(true)
    ordersAPI.myOrders({ page, limit: 10 })
      .then(r => { setOrders(r.data.data || []); setMeta(r.data) })
      .catch(console.error).finally(() => setLoading(false))
  }, [page])

  const filtered = orders.filter(o => !filter || o.status === filter)

  const STATUSES = ['Pending Acceptance','Preparing','Ready for Pickup','Courier Assigned','Picked Up','On the Way','Delivered','Cancelled']

  if (loading) return <DashboardLayout title="My Orders"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="My Orders">
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setFilter('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${!filter ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'}`}>
          All
        </button>
        {['Pending Acceptance','Preparing','On the Way','Delivered','Cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === s ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState icon="📦" title="No orders yet" description="Start browsing restaurants and place your first order!"
          action={<Link to="/customer/restaurants" className="btn-primary">Browse Restaurants</Link>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Link key={order._id} to={`/customer/order/${order.ref}`}
              className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer block">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={22} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-brand-600">{order.ref}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm text-slate-700 font-medium mt-0.5">{order.restaurant}</p>
                <p className="text-xs text-slate-400">{fmtDateTime(order.createdAt)} · {(order.items||[]).length} item(s)</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-800">{currency(order.total)}</p>
                <p className="text-xs text-slate-400">{order.paymentMethod}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      <div className="card mt-4 p-0">
        <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={meta.limit} onPage={setPage} />
      </div>
    </DashboardLayout>
  )
}
