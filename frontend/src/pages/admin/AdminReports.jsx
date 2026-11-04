import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { PageLoader } from '../../components/LoadingSpinner'
import { adminAPI, ordersAPI, restaurantsAPI, couriersAPI } from '../../lib/api'
import { currency } from '../../lib/utils'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
const MONTHLY = [
  { month: 'Jul', revenue: 42000, orders: 280 },
  { month: 'Aug', revenue: 58000, orders: 340 },
  { month: 'Sep', revenue: 51000, orders: 310 },
  { month: 'Oct', revenue: 73000, orders: 420 },
  { month: 'Nov', revenue: 69000, orders: 390 },
  { month: 'Dec', revenue: 88000, orders: 510 },
]

export default function AdminReports() {
  const [stats, setStats]     = useState(null)
  const [oStats, setOStats]   = useState(null)
  const [rStats, setRStats]   = useState(null)
  const [cStats, setCStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.dashboard(),
      ordersAPI.platformStats(),
      restaurantsAPI.getStats(),
      couriersAPI.getStats(),
    ]).then(([a, o, r, c]) => {
      setStats(a.data)
      setOStats(o.data)
      setRStats(r.data)
      setCStats(c.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Reports & Analytics"><PageLoader /></DashboardLayout>

  const orderPie = oStats ? [
    { name: 'Delivered', value: oStats.delivered || 0 },
    { name: 'Active',    value: oStats.active    || 0 },
    { name: 'Cancelled', value: oStats.cancelled || 0 },
  ] : []

  return (
    <DashboardLayout title="Reports & Analytics">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Revenue',    value: currency(oStats?.revenue || 0)  },
          { label: 'Platform Commission (15%)', value: currency(oStats?.commission || 0) },
          { label: 'Total Orders',     value: (oStats?.total || 0).toLocaleString() },
          { label: 'Delivery Rate',    value: oStats?.total ? `${Math.round((oStats.delivered/oStats.total)*100)}%` : '—' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="font-display font-bold text-2xl text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Monthly Revenue Trend</h3>
          <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-400">Last 6 Months</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={MONTHLY}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f25822" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f25822" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
            <Tooltip formatter={v => [currency(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#f25822" strokeWidth={2.5} fill="url(#revGrad2)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Orders bar chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Order Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} barSize={28}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderPie} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {orderPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Platform stats */}
        <div className="card xl:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Platform Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',       value: stats?.users?.total || 0 },
              { label: 'Active Restaurants',value: rStats?.open || 0 },
              { label: 'Total Restaurants', value: rStats?.total || 0 },
              { label: 'Online Couriers',   value: cStats?.online || 0 },
              { label: 'Total Couriers',    value: cStats?.total || 0 },
              { label: 'Total Deliveries',  value: cStats?.totalDeliveries || 0 },
              { label: 'Platform Paid',     value: currency(cStats?.totalEarnings || 0) },
              { label: 'Net Commission',    value: currency(oStats?.commission || 0) },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                <p className="font-display font-bold text-xl text-slate-800">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
