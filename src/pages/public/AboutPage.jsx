import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { stylistsApi, settingsApi } from '../../api/services'
import StylistCard from '../../components/shared/StylistCard'
import CTASection from '../../components/shared/CTASection'
import TestimonialsSection from '../../components/shared/TestimonialsSection'
import Loader from '../../components/shared/Loader'

export default function AboutPage() {
  const { data: stylistsData, isLoading } = useQuery({
    queryKey: ['stylists', { active: 'true' }],
    queryFn: () => stylistsApi.getAll({ active: 'true' }),
  })

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-section-gap">
        <div className="grid grid-cols-12 gap-12 items-center">
          <motion.div
            className="col-span-12 md:col-span-6"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
              Our Story
            </span>
            <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-8 italic">
              The Art of<br />Beautiful Living
            </h1>
            <p className="font-sans text-lg text-stone-600 leading-relaxed mb-8">
              RajLaxmi Makeup Studio was founded on the belief that beauty is a daily ritual of self-care, not a luxury reserved for special occasions. We have built a sanctuary where modern techniques meet timeless artistry.
            </p>
            <p className="font-sans text-stone-500 leading-relaxed">
              Every detail of our studio — from the curated music to the botanical-infused treatments — is designed to elevate your experience beyond the ordinary.
            </p>
          </motion.div>
          <motion.div
            className="col-span-12 md:col-span-6"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJHdCX5hz9o5GMbNDSPGi3gJxLzHtpvLxkpDRPIq1uIRET1jCyafn2j2isYOLbF4y4z_CaAKYk5smPSO3aboOiI_MHa357MLUSI9k_KIszJPW--qBxGIcScEEFd6KrbjpPBNc_Wxve1Vob2S_92Kb9OoKoJUcCC11jmeySuif65XK_u9vij8wd_jLcVQRm6p_yNL6PTs07iRd6jKfVJF_OAyz4OxP-mgs8yAoQ9CeC_eqr-WkCfRpYE0PaOQBc8pXSxFbGcpzLuYUM"
                alt="Our philosophy"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-stone-900 py-section-gap">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            className="font-serif text-4xl md:text-5xl text-stone-50 mb-20 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Core Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: '01', title: 'Artisanal Craft', desc: 'Every technique is mastered through years of dedicated practice. We believe in the beauty of the handmade and the human touch.' },
              { num: '02', title: 'Mindful Ingredients', desc: 'We use only clean, ethically sourced products that honor both your skin and the planet. No compromises on ingredient integrity.' },
              { num: '03', title: 'Individual Excellence', desc: 'There is no one-size-fits-all approach here. Every client receives a personalized consultation and a treatment crafted for their unique needs.' },
            ].map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                className="border-t border-stone-700 pt-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                <span className="font-serif text-4xl text-amber-600 block mb-4">{num}</span>
                <h3 className="font-serif text-xl text-stone-50 mb-4">{title}</h3>
                <p className="font-sans text-stone-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-section-gap max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-widest block mb-4">
            The Artisans
          </span>
          <h2 className="font-serif text-4xl md:text-5xl">Meet Our Team</h2>
        </motion.div>

        {isLoading ? (
          <Loader size="lg" className="py-16" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {(stylistsData?.data || []).map((stylist, i) => (
              <StylistCard key={stylist.id} stylist={stylist} index={i} />
            ))}
          </div>
        )}
      </section>

      <TestimonialsSection />
      <CTASection />
    </>
  )
}
