import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../lib/utils'

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'blue', suffix = '' }) {
  const colorMap = {
    blue:   'bg-blue-50   text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50  text-orange-600',
    purple: 'bg-purple-50  text-purple-600',
    red:    'bg-red-50     text-red-600',
    amber:  'bg-amber-50   text-amber-600',
  }
  const isPositive = change >= 0

  return (
    <div className="stat-card">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="mt-1.5 font-display font-bold text-2xl text-slate-800 leading-tight">
          {value}{suffix}
        </p>
        {change != null && (
          <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-semibold', isPositive ? 'text-emerald-600' : 'text-red-500')}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{change}% {changeLabel || 'vs last week'}
          </div>
        )}
      </div>
      {Icon && (
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3', colorMap[color])}>
          <Icon size={22} />
        </div>
      )}
    </div>
  )
}
