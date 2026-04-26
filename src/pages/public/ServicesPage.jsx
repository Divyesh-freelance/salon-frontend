import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { servicesApi } from '../../api/services'
import ServiceCard from '../../components/shared/ServiceCard'
import CTASection from '../../components/shared/CTASection'
import Loader from '../../components/shared/Loader'
import EmptyState from '../../components/shared/EmptyState'
import { formatPrice, getDurationText, getImageUrl } from '../../utils/format'
import { useNavigate } from 'react-router-dom'

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const navigate = useNavigate()

  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: servicesApi.getCategories,
  })

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services', { active: 'true', limit: 50 }],
    queryFn: () => servicesApi.getAll({ active: 'true', limit: 50 }),
  })

  const categories = ['All', ...(categoriesData?.data?.map((c) => c.name) || [])]
  const allServices = servicesData?.data || []

  const filtered = activeCategory === 'All'
    ? allServices
    : allServices.filter((s) => s.category === activeCategory)

  // Group by category for styled display
  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <>
      {/* Page Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-section-gap">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            The Service Catalog
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
            Curated beauty, <br />meticulously crafted.
          </h1>
          <p className="font-sans text-lg text-stone-600 max-w-xl leading-relaxed">
            From signature hair artistry to regenerative skin synthesis, our treatments are designed to elevate your natural essence through modern technique and timeless care.
          </p>
        </motion.div>
      </section>

      {/* Filter Bar */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="flex flex-wrap gap-4 border-b border-stone-200 pb-8">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-stone-900 text-stone-50'
                  : 'border border-stone-200 text-stone-600 hover:border-stone-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Services Content */}
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No services found" message="Try a different category" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeCategory === 'All' ? (
              /* ─ Grouped layout matching HTML design ─ */
              Object.entries(grouped).map(([category, services], catIdx) => (
                <section
                  key={category}
                  className={`max-w-7xl mx-auto px-6 md:px-12 mb-section-gap ${
                    catIdx % 2 === 1 ? 'bg-transparent' : ''
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-12">
                    <h2 className="font-serif text-4xl">{category}</h2>
                    <span className="font-sans text-xs text-stone-500 uppercase tracking-widest">
                      Section 0{catIdx + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {services.map((service, i) => (
                      <ServiceCard key={service.id} service={service} index={i} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              /* ─ Single category grid ─ */
              <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {filtered.map((service, i) => (
                    <ServiceCard key={service.id} service={service} index={i} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap text-center">
        <div className="py-24 border-y border-stone-200">
          <h2 className="font-serif text-4xl mb-8">Ready to define your look?</h2>
          <p className="font-sans text-stone-600 mb-12 max-w-xl mx-auto">
            Appointments are limited to ensure the highest quality of care and attention for every guest.
          </p>
          <motion.button
            onClick={() => navigate('/booking')}
            className="bg-stone-900 text-stone-50 px-16 py-5 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Your Appointment
          </motion.button>
        </div>
      </section>
    </>
  )
}
