import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import { PageLoader } from '../../components/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { ordersAPI, restaurantsAPI, dishesAPI } from '../../lib/api'
import { currency, fmtDateTime } from '../../lib/utils'
import { ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
const BAR_DATA = Array.from({ length: 7 }, (_, i) => ({
  date: ['20','21','22','23','24','25','26'][i],
  orders: [8, 14, 11, 18, 15, 22, 19][i],
}))

export default function RestaurantDashboard() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders]         = useState([])
  const [dishes, setDishes]         = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      restaurantsAPI.getAll({ limit: 1 }),
      ordersAPI.getAll({ limit: 5 }),
      dishesAPI.getAll({ popularOnly: true, limit: 5 }),
    ]).then(([r, o, d]) => {
      setRestaurant(r.data.data?.[0] || null)
      setOrders(o.data.data || [])
      setDishes(d.data.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const pending = orders.filter(o => o.status === 'Pending Acceptance').length
  const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0

  const pieData = [
    { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
    { name: 'Preparing', value: orders.filter(o => o.status === 'Preparing').length },
    { name: 'Picked Up', value: orders.filter(o => ['Ready for Pickup','Courier Assigned','Picked Up'].includes(o.status)).length },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length },
  ]

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status)
      toast.success('Status updated')
      ordersAPI.getAll({ limit: 5 }).then(r => setOrders(r.data.data || []))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const orderCols = [
    { key: 'ref',        label: 'Order ID',  render: v => <span className="font-mono text-xs text-brand-600 font-bold">{v}</span> },
    { key: 'customer',   label: 'Customer',  render: v => v?.name || '—' },
    { key: 'total',      label: 'Amount',    render: v => currency(v) },
    { key: 'status',     label: 'Status',    render: v => <OrderStatusBadge status={v} /> },
    { key: 'createdAt',  label: 'Time',      render: v => fmtDateTime(v) },
    {
      key: '_id', label: 'Action',
      render: (_, row) => {
        const next = {
          'Pending Acceptance': 'Preparing',
          'Preparing': 'Ready for Pickup',
          'Ready for Pickup': 'Courier Assigned',
        }[row.status]
        return next ? (
          <button onClick={e => { e.stopPropagation(); updateStatus(row._id, next) }}
            className="btn btn-primary text-xs py-1 px-3">→ {next}</button>
        ) : null
      }
    },
  ]

  if (loading) return <DashboardLayout title="Restaurant Dashboard"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Restaurant Dashboard" subtitle="Manage your restaurant. Grow your business.">
      {/* Restaurant header */}
      {restaurant && (
        <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
            {restaurant.image ? (
              <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover"
                onError={e => { e.target.src = ''; e.target.onerror = null }} />
            ) : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-bold text-xl text-slate-800">{restaurant.name}</h2>
              <span className={`badge ${restaurant.status === 'Open' ? 'badge-green' : 'badge-gray'}`}>{restaurant.status}</span>
            </div>
            <p className="text-sm text-slate-500">{restaurant.cuisine} · ★ {restaurant.rating} ({restaurant.reviewsCount} reviews)</p>
            <p className="text-xs text-slate-400 mt-0.5">{restaurant.address}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Orders"    value={orders.length}          change={16} icon={ShoppingBag} color="blue" />
        <StatCard title="Total Revenue"   value={currency(totalRevenue)} change={22} icon={DollarSign}  color="green" />
        <StatCard title="Avg. Order Value" value={currency(avgOrder)}    change={12} icon={Clock}       color="orange" />
        <StatCard title="Pending Orders"  value={pending}                icon={AlertCircle}             color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Sales Overview</h3>
            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-400">Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BAR_DATA} barSize={28}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#f25822" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Order Status</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-bold text-lg text-slate-800">{orders.length}</p>
                <p className="text-xs text-slate-400">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mt-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-700">
                  {orders.length ? Math.round((d.value / orders.length) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            <a href="/restaurant/orders" className="text-xs text-brand-500 font-semibold hover:underline">View All</a>
          </div>
          <Table columns={orderCols} data={orders} loading={false} />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Popular Dishes</h3>
            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-400">This Week</span>
          </div>
          <div className="space-y-3">
            {dishes.map((d, i) => (
              <div key={d._id} className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-slate-300 text-sm">{i+1}</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {d.image ? <img src={d.image} alt={d.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> :
                    <div className="w-full h-full flex items-center justify-center">🍲</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.reviews} orders</p>
                </div>
                <p className="text-sm font-bold text-slate-700">{currency(d.price)}</p>
              </div>
            ))}
            {!dishes.length && <p className="text-center text-sm text-slate-400 py-6">No dishes data yet</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
