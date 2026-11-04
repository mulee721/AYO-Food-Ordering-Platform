import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { ordersAPI, usersAPI } from '../../lib/api'
import { currency } from '../../lib/utils'
import { MapPin, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const PAYMENT_OPTIONS = [
  { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Banknote },
  { id: 'Telebirr',         label: 'Telebirr',         icon: Smartphone },
  { id: 'CBE Birr',         label: 'CBE Birr',         icon: Smartphone },
  { id: 'Card',             label: 'Credit/Debit Card', icon: CreditCard },
]

export default function Checkout() {
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const { items, totals, promo, clearCart, calculateTotals } = useCart()
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState({ deliveryAddress: '', deliveryNotes: '', paymentMethod: 'Cash on Delivery', deliveryMethod: 'delivery' })
  const [placing, setPlacing] = useState(false)
  const [done, setDone]       = useState(null)

  useEffect(() => {
    calculateTotals()
    usersAPI.getAddresses().then(r => {
      const list = r.data || []
      setAddresses(list)
      if (list.length) setForm(f => ({ ...f, deliveryAddress: list[0].address }))
    }).catch(() => {})
  }, [])

  if (!items.length && !done) {
    navigate('/customer/cart')
    return null
  }

  const placeOrder = async () => {
    if (!form.deliveryAddress.trim()) { toast.error('Please enter a delivery address'); return }
    if (!form.paymentMethod)          { toast.error('Please select a payment method'); return }
    if (!items.length)                { toast.error('Cart is empty'); return }

    setPlacing(true)
    try {
      const restaurantId = items[0]?.restaurantId || 'unknown'
      const restaurant   = items[0]?.restaurant   || 'Restaurant'

      const payload = {
        restaurantId,
        restaurant,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, selectedOptions: i.selectedOptions || {}, image: i.image || '' })),
        deliveryAddress: form.deliveryAddress,
        deliveryNotes:   form.deliveryNotes,
        deliveryMethod:  form.deliveryMethod,
        paymentMethod:   form.paymentMethod,
        promoCode:       promo?.promo?.code || undefined,
        deliveryFee:     totals?.deliveryFee ?? 35,
        discount:        totals?.discount    ?? 0,
      }

      const { data: order } = await ordersAPI.place(payload)
      clearCart()
      setDone(order)
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (done) {
    return (
      <DashboardLayout title="Order Confirmed">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="font-display font-black text-2xl text-slate-800 mb-2">Order Placed!</h2>
          <p className="text-slate-500 mb-1">Your order has been received.</p>
          <p className="font-mono font-bold text-brand-600 text-lg mb-6">{done.ref}</p>
          <div className="card text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Restaurant</span><span className="font-semibold">{done.restaurant}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold text-brand-600">{currency(done.total)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold">{done.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="badge badge-yellow">{done.status}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/customer/order/${done.ref}`)} className="btn-primary flex-1 justify-center">Track Order</button>
            <button onClick={() => navigate('/customer')} className="btn-secondary flex-1 justify-center">Home</button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Checkout">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: delivery details */}
        <div className="space-y-5">
          {/* Saved addresses */}
          {addresses.length > 0 && (
            <div className="card">
              <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><MapPin size={16} className="text-brand-500" /> Saved Addresses</p>
              <div className="space-y-2">
                {addresses.map(a => (
                  <label key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.deliveryAddress === a.address ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="addr" checked={form.deliveryAddress === a.address}
                      onChange={() => setForm(f => ({ ...f, deliveryAddress: a.address }))} className="accent-brand-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                      <p className="text-xs text-slate-500">{a.address}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Or type a new address</label>
                <input className="input text-sm" placeholder="Full delivery address"
                  value={!addresses.find(a => a.address === form.deliveryAddress) ? form.deliveryAddress : ''}
                  onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} />
              </div>
            </div>
          )}

          {!addresses.length && (
            <div className="card">
              <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><MapPin size={16} className="text-brand-500" /> Delivery Address</p>
              <input className="input text-sm" placeholder="Enter your full delivery address"
                value={form.deliveryAddress} onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))} />
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Delivery Notes (optional)</label>
            <textarea className="input text-sm h-20 resize-none" placeholder="E.g. ring the bell, leave at gate…"
              value={form.deliveryNotes} onChange={e => setForm(f => ({ ...f, deliveryNotes: e.target.value }))} />
          </div>

          {/* Delivery method */}
          <div className="card">
            <p className="font-semibold text-slate-800 mb-3">Delivery Method</p>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: 'delivery', label: '🛵 Delivery' }, { id: 'pickup', label: '🏪 Pickup' }].map(m => (
                <label key={m.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${form.deliveryMethod === m.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                  <input type="radio" name="method" checked={form.deliveryMethod === m.id}
                    onChange={() => setForm(f => ({ ...f, deliveryMethod: m.id }))} className="accent-brand-500" />
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <p className="font-semibold text-slate-800 mb-3">Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map(p => (
                <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === p.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" checked={form.paymentMethod === p.id}
                    onChange={() => setForm(f => ({ ...f, paymentMethod: p.id }))} className="accent-brand-500" />
                  <p.icon size={16} className="text-slate-500" />
                  <span className="text-sm font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="space-y-4">
          <div className="card">
            <p className="font-semibold text-slate-800 mb-4">Order Summary</p>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item._key} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> :
                      <div className="w-full h-full flex items-center justify-center text-lg">🍲</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity}×</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{currency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{currency(totals?.subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Delivery</span><span>{currency(totals?.deliveryFee)}</span></div>
              {totals?.discount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Discount</span><span>-{currency(totals.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base text-slate-800 border-t border-slate-100 pt-2">
                <span>Total</span><span className="text-brand-600">{currency(totals?.total)}</span>
              </div>
            </div>
          </div>

          <button onClick={placeOrder} disabled={placing} className="btn-primary w-full justify-center h-12 text-base">
            {placing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Placing Order…
              </span>
            ) : `Place Order · ${currency(totals?.total)}`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
