/**
 * Checkout Page — Razorpay Integration
 *
 * To enable live payments:
 *   1. Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to Railway backend env vars
 *   2. Run: npm install razorpay  (in backend folder)
 *   3. Add VITE_RAZORPAY_KEY_ID to Railway frontend env vars
 *   4. The Razorpay checkout script is loaded dynamically below
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { ordersApi } from '../../api/services'
import { formatPrice, getImageUrl } from '../../utils/format'

const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry']

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, discountTotal, subtotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'payment'

  const { register, handleSubmit, formState: { errors } } = useForm()

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-48 text-center">
        <p className="font-serif text-2xl text-stone-500 mb-6">Your cart is empty</p>
        <Link to="/products" className="font-sans text-xs uppercase tracking-widest text-amber-700 hover:underline">← Back to Products</Link>
      </div>
    )
  }

  const onSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const orderPayload = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark || null,
        },
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        notes: formData.notes || null,
        shippingAmount: 0,
      }

      const { data: orderData } = await ordersApi.create(orderPayload)
      const order = orderData.order

      // ── Razorpay checkout ──────────────────────────────────────────────────
      if (orderData.razorpayOrder && (RAZORPAY_KEY || orderData.razorpayKeyId)) {
        const loaded = await loadRazorpay()
        if (!loaded) {
          toast.error('Payment gateway could not be loaded. Please try again.')
          setIsSubmitting(false)
          return
        }

        const options = {
          key: RAZORPAY_KEY || orderData.razorpayKeyId,
          amount: orderData.razorpayOrder.amount,
          currency: 'INR',
          name: 'RajLaxmi Makeup Studio',
          description: `Order #${order.orderNumber}`,
          order_id: orderData.razorpayOrder.id,
          handler: async (response) => {
            try {
              await ordersApi.verifyPayment(order.id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              clearCart()
              navigate(`/order-confirmation/${order.id}`)
            } catch {
              toast.error('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: formData.name,
            contact: formData.phone,
            email: formData.email || '',
          },
          theme: { color: '#1c1917' },
          modal: {
            ondismiss: async () => {
              await ordersApi.paymentFailed(order.id, { reason: 'dismissed' })
              toast.error('Payment cancelled. Your order is saved — you can retry from Order Confirmation.')
              navigate(`/order-confirmation/${order.id}`)
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', async (resp) => {
          await ordersApi.paymentFailed(order.id, resp.error)
          toast.error('Payment failed: ' + (resp.error?.description || 'Unknown error'))
        })
        rzp.open()

      } else {
        // No Razorpay keys configured — scaffold mode: go directly to confirmation
        toast.success('Order placed! (Payment gateway not configured yet.)')
        clearCart()
        navigate(`/order-confirmation/${order.id}`)
      }

    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact */}
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 mb-6 pb-3 border-b border-stone-100">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="admin-label">Full Name *</label>
                    <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })} className="admin-input" placeholder="Your full name" />
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="admin-label">Phone Number *</label>
                    <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile number' } })} className="admin-input" placeholder="10-digit mobile number" maxLength={10} />
                    {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="admin-label">Email Address</label>
                    <input {...register('email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter valid email' } })} type="email" className="admin-input" placeholder="Optional" />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 mb-6 pb-3 border-b border-stone-100">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="admin-label">Street Address *</label>
                    <input {...register('address', { required: 'Address is required', minLength: { value: 5, message: 'Please enter full address' } })} className="admin-input" placeholder="House no., street, area" />
                    {errors.address && <p className="form-error">{errors.address.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="admin-label">Landmark</label>
                    <input {...register('landmark')} className="admin-input" placeholder="Optional — near temple, school etc." />
                  </div>
                  <div>
                    <label className="admin-label">City *</label>
                    <input {...register('city', { required: 'City is required' })} className="admin-input" placeholder="City" />
                    {errors.city && <p className="form-error">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="admin-label">State *</label>
                    <select {...register('state', { required: 'State is required' })} className="admin-input">
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="form-error">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="admin-label">Pincode *</label>
                    <input {...register('pincode', { required: 'Pincode is required', pattern: { value: /^\d{6}$/, message: 'Enter valid 6-digit pincode' } })} className="admin-input" placeholder="6-digit pincode" maxLength={6} />
                    {errors.pincode && <p className="form-error">{errors.pincode.message}</p>}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="admin-label">Order Notes</label>
                <textarea {...register('notes')} rows={3} className="admin-input resize-none" placeholder="Any special instructions? (Optional)" />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-stone-900 text-white py-5 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order...' : `Place Order & Pay ${formatPrice(total)}`}
              </motion.button>

              <p className="font-sans text-xs text-stone-400 text-center">
                Secure payment powered by Razorpay. Your data is encrypted and safe.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-100 p-8 sticky top-28">
              <h2 className="font-serif text-xl text-stone-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 flex-shrink-0 overflow-hidden bg-stone-50">
                      <img src={getImageUrl(item.thumbnail)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-stone-800 line-clamp-1">{item.name}</p>
                      <p className="font-sans text-xs text-stone-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-sans text-sm font-semibold text-stone-900 flex-shrink-0">{formatPrice(item.finalPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-5 space-y-3">
                <div className="flex justify-between font-sans text-sm text-stone-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between font-sans text-sm text-green-600">
                    <span>Savings</span><span>−{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-sans text-sm text-stone-500">
                  <span>Shipping</span><span>Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <span className="font-sans text-sm font-semibold uppercase tracking-wider">Total</span>
                  <span className="font-serif text-2xl">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
