import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice, formatDate, formatTime } from '../../utils/format'

export default function AppointmentSummary({ booking, onConfirm, isSubmitting }) {
  const { service, stylist, date, timeSlot, totalAmount } = booking

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

  return (
    <div className="sticky top-32 p-8 border border-stone-200 bg-white">
      <h2 className="font-serif text-2xl mb-8">Appointment Summary</h2>

      <div className="space-y-6 mb-12">
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
        <div className="flex justify-between items-center">
          <span className="font-sans text-stone-500 text-sm">Processing Fee</span>
          <span className="font-sans text-sm">₹0.00</span>
        </div>
        <div className="flex justify-between items-center mt-6">
          <span className="font-serif text-xl">Total</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={totalAmount}
              className="font-serif text-xl"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {service ? formatPrice(totalAmount) : '—'}
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
