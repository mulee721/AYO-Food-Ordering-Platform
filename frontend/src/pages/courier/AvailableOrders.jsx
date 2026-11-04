import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { PageLoader } from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { ordersAPI, couriersAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import { MapPin, Clock, DollarSign, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AvailableOrders() {
  const [orders, setOrders]   = useState([])
  const [courier, setCourier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)

  const load = async () => {
    try {
      const [o, c] = await Promise.all([
        ordersAPI.getAll({ status: 'Ready for Pickup', limit: 20 }),
        couriersAPI.getMe().catch(() => ({ data: null })),
      ])
      setOrders(o.data.data || [])
      setCourier(c.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const accept = async (order) => {
    if (!courier) { toast.error('Courier profile not found'); return }
    setAccepting(order._id)
    try {
      await ordersAPI.assignCourier(order._id, courier._id, courier.name)
      toast.success('Order accepted! Head to the restaurant.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setAccepting(null) }
  }

  if (loading) return <DashboardLayout title="Available Orders"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Available Orders">
      {!courier?.isOnline && (
        <div className="card bg-amber-50 border border-amber-200 mb-5 flex items-center gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="font-semibold text-amber-800">You are offline</p>
            <p className="text-xs text-amber-600">Go online from the dashboard to accept orders.</p>
          </div>
        </div>
      )}

      {!orders.length ? (
        <EmptyState icon="📦" title="No available orders" description="Orders marked 'Ready for Pickup' will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map(order => (
            <div key={order._id} className="card border border-slate-200 hover:border-brand-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-xs text-brand-600 font-bold">{order.ref}</span>
                <span className="badge badge-blue">Ready for Pickup</span>
              </div>
              <p className="font-semibold text-slate-800">{order.restaurant}</p>
              <div className="space-y-1.5 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-brand-400" />
                  <span className="truncate">{order.deliveryAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={13} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700">{currency(order.total)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} />
                  <span>{fmtDateTime(order.createdAt)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{(order.items||[]).length} item(s)</span>
                  <span>Earn: <b className="text-emerald-600">35 ETB</b></span>
                </div>
                <button
                  onClick={() => accept(order)}
                  disabled={accepting === order._id || !courier?.isOnline}
                  className="btn-primary w-full justify-center text-sm disabled:opacity-50">
                  {accepting === order._id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Accepting…
                    </span>
                  ) : <><Zap size={14} /> Accept Assignment</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
