import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { bookingsApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import { formatPrice, formatDateShort, formatTime, getStatusColor } from '../../utils/format'

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function AdminBookings() {
  const [filters, setFilters] = useState({ status: '', page: 1, search: '', limit: 20 })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: () => bookingsApi.getAll(filters),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Status updated') },
    onError: () => toast.error('Error updating status'),
  })

  const bookings = data?.data || []
  const meta = data?.meta || {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Bookings</h1>
        <p className="font-sans text-sm text-stone-500 mt-1">{meta.total || 0} total appointments</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="border border-stone-200 px-4 py-2 font-sans text-sm flex-1 min-w-48 focus:border-stone-900 outline-none transition-colors"
        />
        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
          className="border border-stone-200 px-4 py-2 font-sans text-sm focus:border-stone-900 outline-none transition-colors"
        />
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilters({ ...filters, status: s === 'all' ? '' : s, page: 1 })}
              className={`px-4 py-2 font-sans text-xs uppercase tracking-wider transition-all ${
                (s === 'all' && !filters.status) || filters.status === s
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-200 text-stone-500 hover:border-stone-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Customer', 'Service', 'Artisan', 'Date & Time', 'Amount / Discount', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-sans text-xs text-stone-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-16"><Loader className="mx-auto" /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center font-sans text-sm text-stone-400">No bookings found</td></tr>
              ) : (
                bookings.map((b) => (
                  <motion.tr
                    key={b.id}
                    className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-stone-900">{b.customerName}</p>
                      <p className="font-sans text-xs text-stone-400">{b.customerEmail}</p>
                      <p className="font-sans text-xs text-stone-400">{b.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-stone-700">{b.service?.title}</td>
                    <td className="px-6 py-4 font-sans text-sm text-stone-700">{b.stylist?.name}</td>
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm">{formatDateShort(b.appointmentDate)}</p>
                      <p className="font-sans text-xs text-stone-400">{formatTime(b.appointmentTime)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {b.discount ? (
                        <div>
                          <p className="font-sans text-sm font-semibold text-stone-900">{formatPrice(b.finalAmount)}</p>
                          <p className="font-sans text-xs text-stone-400 line-through">{formatPrice(b.totalAmount)}</p>
                          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 font-sans text-[10px] uppercase tracking-wider px-1.5 py-0.5 mt-0.5">
                            -{Math.round(b.discount.discountPercentage)}% · {b.discount.title}
                          </span>
                        </div>
                      ) : (
                        <p className="font-sans text-sm font-semibold">{formatPrice(b.totalAmount)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full font-sans text-xs font-semibold uppercase ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: b.id, status: e.target.value })}
                        className="border border-stone-200 px-3 py-1.5 font-sans text-xs focus:border-stone-900 outline-none"
                      >
                        {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-stone-100 flex justify-between items-center">
            <p className="font-sans text-sm text-stone-500">
              Page {meta.page} of {meta.totalPages} · {meta.total} results
            </p>
            <div className="flex gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="border border-stone-200 px-4 py-2 font-sans text-xs hover:border-stone-900 transition-all disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="border border-stone-200 px-4 py-2 font-sans text-xs hover:border-stone-900 transition-all disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
