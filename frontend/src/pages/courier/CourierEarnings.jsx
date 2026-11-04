import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { PageLoader } from '../../components/LoadingSpinner'
import { couriersAPI } from '../../lib/api'
import { currency } from '../../lib/utils'
import { DollarSign, Package, TrendingUp, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const WEEKLY_DATA = [
  { day: 'Mon', earnings: 120 }, { day: 'Tue', earnings: 175 },
  { day: 'Wed', earnings: 140 }, { day: 'Thu', earnings: 210 },
  { day: 'Fri', earnings: 195 }, { day: 'Sat', earnings: 245 },
  { day: 'Sun', earnings: 180 },
]

export default function CourierEarnings() {
  const [courier, setCourier] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    couriersAPI.getMe().then(r => setCourier(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Earnings"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Earnings">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Earnings",  value: currency(courier?.earningsToday  || 0), icon: DollarSign, color: 'bg-green-50  text-green-600' },
          { label: 'Deliveries Today',  value: courier?.deliveriesToday  || 0,          icon: Package,    color: 'bg-blue-50   text-blue-600' },
          { label: 'Total Earnings',    value: currency(courier?.totalEarnings  || 0),  icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
          { label: 'Total Deliveries',  value: courier?.totalDeliveries  || 0,          icon: Star,       color: 'bg-amber-50  text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Weekly Earnings</h3>
          <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-400">This Week</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={WEEKLY_DATA} barSize={32}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v} ETB`} />
            <Tooltip formatter={v => [currency(v), 'Earnings']} />
            <Bar dataKey="earnings" fill="#f25822" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Earnings Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Base Pay per Delivery', value: '35 ETB', note: 'Standard rate' },
            { label: 'Customer Tips (Estimated)', value: currency(Math.round((courier?.totalEarnings || 0) * 0.1)), note: '~10% of earnings' },
            { label: 'Bonus Deliveries', value: '0 ETB', note: 'Peak hour bonuses' },
            { label: 'Net Total', value: currency(courier?.totalEarnings || 0), note: 'All time', bold: true },
          ].map(row => (
            <div key={row.label} className={`flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 ${row.bold ? 'font-bold text-brand-600' : ''}`}>
              <div>
                <p className="text-sm text-slate-800">{row.label}</p>
                <p className="text-xs text-slate-400">{row.note}</p>
              </div>
              <span className="font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
