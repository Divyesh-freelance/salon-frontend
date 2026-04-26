import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { settingsApi } from '../../api/services'

export default function TestimonialsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: settingsApi.getTestimonials,
    staleTime: 1000 * 60 * 30,
  })

  const testimonials = data?.data || []
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  // Auto-advance every 6 seconds when multiple testimonials exist
  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const goTo = (next) => {
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  const prev = () => goTo((index - 1 + testimonials.length) % testimonials.length)
  const next = () => goTo((index + 1) % testimonials.length)

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-section-gap overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-6 md:px-12 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-stone-200 mx-auto mb-8" />
          <div className="h-8 bg-stone-100 rounded mx-auto mb-4 w-3/4" />
          <div className="h-8 bg-stone-100 rounded mx-auto mb-12 w-1/2" />
          <div className="h-4 bg-stone-100 rounded mx-auto w-40" />
        </div>
      </section>
    )
  }

  // Nothing in DB yet
  if (testimonials.length === 0) return null

  const current = testimonials[index]

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

        {/* Animated testimonial body */}
        <div className="relative min-h-[12rem] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id || index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <blockquote className="font-serif text-2xl md:text-4xl italic leading-snug mb-10 text-stone-900">
                "{current.quote}"
              </blockquote>
              <cite className="font-sans uppercase tracking-widest text-sm text-stone-900 not-italic font-semibold">
                — {current.author}{current.title ? `, ${current.title}` : ''}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — only shown when multiple testimonials */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="p-2 border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-all"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'bg-stone-900 scale-125' : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="p-2 border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-all"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        )}
      </motion.div>
    </section>
  )
}
