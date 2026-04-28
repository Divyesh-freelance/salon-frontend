import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'rl_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch { /* storage full — silently skip */ }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  // Persist every change to localStorage
  useEffect(() => { saveCart(items) }, [items])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stockQuantity || 99) }
            : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          finalPrice: product.finalPrice,
          stockQuantity: product.stockQuantity,
          quantity,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === productId
            ? { ...i, quantity: Math.min(quantity, i.stockQuantity || 99) }
            : i
        )
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discountTotal = items.reduce((sum, i) => sum + (i.price - i.finalPrice) * i.quantity, 0)
  const total = subtotal - discountTotal

  const isInCart = useCallback((productId) => items.some((i) => i.id === productId), [items])
  const getItem = useCallback((productId) => items.find((i) => i.id === productId), [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, discountTotal, total, isInCart, getItem }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
