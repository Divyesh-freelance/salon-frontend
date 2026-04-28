import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { formatPrice, getImageUrl } from '../../utils/format'
import EmptyState from '../../components/shared/EmptyState'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, discountTotal, total, clearCart } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-48 pb-32">
        <EmptyState
          title="Your cart is empty"
          message="Discover our premium beauty products and add them to your cart."
          action={{ label: 'Browse Products', onClick: () => navigate('/products') }}
        />
      </div>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex items-baseline justify-between mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900">Your Cart</h1>
          <button onClick={clearCart} className="font-sans text-xs text-stone-400 uppercase tracking-widest hover:text-red-500 transition-colors">
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-5 bg-white border border-stone-100 p-5"
                >
                  <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                    <div className="w-24 h-24 overflow-hidden bg-stone-50">
                      <img src={getImageUrl(item.thumbnail)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-serif text-lg text-stone-900 hover:text-amber-700 transition-colors leading-snug mb-1 line-clamp-2">{item.name}</h3>
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-sans text-sm font-semibold text-stone-900">{formatPrice(item.finalPrice)}</span>
                      {item.discountPercentage > 0 && (
                        <span className="font-sans text-xs text-stone-400 line-through">{formatPrice(item.price)}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors font-sans text-base leading-none">−</button>
                        <span className="px-4 py-2 font-sans text-sm font-semibold min-w-[2.5rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, Math.min(item.stockQuantity, item.quantity + 1))} className="px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors font-sans text-base leading-none">+</button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-serif text-base text-stone-900">{formatPrice(item.finalPrice * item.quantity)}</span>
                        <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link to="/products" className="inline-flex items-center gap-2 font-sans text-xs text-stone-500 uppercase tracking-widest hover:text-stone-900 transition-colors mt-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-100 p-8 sticky top-28">
              <h2 className="font-serif text-2xl text-stone-900 mb-8">Order Summary</h2>

              <div className="space-y-4 mb-6 border-b border-stone-100 pb-6">
                <div className="flex justify-between font-sans text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between font-sans text-sm text-green-600">
                    <span>Discount</span>
                    <span>−{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-sans text-sm text-stone-500">
                  <span>Shipping</span>
                  <span className="text-stone-400">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-sans text-sm font-semibold text-stone-900 uppercase tracking-wider">Total</span>
                <span className="font-serif text-2xl text-stone-900">{formatPrice(total)}</span>
              </div>

              {discountTotal > 0 && (
                <p className="font-sans text-xs text-green-600 mb-6 text-center">
                  You save {formatPrice(discountTotal)} on this order!
                </p>
              )}

              <motion.button
                onClick={() => navigate('/checkout')}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
              >
                Proceed to Checkout
              </motion.button>

              <p className="font-sans text-xs text-stone-400 text-center mt-4">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
