import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { discountsApi } from '../../api/services'
import { getImageUrl, formatDateShort } from '../../utils/format'
import Loader from '../../components/shared/Loader'
import EmptyState from '../../components/shared/EmptyState'

const CATEGORIES = ['All', 'Hair', 'Facial', 'Makeup', 'Bridal', 'Spa', 'Nails', 'Skin Care']

function isExpiringSoon(expiryDate) {
  if (!expiryDate) return false
  const diff = new Date(expiryDate) - new Date()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

function DiscountCard({ discount, index }) {
  const navigate = useNavigate()
  const expiring = isExpiringSoon(discount.expiryDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-stone-100 overflow-hidden group hover:shadow-md transition-shadow duration-300 relative"
    >
      {/* Banner Image */}
      <div className="aspect-[16/7] overflow-hidden bg-stone-100 relative">
        {discount.image ? (
          <img
            src={getImageUrl(discount.image)}
            alt={discount.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center">
            <span className="font-serif text-5xl font-bold text-amber-400">{Math.round(discount.discountPercentage)}%</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {discount.trending && (
            <span className="bg-amber-600 text-white px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              Trending
            </span>
          )}
          {expiring && (
            <span className="bg-red-600 text-white px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider">
              Expiring Soon
            </span>
          )}
        </div>

        {/* Discount % overlay */}
        <div className="absolute bottom-3 right-3 bg-white text-stone-900 px-3 py-1.5 font-serif text-2xl font-bold leading-none">
          -{Math.round(discount.discountPercentage)}%
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-xl text-stone-900 leading-snug">{discount.title}</h3>
          <span className="flex-shrink-0 px-2 py-0.5 bg-stone-100 text-stone-500 font-sans text-xs uppercase tracking-wider">
            {discount.category}
          </span>
        </div>

        {discount.description && (
          <p className="font-sans text-sm text-stone-500 line-clamp-2 mb-4">{discount.description}</p>
        )}

        {discount.expiryDate && (
          <p className="font-sans text-xs text-stone-400 mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">event</span>
            Valid until {formatDateShort(discount.expiryDate)}
          </p>
        )}

        <motion.button
          onClick={() => navigate(discount.ctaLink || '/booking')}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
        >
          {discount.ctaText || 'Book Now'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function DiscountsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [trendingOnly, setTrendingOnly] = useState(false)
  const [expiringSoonFilter, setExpiringSoonFilter] = useState(false)

  const params = {
    active: 'true',
    limit: 50,
    ...(activeCategory !== 'All' && { category: activeCategory }),
    ...(trendingOnly && { trending: 'true' }),
    ...(expiringSoonFilter && { expiringSoon: 'true' }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['discounts', params],
    queryFn: () => discountsApi.getAll(params),
  })

  const discounts = data?.data || []

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            Special Offers
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">
            Trending <br />discounts.
          </h1>
          <p className="font-sans text-lg text-stone-600 leading-relaxed">
            Exclusive offers and seasonal deals on our most popular salon services. Limited time only.
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat ? 'bg-stone-900 text-stone-50' : 'border border-stone-200 text-stone-600 hover:border-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={trendingOnly} onChange={(e) => setTrendingOnly(e.target.checked)} className="w-4 h-4 accent-amber-700" />
              <span className="font-sans text-xs text-stone-600 uppercase tracking-wider">Trending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={expiringSoonFilter} onChange={(e) => setExpiringSoonFilter(e.target.checked)} className="w-4 h-4 accent-amber-700" />
              <span className="font-sans text-xs text-stone-600 uppercase tracking-wider">Expiring Soon</span>
            </label>
          </div>
        </div>
      </section>

      {/* Discounts Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
        {isLoading ? (
          <div className="flex justify-center py-32"><Loader size="lg" /></div>
        ) : discounts.length === 0 ? (
          <EmptyState title="No active offers" message="Check back soon — new offers are added regularly." />
        ) : (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discounts.map((d, i) => <DiscountCard key={d.id} discount={d} index={i} />)}
            </div>
          </AnimatePresence>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
        <div className="py-20 border-y border-stone-200 text-center">
          <h2 className="font-serif text-4xl mb-6">Don't miss out on savings.</h2>
          <p className="font-sans text-stone-500 max-w-md mx-auto mb-10">
            Book an appointment now and mention the offer to redeem your discount.
          </p>
          <Link
            to="/booking"
            className="inline-block bg-stone-900 text-white px-12 py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
          >
            Book an Appointment
          </Link>
        </div>
      </section>
    </>
  )
}
