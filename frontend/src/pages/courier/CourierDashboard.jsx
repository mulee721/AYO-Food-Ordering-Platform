import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import Table from '../../components/Table'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import Modal from '../../components/Modal'
import { PageLoader } from '../../components/LoadingSpinner'
import { couriersAPI, ordersAPI } from '../../lib/api'
import { currency, fmtDateTime, getInitials } from '../../lib/utils'
import { MapPin, Phone, Navigation, TrendingUp, Package, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourierDashboard() {
  const [courier, setCourier]     = useState(null)
  const [orders, setOrders]       = useState([])
  const [activeOrder, setActive]  = useState(null)
  const [loading, setLoading]     = useState(true)
  const [toggling, setToggling]   = useState(false)

  const loadData = async () => {
    try {
      const [cm, om] = await Promise.all([
        couriersAPI.getMe().catch(() => ({ data: null })),
        ordersAPI.getAll({ limit: 8 }).catch(() => ({ data: { data: [] } })),
      ])
      setCourier(cm.data)
      const allOrders = om.data.data || []
      setOrders(allOrders)
      setActive(allOrders.find(o => ['Courier Assigned','Picked Up','On the Way'].includes(o.status)) || null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const toggleOnline = async () => {
    if (!courier) return
    setToggling(true)
    try {
      await couriersAPI.toggleOnline(courier._id)
      toast.success(courier.isOnline ? 'You are now offline' : 'You are now online!')
      const c = await couriersAPI.getMe()
      setCourier(c.data)
    } catch (err) { toast.error('Failed') }
    finally { setToggling(false) }
  }

  const advanceStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status)
      toast.success(`Order marked as ${status}`)
      if (status === 'Delivered' && courier) {
        await couriersAPI.recordDelivery(courier._id, 35)
      }
      await loadData()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const nextStatus = {
    'Courier Assigned': 'Picked Up',
    'Picked Up': 'On the Way',
    'On the Way': 'Delivered',
  }

  const historyCols = [
    { key: 'ref',       label: 'Order ID',   render: v => <span className="font-mono text-xs text-brand-600 font-bold">{v}</span> },
    { key: 'restaurant',label: 'Restaurant' },
    { key: 'total',     label: 'Amount',     render: v => currency(v) },
    { key: 'status',    label: 'Status',     render: v => <OrderStatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date',       render: v => fmtDateTime(v) },
  ]

  if (loading) return <DashboardLayout title="Courier Dashboard"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Courier Dashboard" subtitle="Delivering happiness, one order at a time.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">

        {/* Online toggle + map placeholder */}
        <div className="xl:col-span-2 card space-y-4">
          {/* Status toggle */}
          <div className={`flex items-center justify-between p-4 rounded-2xl ${courier?.isOnline ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${courier?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <div>
                <p className={`font-bold text-sm ${courier?.isOnline ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {courier?.isOnline ? 'You are Online' : 'You are Offline'}
                </p>
                <p className="text-xs text-slate-400">
                  {courier?.isOnline ? 'Ready to receive delivery requests' : 'Go online to receive orders'}
                </p>
              </div>
            </div>
            <button onClick={toggleOnline} disabled={toggling}
              className={`relative w-14 h-7 rounded-full transition-all flex-shrink-0 ${courier?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${courier?.isOnline ? 'left-7.5' : 'left-0.5'}`}
                style={{ left: courier?.isOnline ? '30px' : '2px' }} />
            </button>
          </div>

          {/* Map placeholder */}
          <div className="rounded-2xl bg-slate-100 overflow-hidden" style={{ height: 240 }}>
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <MapPin size={32} className="text-brand-400" />
              <p className="font-semibold text-sm text-slate-600">Nearby Orders Map</p>
              <p className="text-xs">GPS map integration — Everywhere delivery zones</p>
              {activeOrder && (
                <div className="mt-2 bg-white rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 shadow">
                  📍 Active: {activeOrder.ref} — {activeOrder.restaurant}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Earnings card */}
          <div className="card">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Today's Earnings</p>
            <div className="flex items-end gap-2">
              <p className="font-display font-bold text-3xl text-slate-800">{currency(courier?.earningsToday || 0)}</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-1">
                <TrendingUp size={12} /> 18%
              </div>
            </div>
          </div>

          {/* Today's stats */}
          <div className="card">
            <p className="font-semibold text-slate-800 mb-3">Today's Stats</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Package size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Completed Deliveries</p>
                  <p className="font-bold text-slate-800">{courier?.deliveriesToday || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <Navigation size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Distance</p>
                  <p className="font-bold text-slate-800">{(courier?.deliveriesToday || 0) * 4.6} km</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Zap size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Earnings</p>
                  <p className="font-bold text-slate-800">{currency(courier?.totalEarnings || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active delivery */}
          {activeOrder && (
            <div className="card border-2 border-brand-200 bg-brand-50">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-slate-800">Current Delivery</p>
                <OrderStatusBadge status={activeOrder.status} />
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍽️</span>
                  <div>
                    <p className="text-xs text-slate-400">Restaurant</p>
                    <p className="font-semibold">{activeOrder.restaurant}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <div>
                    <p className="text-xs text-slate-400">Customer</p>
                    <p className="font-semibold">{activeOrder.customer?.name}</p>
                  </div>
                </div>
              </div>
              {nextStatus[activeOrder.status] && (
                <button onClick={() => advanceStatus(activeOrder._id, nextStatus[activeOrder.status])}
                  className="btn-primary w-full justify-center text-sm mb-2">
                  <Navigation size={15} /> {nextStatus[activeOrder.status] === 'Delivered' ? '✓ Confirm Delivered' : `→ ${nextStatus[activeOrder.status]}`}
                </button>
              )}
              {activeOrder.customer?.phone && (
                <a href={`tel:${activeOrder.customer.phone}`} className="btn btn-secondary w-full justify-center text-sm">
                  <Phone size={14} /> Call Customer
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order history */}
      <div className="card p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Order History</h3>
          <a href="/courier/deliveries" className="text-xs text-brand-500 font-semibold hover:underline">View All</a>
        </div>
        <Table columns={historyCols} data={orders} loading={false} emptyText="No deliveries yet" />
      </div>
    </DashboardLayout>
  )
}
