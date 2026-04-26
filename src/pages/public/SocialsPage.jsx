import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { socialVideosApi, settingsApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import CTASection from '../../components/shared/CTASection'

// ─── Platform config ───────────────────────────────────────────────────────────
const PLATFORM_CONFIG = {
  youtube: {
    label: 'YouTube',
    icon: 'smart_display',
    accent: 'text-red-500',
    border: 'border-red-400',
    bg: 'bg-red-50',
    badgeBg: 'bg-red-50 text-red-600',
    button: 'hover:border-red-400 hover:text-red-500',
  },
  instagram: {
    label: 'Instagram',
    icon: 'photo_camera',
    accent: 'text-pink-500',
    border: 'border-pink-400',
    bg: 'bg-pink-50',
    badgeBg: 'bg-pink-50 text-pink-600',
    button: 'hover:border-pink-400 hover:text-pink-500',
  },
}

// ─── Single video embed — large format, no scroll needed ──────────────────────
function VideoEmbed({ video, index }) {
  const [playing, setPlaying] = useState(false)
  const cfg = PLATFORM_CONFIG[video.platform] || PLATFORM_CONFIG.youtube

  // Instagram reels are portrait (9:16); YouTube is landscape (16:9)
  const isPortrait = video.platform === 'instagram'

  return (
    <motion.div
      className="bg-white border border-stone-200 overflow-hidden"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Embed — tall enough to watch without scrolling */}
      <div
        className={`relative w-full bg-stone-100 overflow-hidden ${
          isPortrait ? 'aspect-[9/16]' : 'aspect-video'
        }`}
        style={isPortrait ? { minHeight: 480 } : { minHeight: 420 }}
      >
        {playing ? (
          <iframe
            src={`${video.embedUrl}${video.platform === 'youtube' ? '&autoplay=1' : ''}`}
            title={video.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-5 group"
          >
            {/* Background */}
            <div className={`absolute inset-0 ${cfg.bg} opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />
            <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/5 transition-all duration-500" />

            {/* Play button */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-400">
              <span className="material-symbols-outlined text-stone-900" style={{ fontSize: 42 }}>play_arrow</span>
            </div>

            <div className="relative z-10 text-center px-8">
              <p className="font-serif text-xl text-stone-800 mb-1">{video.title}</p>
              <p className="font-sans text-xs text-stone-500">Click to play</p>
            </div>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-stone-100">
        <p className="font-serif text-base text-stone-900 truncate mr-4">{video.title}</p>
        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-semibold ${cfg.badgeBg}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{cfg.icon}</span>
          {cfg.label}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Social profile link button ────────────────────────────────────────────────
function SocialLink({ href, icon, label, colorClass, description }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-start gap-4 border border-stone-200 px-6 py-5 transition-all duration-300 group hover:shadow-md ${colorClass}`}
    >
      <span className="material-symbols-outlined text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-semibold uppercase tracking-widest">{label}</p>
        {description && <p className="font-sans text-xs text-stone-400 mt-0.5">{description}</p>}
      </div>
      <span className="material-symbols-outlined text-stone-300 group-hover:text-current group-hover:translate-x-1 transition-all self-center">arrow_forward</span>
    </a>
  )
}

// ─── Filter tab ────────────────────────────────────────────────────────────────
function FilterTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
        active
          ? 'bg-stone-900 text-white'
          : 'border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SocialsPage() {
  const [filter, setFilter] = useState('all')

  const { data: videosData, isLoading } = useQuery({
    queryKey: ['social-videos-all'],
    queryFn: () => socialVideosApi.getAll({ limit: 50 }),
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 1000 * 60 * 30,
  })

  const allVideos = videosData?.data || []
  const settings = settingsData?.data || {}

  const platforms = ['all', ...new Set(allVideos.map((v) => v.platform))]

  const filtered = filter === 'all' ? allVideos : allVideos.filter((v) => v.platform === filter)

  // Instagram is portrait → 3-col; YouTube landscape → 2-col; mixed → 2-col
  const hasInstagram = filtered.some((v) => v.platform === 'instagram')
  const hasYouTube = filtered.some((v) => v.platform === 'youtube')
  const gridCols =
    filter === 'instagram'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2'

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            Studio in Motion
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-6">Our Socials</h1>
          <p className="font-sans text-lg text-stone-500 max-w-2xl leading-relaxed">
            Behind-the-scenes reels, bridal transformations, and artistry in action —
            everything straight from our studio.
          </p>
        </motion.div>
      </section>

      {/* ─── Social Profile Links ─────────────────────────────────────────── */}
      {(settings.instagramUrl || settings.facebookUrl || settings.pinterestUrl) && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-14">
          <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-4">Follow us on</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SocialLink
              href={settings.instagramUrl}
              icon="photo_camera"
              label="Instagram"
              description="Reels, posts & stories"
              colorClass="hover:border-pink-400 hover:text-pink-600"
            />
            <SocialLink
              href={
                allVideos.some((v) => v.platform === 'youtube')
                  ? `https://youtube.com`
                  : null
              }
              icon="smart_display"
              label="YouTube"
              description="Full videos & tutorials"
              colorClass="hover:border-red-400 hover:text-red-600"
            />
            <SocialLink
              href={settings.pinterestUrl}
              icon="push_pin"
              label="Pinterest"
              description="Inspiration boards"
              colorClass="hover:border-red-600 hover:text-red-700"
            />
            <SocialLink
              href={settings.facebookUrl}
              icon="groups"
              label="Facebook"
              description="Updates & community"
              colorClass="hover:border-blue-500 hover:text-blue-600"
            />
          </div>
        </section>
      )}

      {/* ─── Platform Filter ──────────────────────────────────────────────── */}
      {platforms.length > 2 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
          <div className="flex flex-wrap gap-3 border-b border-stone-200 pb-8">
            {platforms.map((p) => (
              <FilterTab key={p} active={filter === p} onClick={() => setFilter(p)}>
                {p === 'all' ? 'All Videos' : PLATFORM_CONFIG[p]?.label || p}
              </FilterTab>
            ))}
          </div>
        </section>
      )}

      {/* ─── Video Grid ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        {isLoading ? (
          <Loader size="lg" className="py-32" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="material-symbols-outlined text-5xl text-stone-300 mb-4">play_circle</span>
            <p className="font-serif text-2xl text-stone-400 mb-2">No videos yet</p>
            <p className="font-sans text-sm text-stone-400">
              Check back soon — we&apos;re busy creating!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              className={`grid gap-8 ${gridCols}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((video, i) => (
                <VideoEmbed key={video.id} video={video} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <CTASection />
    </>
  )
}
