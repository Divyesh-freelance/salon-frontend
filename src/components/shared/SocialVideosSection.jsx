import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { settingsApi, socialVideosApi } from '../../api/services'

export default function SocialVideosSection() {
  const { data: videosData } = useQuery({
    queryKey: ['social-videos'],
    queryFn: () => socialVideosApi.getAll({ limit: 1 }),
    staleTime: 1000 * 60 * 5,
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 1000 * 60 * 30,
  })

  const videos = videosData?.data || []
  const settings = settingsData?.data || {}

  // Don't show this teaser if no videos AND no social links
  const hasSocials = settings.instagramUrl || settings.facebookUrl || settings.pinterestUrl
  if (videos.length === 0 && !hasSocials) return null

  const socialLinks = [
    {
      key: 'instagram',
      url: settings.instagramUrl,
      label: 'Instagram',
      icon: 'photo_camera',
      colors: 'hover:border-pink-400 hover:text-pink-500',
    },
    {
      key: 'youtube',
      url: videos.some((v) => v.platform === 'youtube') ? '/socials' : null,
      label: 'YouTube',
      icon: 'smart_display',
      colors: 'hover:border-red-400 hover:text-red-500',
    },
    {
      key: 'pinterest',
      url: settings.pinterestUrl,
      label: 'Pinterest',
      icon: 'push_pin',
      colors: 'hover:border-red-600 hover:text-red-700',
    },
    {
      key: 'facebook',
      url: settings.facebookUrl,
      label: 'Facebook',
      icon: 'groups',
      colors: 'hover:border-blue-500 hover:text-blue-600',
    },
  ].filter((s) => s.url)

  return (
    <section className="py-24 bg-stone-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">

          {/* Left — copy */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-sans text-xs font-semibold text-amber-500 tracking-widest uppercase block mb-4">
              Follow Our Work
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight">
              Studio in Motion
            </h2>
            <p className="font-sans text-stone-400 leading-relaxed mb-8">
              Behind-the-scenes transformations, bridal stories, and the artistry that defines us —
              watch it all on our socials.
            </p>

            <Link
              to="/socials"
              className="inline-flex items-center gap-3 bg-amber-600 text-white px-8 py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-500 transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-sm">play_circle</span>
              Watch Our Videos
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>

          {/* Right — social platform links */}
          {socialLinks.length > 0 && (
            <motion.div
              className="flex flex-col gap-4 min-w-[220px]"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-sans text-xs text-stone-500 uppercase tracking-widest mb-1">Find us on</p>
              {socialLinks.map(({ key, url, label, icon, colors }) => {
                const isExternal = url.startsWith('http')
                const props = isExternal
                  ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: url }

                return (
                  <a
                    key={key}
                    {...props}
                    className={`flex items-center gap-3 border border-stone-700 px-5 py-3.5 font-sans text-sm text-stone-300 transition-all duration-300 ${colors} group`}
                  >
                    <span className="material-symbols-outlined text-base flex-shrink-0">{icon}</span>
                    <span className="flex-1">{label}</span>
                    <span className="material-symbols-outlined text-xs opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                  </a>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
