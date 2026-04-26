import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CTASection({
  title = 'Begin Your Ritual',
  subtitle = 'Reservations are highly recommended. Experience the RajLaxmi standard of excellence.',
  buttonText = 'Schedule An Appointment',
  bgImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCs0Uqx8usElsMKSFyf0wERrSNKeeXI-zTRgDnELmHuncF7cqm8gT04aKW6TzcTwBqjbIuxr8RxYiqcsHUeXu5z54bXZ5WO4NDBWDeIjsHT1EonkpX5Cz0j0JjyVdpBkoKZfmzcbQwvE5ia0wAISfjTFW-D5Xhx4qF0iHdFURVmXIYVI9Z9Bao6XiGenkegPGf9U9PGsB6wDZib2bekvL6PXU6Jfobjnz_G_2TYpQpKcr7WiknAUIibfgvXQOjjyEJsTsBhvuLx-R-hy',
}) {
  const navigate = useNavigate()

  return (
    <section className="py-section-gap px-6 md:px-12">
      <div className="max-w-7xl mx-auto bg-stone-900 p-12 md:p-20 text-center relative overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 opacity-20">
            <img src={bgImage} alt="" className="w-full h-full object-cover blur-sm" />
          </div>
        )}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-4xl md:text-6xl text-stone-50 mb-8">{title}</h2>
          <p className="text-stone-300 font-sans text-lg max-w-xl mx-auto mb-12">{subtitle}</p>
          <motion.button
            onClick={() => navigate('/booking')}
            className="bg-amber-600 text-stone-50 px-12 py-6 font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-stone-50 hover:text-stone-900 transition-all duration-300"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {buttonText}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
