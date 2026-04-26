import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { settingsApi, bookingsApi } from '../../api/services'
import { formatPrice, formatDateShort, formatTime, getStatusColor } from '../../utils/format'
import Loader from '../../components/shared/Loader'

function StatCard({ title, value, icon, color = 'bg-stone-900', delay = 0 }) {
  return (
    <motion.div
      className="bg-white border border-stone-200 p-6 flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`w-12 h-12 ${color} flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined text-white text-xl">{icon}</span>
      </div>
      <div>
        <p className="font-sans text-xs text-stone-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="font-serif text-2xl text-stone-900">{value}</p>
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: settingsApi.dashboard,
    refetchInterval: 60000,
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings', { limit: 5 }],
    queryFn: () => bookingsApi.getAll({ limit: 5, page: 1 }),
  })

  const stats = data?.data
  const recentBookings = bookingsData?.data || []

  if (isLoading) return <Loader size="lg" className="py-32" />

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900 mb-1">Dashboard</h1>
        <p className="font-sans text-sm text-stone-500">Welcome back. Here's an overview of your studio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon="calendar_month" delay={0} />
        <StatCard title="Pending" value={stats?.pendingBookings || 0} icon="schedule" color="bg-amber-600" delay={0.05} />
        <StatCard title="Services" value={stats?.services || 0} icon="spa" color="bg-stone-700" delay={0.1} />
        <StatCard title="Artisans" value={stats?.stylists || 0} icon="person" color="bg-stone-600" delay={0.15} />
        <StatCard title="Gallery" value={stats?.galleryCount || 0} icon="photo_library" color="bg-stone-500" delay={0.2} />
        <StatCard
          title="Revenue"
          value={formatPrice(stats?.revenue || 0)}
          icon="payments"
          color="bg-amber-700"
          delay={0.25}
        />
      </div>

      {/* Recent Bookings */}
      <motion.div
        className="bg-white border border-stone-200"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="font-serif text-xl text-stone-900">Recent Bookings</h2>
          <a href="/admin/bookings" className="font-sans text-xs text-amber-700 uppercase tracking-widest hover:underline">
            View All
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {['Customer', 'Service', 'Artisan', 'Date & Time', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-sans text-xs text-stone-500 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center font-sans text-sm text-stone-400">
                    No bookings yet
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-stone-900">{b.customerName}</p>
                      <p className="font-sans text-xs text-stone-400">{b.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-sans text-sm text-stone-700">{b.service?.title}</td>
                    <td className="px-6 py-4 font-sans text-sm text-stone-700">{b.stylist?.name}</td>
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm text-stone-700">{formatDateShort(b.appointmentDate)}</p>
                      <p className="font-sans text-xs text-stone-400">{formatTime(b.appointmentTime)}</p>
                    </td>
                    <td className="px-6 py-4 font-sans text-sm font-medium text-stone-900">
                      {formatPrice(b.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full font-sans text-xs font-semibold uppercase tracking-wider ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
