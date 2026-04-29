import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { formatPrice, formatDate, formatTime } from '../../utils/format'
import { discountsApi } from '../../api/services'

export default function AppointmentSummary({ booking, onConfirm, isSubmitting }) {
  const {
    service, stylist, date, timeSlot,
    totalAmount, discountAmount, finalAmount,
    discount, setDiscount,
  } = booking

  const [showPicker, setShowPicker] = useState(false)

  const { data: discountsData } = useQuery({
    queryKey: ['active-discounts-booking'],
    queryFn: () => discountsApi.getAll({ active: 'true', limit: 30 }),
    enabled: !!service,
    staleTime: 1000 * 60 * 5,
  })

  const activeDiscounts = discountsData?.data || []

  const rows = [
    { label: 'Service', value: service?.title },
    { label: 'Artisan', value: stylist?.name },
    {
      label: 'Schedule',
      value: date && timeSlot
        ? `${formatDate(date)} · ${formatTime(timeSlot.time)}`
        : null,
    },
  ]

  const handleSelectDiscount = (d) => {
    setDiscount(discount?.id === d.id ? null : d)
    setShowPicker(false)
  }

  return (
    <div className="sticky top-32 p-8 border border-stone-200 bg-white">
      <h2 className="font-serif text-2xl mb-8">Appointment Summary</h2>

      {/* ── Booking Details ───────────────────────────────────────────── */}
      <div className="space-y-6 mb-10">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="font-sans text-[10px] uppercase text-stone-400 tracking-widest font-semibold">
              {label}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={value || 'empty'}
                className={`font-sans font-medium ${value ? 'text-stone-900' : 'text-stone-300 italic'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {value || '—'}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ── Discount Picker ───────────────────────────────────────────── */}
      {service && (
        <div className="mb-8 border-t border-stone-100 pt-6">
          <button
            onClick={() => setShowPicker((p) => !p)}
            className="w-full flex items-center justify-between group"
          >
            <span className={`font-sans text-xs uppercase tracking-widest font-semibold transition-colors ${
              discount ? 'text-amber-700' : 'text-stone-500 group-hover:text-stone-900'
            }`}>
              {discount ? `${discount.discountPercentage}% offer applied` : 'Apply an offer'}
            </span>
            <span className="material-symbols-outlined text-stone-400 text-lg group-hover:text-stone-700 transition-colors">
              {showPicker ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                key="picker"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {activeDiscounts.length === 0 ? (
                  <p className="font-sans text-xs text-stone-400 pt-4 pb-1">
                    No active offers at the moment.
                  </p>
                ) : (
                  <div className="space-y-2 pt-3 max-h-52 overflow-y-auto pr-1">
                    {activeDiscounts.map((d) => {
                      const isSelected = discount?.id === d.id
                      return (
                        <button
                          key={d.id}
                          onClick={() => handleSelectDiscount(d)}
                          className={`w-full text-left px-3 py-2.5 border transition-all duration-200 ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50'
                              : 'border-stone-200 hover:border-stone-500 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-sans text-sm font-medium text-stone-900 line-clamp-1">
                              {d.title}
                            </span>
                            <span className="font-sans text-xs font-bold text-amber-700 flex-shrink-0">
                              {d.discountPercentage}% OFF
                            </span>
                          </div>
                          {d.description && (
                            <p className="font-sans text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                              {d.description}
                            </p>
                          )}
                          {isSelected && (
                            <div className="flex items-center gap-1 mt-1.5 text-amber-700">
                              <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>
                                check_circle
                              </span>
                              <span className="font-sans text-[10px] uppercase tracking-wider font-semibold">
                                Applied
                              </span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Applied discount pill */}
          {discount && !showPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-3"
            >
              <span className="font-sans text-xs text-amber-700">
                "{discount.title}"
              </span>
              <button
                onClick={() => setDiscount(null)}
                className="font-sans text-[10px] text-stone-400 hover:text-red-500 uppercase tracking-wider transition-colors"
              >
                Remove
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Price Breakdown ───────────────────────────────────────────── */}
      <div className="pt-6 border-t border-stone-100 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-sans text-stone-500 text-sm">Subtotal</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={totalAmount}
              className="font-sans text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {service ? formatPrice(totalAmount) : '—'}
            </motion.span>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {discount && (
            <motion.div
              key="discount-row"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-amber-700 text-sm">
                  Discount ({discount.discountPercentage}%)
                </span>
                <span className="font-sans text-sm text-amber-700">
                  −{formatPrice(discountAmount)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <span className="font-sans text-stone-500 text-sm">Processing Fee</span>
          <span className="font-sans text-sm">₹0.00</span>
        </div>

        <div className="flex justify-between items-center mt-6">
          <span className="font-serif text-xl">Total</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={finalAmount}
              className="font-serif text-xl"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {service ? formatPrice(finalAmount) : '—'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {onConfirm && (
        <motion.button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full font-sans text-xs font-semibold bg-stone-900 text-stone-50 py-5 tracking-[0.2em] hover:bg-amber-700 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
        </motion.button>
      )}

      <p className="mt-4 text-center text-[10px] font-sans text-stone-400 uppercase tracking-wider">
        Cancellation policy: 24h notice required
      </p>
    </div>
  )
}
