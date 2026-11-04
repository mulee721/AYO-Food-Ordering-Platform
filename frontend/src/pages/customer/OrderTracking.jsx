import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { PageLoader } from '../../components/LoadingSpinner'
import { ordersAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import { CheckCircle, Circle, Truck, Phone, ChevronLeft, RefreshCw } from 'lucide-react'

export default function OrderTracking() {
  const { ref }     = useParams()
  const [order, setOrder]         = useState(null)
  const [tracking, setTracking]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const intervalRef = useRef(null)

  const loadData = async () => {
    try {
      const [o, t] = await Promise.all([
        ordersAPI.getByRef(ref),
        ordersAPI.track(ref),
      ])
      setOrder(o.data)
      setTracking(t.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadData()
    // Poll every 15s if not delivered/cancelled
    intervalRef.current = setInterval(() => {
      if (!order || !['Delivered','Cancelled'].includes(order.status)) loadData()
    }, 15000)
    return () => clearInterval(intervalRef.current)
  }, [ref])

  if (loading) return <DashboardLayout title="Order Tracking"><PageLoader /></DashboardLayout>
  if (!order)  return <DashboardLayout title="Order Tracking"><div className="text-center py-20 text-slate-400">Order not found.</div></DashboardLayout>

  return (
    <DashboardLayout title={`Order ${ref}`}>
      <Link to="/customer/orders" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-500 mb-5">
        <ChevronLeft size={16} /> Back to Orders
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Tracking timeline */}
        <div className="xl:col-span-2 space-y-4">
          {/* Header */}
          <div className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-mono font-bold text-brand-600 text-lg">{order.ref}</p>
                <p className="text-slate-600 text-sm">{order.restaurant}</p>
                <p className="text-xs text-slate-400 mt-0.5">{fmtDateTime(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <OrderStatusBadge status={order.status} />
                <p className="font-bold text-brand-600 mt-1.5">{currency(order.total)}</p>
              </div>
            </div>

            {/* Progress bar */}
            {order.status !== 'Cancelled' && tracking && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Progress</span>
                  <span>{tracking.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                    style={{ width: `${tracking.progress}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Estimated: <b>{order.estimatedDeliveryMinutes} min</b>
                </p>
              </div>
            )}
          </div>

          {/* Timeline steps */}
          {tracking && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-5">Delivery Status</h3>
              <div className="space-y-0">
                {tracking.steps.map((step, i) => (
                  <div key={step.label} className="flex gap-4">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all ${
                        step.active    ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-200' :
                        step.completed ? 'bg-emerald-500 border-emerald-500 text-white' :
                                         'bg-white border-slate-200 text-slate-300'
                      }`}>
                        {step.completed && !step.active ? <CheckCircle size={16} /> : (
                          <span className="text-xs font-bold">{i + 1}</span>
                        )}
                      </div>
                      {i < tracking.steps.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${step.completed ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-5 min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${step.active ? 'text-brand-600' : step.completed ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step.label}
                        {step.active && <span className="ml-2 inline-block w-2 h-2 bg-brand-500 rounded-full animate-ping" />}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-slate-400 mt-0.5">{fmtDateTime(step.timestamp)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.items?.map((it, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> :
                        <div className="w-full h-full flex items-center justify-center">🍲</div>}
                    </div>
                    <span className="font-medium text-slate-700">{it.quantity}× {it.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{currency(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{currency(order.subtotal)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Delivery</span><span>{currency(order.deliveryFee)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{currency(order.discount)}</span></div>}
              <div className="flex justify-between font-bold text-slate-800"><span>Total</span><span className="text-brand-600">{currency(order.total)}</span></div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Courier info */}
          {order.courierName && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Truck size={16} className="text-brand-500" /> Your Courier</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {order.courierName[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{order.courierName}</p>
                  <p className="text-xs text-slate-400">★ 4.9 · Delivery Agent</p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery details */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Delivery Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Address</p>
                <p className="font-medium text-slate-700">{order.deliveryAddress}</p>
              </div>
              {order.deliveryNotes && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Notes</p>
                  <p className="font-medium text-slate-700">{order.deliveryNotes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Payment</p>
                <p className="font-medium text-slate-700">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <button onClick={loadData} className="btn btn-secondary w-full justify-center">
            <RefreshCw size={14} /> Refresh Status
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
