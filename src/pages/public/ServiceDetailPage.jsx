import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { servicesApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import { formatPrice, getDurationText, getImageUrl } from '../../utils/format'
import CTASection from '../../components/shared/CTASection'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => servicesApi.getBySlug(slug),
  })

  const service = data?.data

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-32">
      <Loader size="lg" />
    </div>
  )

  if (error || !service) return (
    <div className="min-h-screen flex items-center justify-center pt-32">
      <div className="text-center">
        <h2 className="font-serif text-2xl mb-4">Service not found</h2>
        <button onClick={() => navigate('/services')} className="text-amber-700 underline font-sans text-sm">
          View all services
        </button>
      </div>
    </div>
  )

  const stylists = service.stylistServices?.map((ss) => ss.stylist) || []

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <motion.img
          src={getImageUrl(service.image)}
          alt={service.title}
          className="w-full h-full object-cover grayscale-[20%]"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 md:px-12 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="font-sans text-xs text-amber-400 uppercase tracking-widest block mb-4">
                {service.category}
              </span>
              <h1 className="font-serif text-4xl md:text-6xl text-white mb-4">{service.title}</h1>
              <div className="flex items-center gap-8">
                <span className="font-serif text-2xl text-amber-400">{formatPrice(service.price)}</span>
                <span className="text-stone-300 font-sans text-sm uppercase tracking-widest">
                  {getDurationText(service.duration)}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 grid grid-cols-12 gap-12">
        <motion.div
          className="col-span-12 md:col-span-7"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl mb-8">About This Service</h2>
          <p className="font-sans text-stone-600 text-lg leading-relaxed mb-12">{service.description}</p>

          {stylists.length > 0 && (
            <>
              <h3 className="font-serif text-2xl mb-6">Our Artisans for This Service</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {stylists.map((stylist) => (
                  <div key={stylist.id} className="flex items-center gap-4 p-4 border border-stone-200">
                    <img
                      src={getImageUrl(stylist.image)}
                      alt={stylist.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-serif text-base">{stylist.name}</p>
                      <p className="font-sans text-xs text-stone-500 uppercase tracking-wider">{stylist.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Booking Card */}
        <motion.div
          className="col-span-12 md:col-span-5"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
        >
          <div className="sticky top-32 p-8 border border-stone-200 bg-white">
            <h3 className="font-serif text-2xl mb-6">Book This Service</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="font-sans text-sm text-stone-500">Service</span>
                <span className="font-sans text-sm font-medium">{service.title}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="font-sans text-sm text-stone-500">Duration</span>
                <span className="font-sans text-sm">{getDurationText(service.duration)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-sans text-sm text-stone-500">Starting From</span>
                <span className="font-serif text-xl text-amber-700">{formatPrice(service.price)}</span>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/booking', { state: { serviceId: service.id } })}
              className="w-full bg-stone-900 text-stone-50 py-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-amber-700 transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Book Appointment
            </motion.button>
            <p className="mt-4 text-center text-xs font-sans text-stone-400 uppercase tracking-wider">
              Cancellation policy: 24h notice required
            </p>
          </div>
        </motion.div>
      </section>

      <CTASection />
    </>
  )
}
