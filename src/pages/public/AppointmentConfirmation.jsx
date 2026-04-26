import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { bookingsApi } from '../../api/services'
import { formatPrice, formatDate, formatTime, getDurationText } from '../../utils/format'
import Loader from '../../components/shared/Loader'

export default function AppointmentConfirmation() {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-confirmation', id],
    queryFn: () => bookingsApi.getConfirmation(id),
    retry: false,
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-32">
      <Loader size="lg" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center pt-32 text-center">
      <div>
        <h2 className="font-serif text-2xl mb-4">Booking not found</h2>
        <Link to="/" className="text-amber-700 underline font-sans text-sm">Return home</Link>
      </div>
    </div>
  )

  const booking = data?.data

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 pt-48 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16"
      >
        <motion.div
          className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <span className="material-symbols-outlined text-white text-3xl">check</span>
        </motion.div>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Appointment Confirmed</h1>
        <p className="font-sans text-stone-500 text-lg">
          We look forward to seeing you, {booking.customerName.split(' ')[0]}.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="border border-stone-200 p-8 md:p-12 bg-white mb-8"
      >
        <h2 className="font-serif text-2xl mb-8 pb-4 border-b border-stone-100">Appointment Details</h2>
        <div className="space-y-6">
          {[
            { label: 'Booking Reference', value: `#${booking.id.slice(-8).toUpperCase()}` },
            { label: 'Service', value: booking.service.title },
            { label: 'Duration', value: getDurationText(booking.service.duration) },
            { label: 'Artisan', value: `${booking.stylist.name} · ${booking.stylist.title}` },
            { label: 'Date', value: formatDate(booking.appointmentDate) },
            { label: 'Time', value: formatTime(booking.appointmentTime) },
            { label: 'Total', value: formatPrice(booking.totalAmount) },
            { label: 'Status', value: booking.status.charAt(0).toUpperCase() + booking.status.slice(1) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start py-3 border-b border-stone-50">
              <span className="font-sans text-sm text-stone-500 uppercase tracking-wider">{label}</span>
              <span className="font-sans text-sm font-semibold text-stone-900 text-right">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center"
      >
        <p className="font-sans text-sm text-stone-500 mb-8">
          A confirmation has been sent to <strong>{booking.customerEmail}</strong>
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/"
            className="font-sans text-xs uppercase tracking-widest font-semibold text-stone-500 hover:text-stone-900 border-b border-stone-300 hover:border-stone-900 pb-1 transition-all"
          >
            Return Home
          </Link>
          <Link
            to="/booking"
            className="bg-stone-900 text-stone-50 px-8 py-3 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-amber-700 transition-all"
          >
            Book Another
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
