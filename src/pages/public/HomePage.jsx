import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { servicesApi, stylistsApi, settingsApi } from '../../api/services'
import ServiceCard from '../../components/shared/ServiceCard'
import StylistCard from '../../components/shared/StylistCard'
import CTASection from '../../components/shared/CTASection'
import Loader from '../../components/shared/Loader'
import TestimonialsSection from '../../components/shared/TestimonialsSection'
import SocialVideosSection from '../../components/shared/SocialVideosSection'

export default function HomePage() {
  const navigate = useNavigate()

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', { active: 'true', limit: 3 }],
    queryFn: () => servicesApi.getAll({ active: 'true', limit: 3 }),
  })

  const { data: stylistsData, isLoading: stylistsLoading } = useQuery({
    queryKey: ['stylists', { active: 'true', limit: 3 }],
    queryFn: () => stylistsApi.getAll({ active: 'true', limit: 3 }),
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 1000 * 60 * 30,
  })

  const settings = settingsData?.data || {}

  const FALLBACK_HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn7bRvmYs4b-7tbqlIAWnOPkz1rc_Cb_VRFouj9c6AztAtJEkExHtk7aBSoiqEdS9qftFo6Sp0B7xwsYN9rs1XEL7ariziRL7ESE9knduD3Xmc6477nZkZQdhUbhHIPLBMRzs5V-tSCXfo_PDoiV6e9O5xf-HM7w4sERxtw6w8F83b8yS50z_3_Af7dI-PoSKWKkmpmY6f5bMsOEkNfHGSWCnmVw00Q7pDvfrfcTUBim38qjoxfmYRKF2d_pdzHF_UlyUFaujjdNAE'
  const heroImages = settings.heroImages?.length > 0
    ? settings.heroImages
    : [{ url: FALLBACK_HERO }]

  const [heroIndex, setHeroIndex] = useState(0)

  // Auto-advance every 6 s — pauses if only 1 image
  useEffect(() => {
    if (heroImages.length <= 1) return
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 6000)
    return () => clearInterval(t)
  }, [heroImages.length])

  const philosophyImage = settings.philosophyImage ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAJHdCX5hz9o5GMbNDSPGi3gJxLzHtpvLxkpDRPIq1uIRET1jCyafn2j2isYOLbF4y4z_CaAKYk5smPSO3aboOiI_MHa357MLUSI9k_KIszJPW--qBxGIcScEEFd6KrbjpPBNc_Wxve1Vob2S_92Kb9OoKoJUcCC11jmeySuif65XK_u9vij8wd_jLcVQRm6p_yNL6PTs07iRd6jKfVJF_OAyz4OxP-mgs8yAoQ9CeC_eqr-WkCfRpYE0PaOQBc8pXSxFbGcpzLuYUM'

  return (
    <>
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">

        {/* Crossfade background carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="sync">
            <motion.img
              key={heroIndex}
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-[1.05]"
              src={heroImages[heroIndex].url}
              alt={`RajLaxmi Makeup Studio — slide ${heroIndex + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Hero content — stays fixed, doesn't transition with images */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full mt-24">
          <div className="max-w-3xl">
            <motion.span
              className="font-sans text-xs font-semibold text-amber-700 tracking-widest uppercase block mb-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              {settings.tagline || 'A New Era of Aesthetic Mastery'}
            </motion.span>
            <motion.h1
              className="font-serif text-5xl md:text-7xl text-stone-900 leading-[1.05] mb-10 italic"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              The Sanctuary of <br />Personal Evolution
            </motion.h1>
            <motion.div
              className="flex flex-wrap items-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <motion.button
                onClick={() => navigate('/services')}
                className="bg-stone-900 text-stone-50 px-10 py-5 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Services
              </motion.button>
              <button
                onClick={() => navigate('/about')}
                className="font-sans text-xs font-semibold border-b border-stone-900 pb-1 hover:text-amber-700 hover:border-amber-700 transition-all tracking-widest uppercase"
              >
                Our Philosophy
              </button>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators — only shown when more than one image */}
        {heroImages.length > 1 && (
          <motion.div
            className="absolute bottom-12 left-6 md:left-12 flex items-center gap-3 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-px transition-all duration-500 ${
                  i === heroIndex
                    ? 'w-10 bg-stone-900'
                    : 'w-4 bg-stone-400 hover:bg-stone-600'
                }`}
              />
            ))}
          </motion.div>
        )}

        {/* Location badge */}
        <motion.div
          className="absolute bottom-12 right-6 md:right-12 flex flex-col items-end z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <span className="font-sans text-xs uppercase tracking-widest text-stone-500 mb-2">Location</span>
          <span className="font-serif text-lg text-stone-900">
            {settings.address?.split(',')[1]?.trim() || 'Mumbai, India'}
          </span>
        </motion.div>
      </section>

      {/* ─── Philosophy Section ───────────────────────────────────────────── */}
      <section className="py-section-gap max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-12 gap-8 md:gap-gutter items-center">
        <motion.div
          className="col-span-12 md:col-span-5 relative"
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="aspect-[4/5] bg-surface-variant overflow-hidden">
            <img
              className="w-full h-full object-cover mix-blend-multiply opacity-90"
              src={philosophyImage}
              alt="Curated beauty care"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary-container p-6 flex flex-col justify-end">
            <span className="text-4xl font-serif text-secondary mb-2">01</span>
            <p className="font-sans text-[10px] uppercase tracking-tighter leading-tight text-on-secondary-container">
              Exclusivity in Every Detail
            </p>
          </div>
        </motion.div>

        <motion.div
          className="col-span-12 md:col-span-6 md:col-start-7"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-4xl md:text-5xl mb-8">
            The Philosophy of <br />Curated Care
          </h2>
          <p className="font-sans text-lg text-stone-600 mb-12 leading-relaxed">
            At RajLaxmi Makeup Studio, we believe beauty is not a service, but a rigorous practice of craft. Our methodology combines ancestral wisdom with modern scientific precision, creating a bespoke experience that honors the unique architecture of your being.
          </p>
          <div className="space-y-6">
            {[
              {
                pillar: 'Pillar I',
                title: 'Individual Architecture',
                desc: 'Every treatment begins with a comprehensive analysis of your features and skin health.',
              },
              {
                pillar: 'Pillar II',
                title: 'Sourced Excellence',
                desc: 'We exclusively utilize biodynamic botanical extracts and high-performance serums.',
              },
            ].map(({ pillar, title, desc }) => (
              <div key={pillar} className="border-b border-stone-200 pb-6">
                <span className="font-sans text-amber-700 block mb-2 uppercase tracking-widest text-xs font-semibold">
                  {pillar}
                </span>
                <h3 className="font-serif text-xl mb-2">{title}</h3>
                <p className="font-sans text-stone-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Services Section ─────────────────────────────────────────────── */}
      <section className="py-section-gap bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="font-sans text-xs font-semibold text-amber-700 tracking-widest uppercase block mb-4">
                Our Services
              </span>
              <h2 className="font-serif text-5xl md:text-6xl italic">Our Pillars of Craft</h2>
            </motion.div>
            <div className="hidden md:block">
              <button
                onClick={() => navigate('/services')}
                className="group flex items-center gap-4 font-sans text-xs font-semibold uppercase tracking-widest hover:text-amber-700 transition-colors"
              >
                View Full Menu
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform duration-300">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {servicesLoading ? (
            <div className="flex justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {servicesData?.data?.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Stylists Section ─────────────────────────────────────────────── */}
      {!stylistsLoading && stylistsData?.data?.length > 0 && (
        <section className="py-section-gap max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-sans text-xs font-semibold text-amber-700 tracking-widest uppercase block mb-4">
              Our Artisans
            </span>
            <h2 className="font-serif text-4xl md:text-5xl">Meet the Masters</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stylistsData.data.map((stylist, i) => (
              <StylistCard key={stylist.id} stylist={stylist} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ─── Social Videos ────────────────────────────────────────────────── */}
      <SocialVideosSection />

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <CTASection />
    </>
  )
}
