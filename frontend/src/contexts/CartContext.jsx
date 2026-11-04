import React, { createContext, useContext, useState, useCallback } from 'react'
import { cartAPI } from '../lib/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems]   = useState([])
  const [promo, setPromo]   = useState(null)
  const [totals, setTotals] = useState(null)

  const addItem = useCallback((dish, qty = 1, opts = {}) => {
    setItems(prev => {
      const key = dish._id + JSON.stringify(opts)
      const existing = prev.find(i => i._key === key)
      if (existing) return prev.map(i => i._key === key ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { _key: key, id: dish.slug || dish._id, _id: dish._id, name: dish.name, price: dish.price, restaurant: dish.restaurant, restaurantId: dish.restaurantId, image: dish.image, quantity: qty, selectedOptions: opts }]
    })
  }, [])

  const removeItem = useCallback((_key) => setItems(prev => prev.filter(i => i._key !== _key)), [])

  const updateQty = useCallback((_key, qty) => {
    if (qty <= 0) { removeItem(_key); return }
    setItems(prev => prev.map(i => i._key === _key ? { ...i, quantity: qty } : i))
  }, [removeItem])

  const clearCart = useCallback(() => { setItems([]); setPromo(null); setTotals(null) }, [])

  const applyPromo = useCallback(async (code, subtotal) => {
    const { data } = await cartAPI.validatePromo(code, subtotal)
    setPromo(data)
    return data
  }, [])

  const calculateTotals = useCallback(async () => {
    if (!items.length) { setTotals(null); return null }
    const { data } = await cartAPI.calculate(
      items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })),
      promo?.promo?.code
    )
    setTotals(data)
    return data
  }, [items, promo])

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, promo, totals, itemCount, addItem, removeItem, updateQty, clearCart, applyPromo, calculateTotals, setPromo }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
