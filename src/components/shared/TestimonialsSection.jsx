import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { settingsApi } from '../../api/services'

export default function TestimonialsSection() {
  const { data } = useQuery({
    queryKey: ['testimonials'],
    queryFn: settingsApi.getTestimonials,
    staleTime: 1000 * 60 * 30,
  })

  const testimonials = data?.data || []
  const featured = testimonials[0] || {
    quote: 'RajLaxmi Makeup Studio is not just a salon; it is a recalibration of the spirit. I leave feeling not just beautiful, but deeply restored.',
    author: 'Ananya Sharma',
    title: 'Fashion Editor',
  }

  return (
    <section className="py-section-gap overflow-hidden">
      <motion.div
        className="max-w-4xl mx-auto text-center px-6 md:px-12"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className="material-symbols-outlined text-4xl text-amber-600 mb-8 block"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          format_quote
        </span>
        <blockquote className="font-serif text-3xl md:text-5xl italic leading-tight mb-12 text-stone-900">
          "{featured.quote}"
        </blockquote>
        <cite className="font-sans uppercase tracking-widest text-sm text-stone-900 not-italic font-semibold">
          — {featured.author}, {featured.title}
        </cite>
      </motion.div>
    </section>
  )
}
