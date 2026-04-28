import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ordersApi } from '../../api/services'
import { formatPrice, formatDateShort, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'

const STATUS_STYLE = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-stone-100 text-stone-500',
}

export default function OrderConfirmationPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-48"><Loader size="lg" /></div>

  const order = data?.data
  if (!order) return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-48 text-center">
      <p className="font-serif text-2xl text-stone-500 mb-6">Order not found</p>
      <Link to="/" className="font-sans text-xs uppercase tracking-widest text-amber-700 hover:underline">← Go Home</Link>
    </div>
  )

  const isPaid = order.paymentStatus === 'paid'
  const isFailed = order.paymentStatus === 'failed'

  return (
    <section className="max-w-3xl mx-auto px-6 md:px-12 pt-40 pb-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

        {/* Status Header */}
        <div className="text-center mb-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? 'bg-green-100' : isFailed ? 'bg-red-100' : 'bg-amber-100'}`}>
            <span className={`material-symbols-outlined text-3xl ${isPaid ? 'text-green-600' : isFailed ? 'text-red-500' : 'text-amber-600'}`}>
              {isPaid ? 'check_circle' : isFailed ? 'cancel' : 'pending'}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-stone-900 mb-3">
            {isPaid ? 'Order Confirmed!' : isFailed ? 'Payment Failed' : 'Order Placed'}
          </h1>
          <p className="font-sans text-stone-500">
            {isPaid
              ? `Thank you, ${order.customer?.name}! Your order has been placed and payment received.`
              : isFailed
              ? 'Your payment could not be processed. Please try again.'
              : `Your order has been placed. We're waiting for payment confirmation.`}
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white border border-stone-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-100">
            <div>
              <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-1">Order Number</p>
              <p className="font-mono text-lg text-stone-900 font-semibold">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-1">Date</p>
              <p className="font-sans text-sm text-stone-700">{formatDateShort(order.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <span className={`px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider rounded-full ${STATUS_STYLE[order.paymentStatus] || 'bg-stone-100 text-stone-500'}`}>
              Payment: {order.paymentStatus}
            </span>
            <span className="px-3 py-1 bg-stone-100 text-stone-600 font-sans text-xs font-semibold uppercase tracking-wider rounded-full">
              {order.orderStatus}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-4 mb-8">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-14 h-14 flex-shrink-0 bg-stone-50 overflow-hidden">
                  <img src={getImageUrl(item.productImage)} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-stone-800">{item.productName}</p>
                  <p className="font-sans text-xs text-stone-400">Qty: {item.quantity} × {formatPrice(item.finalPrice)}</p>
                </div>
                <span className="font-sans text-sm font-semibold text-stone-900">{formatPrice(item.finalPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-stone-100 pt-5 space-y-3">
            {order.discountAmount > 0 && (
              <div className="flex justify-between font-sans text-sm text-green-600">
                <span>Savings</span><span>−{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-sans text-sm text-stone-600">
              <span>Shipping</span><span>{order.shippingAmount > 0 ? formatPrice(order.shippingAmount) : 'Free'}</span>
            </div>
            <div className="flex justify-between items-center font-serif text-lg pt-3 border-t border-stone-100">
              <span>Total Paid</span><span>{formatPrice(order.finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white border border-stone-100 p-6 mb-8">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Delivery Address</h3>
            <p className="font-sans text-sm text-stone-700 leading-relaxed">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.address}
              {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isFailed && (
            <Link
              to="/checkout"
              className="flex-1 text-center bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
            >
              Retry Payment
            </Link>
          )}
          <Link
            to="/products"
            className={`flex-1 text-center py-4 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
              isFailed ? 'border border-stone-200 text-stone-600 hover:border-stone-900' : 'bg-stone-900 text-white hover:bg-amber-700'
            }`}
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="flex-1 text-center py-4 border border-stone-200 font-sans text-xs font-semibold uppercase tracking-widest text-stone-600 hover:border-stone-900 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
