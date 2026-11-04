import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { PageLoader } from '../../components/LoadingSpinner'
import { adminAPI, ordersAPI, restaurantsAPI } from '../../lib/api'
import { currency, fmtDateTime, truncate } from '../../lib/utils'
import { Users, UtensilsCrossed, ShoppingBag, DollarSign } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
const PLACEHOLDER_CHART = Array.from({ length: 7 }, (_, i) => ({
  date: ['Oct 20','Oct 21','Oct 22','Oct 23','Oct 24','Oct 25','Oct 26'][i],
  revenue: [12000, 18000, 15000, 22000, 19000, 28000, 32000][i],
}))

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [oStats, setOStats]   = useState(null)
  const [orders, setOrders]   = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.dashboard(),
      ordersAPI.platformStats(),
      ordersAPI.getAll({ limit: 5, page: 1 }),
      restaurantsAPI.getAll({ sort: 'reviews', limit: 5 }),
    ]).then(([d, os, o, r]) => {
      setStats(d.data)
      setOStats(os.data)
      setOrders(o.data.data || [])
      setRestaurants(r.data.data || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Admin Dashboard"><PageLoader /></DashboardLayout>

  const pieData = oStats ? [
    { name: 'Delivered',  value: oStats.delivered },
    { name: 'Preparing',  value: Math.round(oStats.total * 0.18) },
    { name: 'Picked Up',  value: Math.round(oStats.total * 0.12) },
    { name: 'Cancelled',  value: oStats.cancelled },
  ] : []

  const orderCols = [
    { key: 'ref',        label: 'Order ID',    render: v => <span className="font-mono text-xs text-brand-600">{v}</span> },
    { key: 'customer',   label: 'Customer',    render: v => v?.name || '—' },
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'total',      label: 'Amount',      render: v => <span className="font-semibold">{currency(v)}</span> },
    { key: 'status',     label: 'Status',      render: v => <OrderStatusBadge status={v} /> },
    { key: 'createdAt',  label: 'Time',        render: v => fmtDateTime(v) },
  ]

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Full control. Better decisions.">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-slate-800">Good Morning, Admin 👋</h2>
        <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your platform today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users"      value={(stats?.users?.total || 0).toLocaleString()}     change={12} icon={Users}          color="blue" />
        <StatCard title="Restaurants"      value={(stats?.restaurants?.total || 0).toLocaleString()} change={8}  icon={UtensilsCrossed} color="orange" />
        <StatCard title="Total Orders"     value={(stats?.orders?.total || 0).toLocaleString()}     change={54} icon={ShoppingBag}     color="green" />
        <StatCard title="Total Revenue"    value={currency(stats?.revenue?.gross || 0)}             change={18} icon={DollarSign}      color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Revenue chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={PLACEHOLDER_CHART}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f25822" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f25822" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip formatter={v => [currency(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#f25822" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Order Status</h3>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-display font-bold text-xl text-slate-800">{oStats?.total || 0}</p>
                <p className="text-xs text-slate-400">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-700">
                  {oStats?.total ? Math.round((d.value / oStats.total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs text-brand-500 font-semibold hover:underline">View All</a>
          </div>
          <Table columns={orderCols} data={orders} loading={false} emptyText="No recent orders" />
        </div>

        {/* Top restaurants */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Top Restaurants</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">This Month</span>
          </div>
          <div className="space-y-3">
            {restaurants.map((r, i) => (
              <div key={r._id} className="flex items-center gap-3 py-1.5">
                <span className="w-6 text-center font-bold text-slate-400 text-sm">{i + 1}</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {r.image ? <img src={r.image} alt={r.name} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.cuisine}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{currency(r.fee)}</p>
                  <p className="text-xs text-slate-400">{r.reviewsCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
