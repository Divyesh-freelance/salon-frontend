import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import EmptyState from '../../components/shared/EmptyState'
import { getImageUrl } from '../../utils/format'
import CTASection from '../../components/shared/CTASection'

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: galleryApi.getAll,
  })

  const allImages = galleryData?.data || []
  const categories = ['All', ...new Set(allImages.map((img) => img.category))]
  const filtered = activeCategory === 'All' ? allImages : allImages.filter((img) => img.category === activeCategory)

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            Our Gallery
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-8">Visual Stories</h1>
          <p className="font-sans text-lg text-stone-600 max-w-xl">
            Each image tells the story of a transformation. Browse our portfolio of signature looks.
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="flex flex-wrap gap-4 border-b border-stone-200 pb-8">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest transition-all ${
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

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
        {isLoading ? (
          <Loader size="lg" className="py-32" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No images yet" message="Check back soon for our gallery." />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filtered.map((img, i) => (
                <motion.div
                  key={img.id}
                  className="group relative overflow-hidden aspect-square cursor-pointer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setLightbox(img)}
                >
                  <motion.img
                    src={getImageUrl(img.image)}
                    alt={img.alt || img.category}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-end">
                    <div className="p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="font-sans text-white text-xs uppercase tracking-widest">{img.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={getImageUrl(lightbox.image)}
              alt={lightbox.alt}
              className="max-w-4xl max-h-[90vh] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
            <button
              className="absolute top-6 right-6 text-white opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setLightbox(null)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CTASection />
    </>
  )
}
