import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ordersApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import { formatPrice, formatDateShort, getImageUrl } from '../../utils/format'

const PAYMENT_STATUS = ['pending', 'paid', 'failed', 'refunded', 'cancelled']
const ORDER_STATUS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const PAYMENT_COLORS = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-stone-100 text-stone-500',
}
const ORDER_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-stone-100 text-stone-500',
}

function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus }) {
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || 'pending')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'pending')
  if (!order) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order ${order.orderNumber}`} size="xl">
      <div className="space-y-6">
        {/* Customer */}
        <div className="bg-stone-50 p-5">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Customer</h3>
          <p className="font-sans text-sm text-stone-900 font-semibold">{order.customer?.name}</p>
          <p className="font-sans text-sm text-stone-600">{order.customer?.phone}</p>
          {order.customer?.email && <p className="font-sans text-sm text-stone-500">{order.customer.email}</p>}
        </div>

        {/* Shipping */}
        {order.shippingAddress && (
          <div className="bg-stone-50 p-5">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Shipping Address</h3>
            <p className="font-sans text-sm text-stone-700 leading-relaxed">
              {order.shippingAddress.address}
              {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
            </p>
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border border-stone-100 p-3">
                <div className="w-12 h-12 bg-stone-50 overflow-hidden flex-shrink-0">
                  <img src={getImageUrl(item.productImage || item.product?.thumbnail)} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm text-stone-800">{item.productName}</p>
                  <p className="font-sans text-xs text-stone-400">Qty: {item.quantity} × {formatPrice(item.finalPrice)}</p>
                </div>
                <span className="font-sans text-sm font-semibold text-stone-900">{formatPrice(item.finalPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-sans">
              <span>Savings</span><span>−{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-sans text-stone-600">
            <span>Shipping</span><span>{order.shippingAmount > 0 ? formatPrice(order.shippingAmount) : 'Free'}</span>
          </div>
          <div className="flex justify-between font-serif text-base font-semibold border-t border-stone-100 pt-3">
            <span>Total</span><span>{formatPrice(order.finalAmount)}</span>
          </div>
        </div>

        {/* Razorpay reference */}
        {order.razorpayPaymentId && (
          <div className="bg-stone-50 p-4">
            <p className="font-sans text-xs text-stone-400 uppercase tracking-wider mb-1">Razorpay Payment ID</p>
            <p className="font-mono text-xs text-stone-700">{order.razorpayPaymentId}</p>
          </div>
        )}

        {/* Status Update */}
        <div className="border-t border-stone-100 pt-6">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">Update Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Order Status</label>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="admin-input">
                {ORDER_STATUS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="admin-input">
                {PAYMENT_STATUS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => onUpdateStatus(order.id, { orderStatus, paymentStatus })}
            className="mt-4 w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
          >
            Save Status
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminOrders() {
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [filterOrder, setFilterOrder] = useState('')
  const [page, setPage] = useState(1)
  const [viewOrder, setViewOrder] = useState(null)
  const qc = useQueryClient()

  const params = { page, limit: 20, ...(search && { search }), ...(filterPayment && { paymentStatus: filterPayment }), ...(filterOrder && { orderStatus: filterOrder }) }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => ordersApi.adminGetAll(params),
    keepPreviousData: true,
  })

  const { data: detailData } = useQuery({
    queryKey: ['admin-order-detail', viewOrder?.id],
    queryFn: () => ordersApi.adminGetById(viewOrder.id),
    enabled: !!viewOrder,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, data }) => ordersApi.adminUpdateStatus(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); qc.invalidateQueries({ queryKey: ['admin-order-detail'] }); toast.success('Status updated') },
    onError: () => toast.error('Error updating status'),
  })

  const orders = data?.data || []
  const stats = data?.stats || {}
  const meta = data?.meta || {}

  const totalRevenue = stats.paid?.revenue || 0
  const totalOrders = meta.total || 0
  const paidCount = stats.paid?.count || 0
  const pendingCount = stats.pending?.count || 0
  const failedCount = stats.failed?.count || 0

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Orders</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">{totalOrders} total orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: 'payments', color: 'text-green-600' },
          { label: 'Total Orders', value: totalOrders, icon: 'shopping_bag', color: 'text-stone-900' },
          { label: 'Paid Orders', value: paidCount, icon: 'check_circle', color: 'text-green-600' },
          { label: 'Pending', value: pendingCount, icon: 'pending', color: 'text-amber-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined ${color}`}>{icon}</span>
              <span className="font-sans text-xs text-stone-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className={`font-serif text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search order number, customer name or phone..."
          className="admin-input flex-1"
        />
        <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(1) }} className="admin-input !w-auto">
          <option value="">All Payment Status</option>
          {PAYMENT_STATUS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filterOrder} onChange={(e) => { setFilterOrder(e.target.value); setPage(1) }} className="admin-input !w-auto">
          <option value="">All Order Status</option>
          {ORDER_STATUS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? <Loader size="lg" className="py-32" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200">
                {['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="font-sans text-xs uppercase tracking-widest text-stone-400 py-4 pr-6 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {orders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="py-4 pr-6 font-mono text-xs text-stone-700 font-semibold">{order.orderNumber}</td>
                    <td className="py-4 pr-6">
                      <p className="font-sans text-sm text-stone-900">{order.customer?.name}</p>
                      <p className="font-sans text-xs text-stone-400">{order.customer?.phone}</p>
                    </td>
                    <td className="py-4 pr-6 font-sans text-sm text-stone-600">{order.items?.length || 0} items</td>
                    <td className="py-4 pr-6 font-sans text-sm font-semibold text-stone-900">{formatPrice(order.finalAmount)}</td>
                    <td className="py-4 pr-6">
                      <span className={`px-2 py-0.5 rounded-full font-sans text-xs font-semibold ${PAYMENT_COLORS[order.paymentStatus] || 'bg-stone-100 text-stone-500'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <span className={`px-2 py-0.5 rounded-full font-sans text-xs font-semibold ${ORDER_COLORS[order.orderStatus] || 'bg-stone-100 text-stone-500'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-6 font-sans text-xs text-stone-400">{formatDateShort(order.createdAt)}</td>
                    <td className="py-4 pr-6">
                      <button onClick={() => setViewOrder(order)} className="text-stone-400 hover:text-stone-900 transition-colors">
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center font-sans text-stone-400 py-16">No orders found.</p>}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-stone-200 font-sans text-xs uppercase tracking-wider disabled:opacity-40 hover:border-stone-900 transition-all">Prev</button>
          <span className="flex items-center font-sans text-xs text-stone-500">{page} / {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-stone-200 font-sans text-xs uppercase tracking-wider disabled:opacity-40 hover:border-stone-900 transition-all">Next</button>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={detailData?.data || viewOrder}
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        onUpdateStatus={(id, data) => updateStatus.mutate({ id, data })}
      />
    </div>
  )
}
