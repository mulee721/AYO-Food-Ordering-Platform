import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { currency } from '../../lib/utils'

const MOCK_TRANSACTIONS = [
  { id: 1, type: 'credit',  label: 'Added Money',     amount: 200, date: '2026-10-20' },
  { id: 2, type: 'debit',   label: 'Order #AYO-893041', amount: -180, date: '2026-10-21' },
  { id: 3, type: 'credit',  label: 'Refund',          amount: 35,  date: '2026-10-22' },
  { id: 4, type: 'debit',   label: 'Order #AYO-421098', amount: -245, date: '2026-10-23' },
]

export default function CustomerWallet() {
  const balance = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0)

  return (
    <DashboardLayout title="My Wallet">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Balance card */}
        <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 text-white p-7 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -right-2 bottom-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={20} className="text-brand-400" />
              <span className="text-sm font-medium text-slate-300">AYO Wallet</span>
            </div>
            <p className="font-display font-black text-4xl mb-1">{currency(Math.max(0, balance))}</p>
            <p className="text-slate-400 text-sm">Available balance</p>
            <button className="mt-5 btn-primary bg-brand-500 text-sm flex items-center gap-2">
              <Plus size={15} /> Add Money
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Transaction History</h3>
          <div className="space-y-2">
            {MOCK_TRANSACTIONS.map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {t.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-400">{t.date}</p>
                </div>
                <span className={`font-bold text-sm ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.amount > 0 ? '+' : ''}{currency(Math.abs(t.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
