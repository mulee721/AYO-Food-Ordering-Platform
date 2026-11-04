import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useCart } from '../../contexts/CartContext'
import { currency } from '../../lib/utils'
import { Trash2, Plus, Minus, Tag, ShoppingBag, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Cart() {
  const navigate = useNavigate()
  const { items, totals, promo, removeItem, updateQty, calculateTotals, applyPromo, setPromo } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  useEffect(() => { calculateTotals() }, [items])

  const handlePromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    try {
      const sub = items.reduce((s, i) => s + i.price * i.quantity, 0)
      const d = await applyPromo(promoCode.trim(), sub)
      toast.success(d.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid promo code') }
    finally { setPromoLoading(false) }
  }

  const removePromo = () => { setPromo(null); setPromoCode('') }

  if (!items.length) {
    return (
      <DashboardLayout title="My Cart">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag size={56} className="text-slate-200 mb-4" />
          <h3 className="font-display font-bold text-slate-700 text-xl mb-2">Your cart is empty</h3>
          <p className="text-slate-400 text-sm mb-6">Browse restaurants and add some delicious food!</p>
          <Link to="/customer/restaurants" className="btn-primary">Browse Restaurants</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Cart">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Items */}
        <div className="xl:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item._key} className="card flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> :
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍲</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">{item.restaurant}</p>
                <p className="text-sm font-bold text-brand-600 mt-0.5">{currency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item._key, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100"><Minus size={13} /></button>
                  <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQty(item._key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100"><Plus size={13} /></button>
                </div>
                <p className="w-20 text-right font-bold text-slate-800 text-sm">{currency(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item._key)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Promo code */}
          <div className="card">
            <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Tag size={16} className="text-brand-500" /> Promo Code</p>
            {promo ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <div>
                  <p className="font-mono font-bold text-emerald-700 text-sm">{promo.promo?.code}</p>
                  <p className="text-xs text-emerald-600">{promo.message}</p>
                </div>
                <button onClick={removePromo} className="text-red-400 text-xs hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className="input flex-1 text-sm" placeholder="Enter code" value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handlePromo()} />
                <button onClick={handlePromo} disabled={promoLoading} className="btn-primary text-sm px-4">Apply</button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="card">
            <p className="font-semibold text-slate-800 mb-4">Order Summary</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium">{currency(totals?.subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Delivery Fee</span><span className="font-medium">{currency(totals?.deliveryFee)}</span></div>
              {totals?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold"><span>Discount</span><span>-{currency(totals.discount)}</span></div>
              )}
              {totals?.qualifiesForFreeDelivery && (
                <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-lg px-2 py-1.5">🎉 Free delivery unlocked!</div>
              )}
              <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold text-slate-800">
                <span>Total</span>
                <span className="text-brand-600">{currency(totals?.total)}</span>
              </div>
            </div>
            <Link to="/customer/checkout" className="btn-primary w-full justify-center mt-5">
              Proceed to Checkout <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
