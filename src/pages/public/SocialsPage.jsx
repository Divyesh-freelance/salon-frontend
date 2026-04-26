import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { socialVideosApi, settingsApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import CTASection from '../../components/shared/CTASection'

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Extract YouTube video ID from an embed URL */
function ytId(embedUrl) {
  return embedUrl?.split('/embed/')?.[1]?.split('?')?.[0] ?? null
}

/** YouTube thumbnail — tries maxres, falls back to hqdefault */
function ytThumb(embedUrl) {
  const id = ytId(embedUrl)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

/** Derive the original Instagram post URL from our stored embedUrl */
function igPostUrl(embedUrl) {
  // embedUrl: https://www.instagram.com/reel/CODE/embed
  return embedUrl?.replace('/embed', '') ?? '#'
}

// ─── YouTube embed card ────────────────────────────────────────────────────────
function YouTubeCard({ video, index }) {
  const [playing, setPlaying] = useState(false)
  const thumb = ytThumb(video.embedUrl)

  return (
    <motion.article
      className="group bg-white border border-stone-100 overflow-hidden hover:shadow-xl transition-shadow duration-500"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-video bg-stone-900 overflow-hidden">
        {playing ? (
          <iframe
            src={`${video.embedUrl}&autoplay=1`}
            title={video.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 w-full h-full"
          >
            {/* Thumbnail */}
            {thumb && (
              <img
                src={thumb}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            {/* Scrim */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />

            {/* Play pill */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm px-6 py-3 shadow-lg group-hover:bg-white group-hover:scale-105 transition-all duration-300">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: 22 }}>play_arrow</span>
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-900">Watch</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Caption */}
      <div className="px-5 py-4 flex items-center gap-3 border-t border-stone-100">
        <span className="material-symbols-outlined text-red-500 flex-shrink-0" style={{ fontSize: 18 }}>smart_display</span>
        <p className="font-sans text-sm text-stone-700 truncate">{video.title}</p>
      </div>
    </motion.article>
  )
}

// ─── Instagram card — links out (no noisy inline embed) ───────────────────────
function InstagramCard({ video, index }) {
  const postUrl = igPostUrl(video.embedUrl)

  return (
    <motion.a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden bg-stone-900 border border-stone-800"
      style={{ aspectRatio: '9/16' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Watch ${video.title} on Instagram`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950" />

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-amber-500/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/15 to-pink-400/10 blur-2xl" />

      {/* Instagram wordmark */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span className="material-symbols-outlined text-white/60" style={{ fontSize: 16 }}>photo_camera</span>
        <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-white/50">Instagram</span>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
        {/* Reel icon ring */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:bg-white/20 group-hover:scale-110 transition-all duration-400">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>play_arrow</span>
          </div>
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border border-pink-400/40 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div>
          <p className="font-serif text-lg text-white leading-snug mb-1">{video.title}</p>
          <p className="font-sans text-xs text-white/40">Tap to watch on Instagram</p>
        </div>
      </div>

      {/* Bottom CTA bar */}
      <div className="absolute bottom-0 inset-x-0 px-5 py-4 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
        <span className="font-sans text-xs text-white/60 uppercase tracking-wider">Watch Reel</span>
        <span className="material-symbols-outlined text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" style={{ fontSize: 16 }}>open_in_new</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 border-2 border-pink-400/0 group-hover:border-pink-400/30 transition-all duration-400" />
    </motion.a>
  )
}

// ─── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon, label, color, count }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 22 }}>{icon}</span>
      <h2 className="font-serif text-2xl text-stone-900">{label}</h2>
      <span className="font-sans text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">{count}</span>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  )
}

// ─── Social profile link ───────────────────────────────────────────────────────
function ProfileLink({ href, icon, label, hoverClass }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2.5 border border-stone-200 px-5 py-3 font-sans text-xs font-semibold uppercase tracking-widest text-stone-600 transition-all duration-300 ${hoverClass}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
      {label}
      <span className="material-symbols-outlined opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" style={{ fontSize: 13 }}>arrow_outward</span>
    </a>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SocialsPage() {
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['social-videos-page'],
    queryFn: () => socialVideosApi.getAll({ limit: 50 }),
  })

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 1000 * 60 * 30,
  })

  const allVideos = videosData?.data || []
  const settings = settingsData?.data || {}

  const youtubeVideos = allVideos.filter((v) => v.platform === 'youtube')
  const instagramVideos = allVideos.filter((v) => v.platform === 'instagram')

  const hasContent = youtubeVideos.length > 0 || instagramVideos.length > 0

  return (
    <>
      {/* ─── Hero — tight & editorial ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div>
            <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] block mb-3">
              Studio in Motion
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-stone-900">Our Socials</h1>
          </div>

          {/* Social profile buttons — inline with title */}
          <div className="flex flex-wrap gap-3">
            <ProfileLink
              href={settings.instagramUrl}
              icon="photo_camera"
              label="Instagram"
              hoverClass="hover:border-pink-400 hover:text-pink-600"
            />
            <ProfileLink
              href={settings.pinterestUrl}
              icon="push_pin"
              label="Pinterest"
              hoverClass="hover:border-red-500 hover:text-red-600"
            />
            <ProfileLink
              href={settings.facebookUrl}
              icon="groups"
              label="Facebook"
              hoverClass="hover:border-blue-500 hover:text-blue-600"
            />
          </div>
        </motion.div>

        {/* Thin rule */}
        <div className="mt-10 h-px bg-stone-200" />
      </section>

      {/* ─── Content ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {isLoading ? (
          <Loader size="lg" className="py-32" />
        ) : !hasContent ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <span className="material-symbols-outlined text-5xl text-stone-200 mb-5">play_circle</span>
            <p className="font-serif text-2xl text-stone-400 mb-2">Coming Soon</p>
            <p className="font-sans text-sm text-stone-400 max-w-xs">
              We&apos;re curating our best work. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-16">

            {/* ── YouTube section ── */}
            {youtubeVideos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <SectionHeading
                  icon="smart_display"
                  label="YouTube"
                  color="text-red-500"
                  count={`${youtubeVideos.length} video${youtubeVideos.length !== 1 ? 's' : ''}`}
                />
                <div className={`grid gap-6 ${
                  youtubeVideos.length === 1
                    ? 'grid-cols-1 max-w-2xl'
                    : 'grid-cols-1 md:grid-cols-2'
                }`}>
                  {youtubeVideos.map((v, i) => (
                    <YouTubeCard key={v.id} video={v} index={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Divider between sections ── */}
            {youtubeVideos.length > 0 && instagramVideos.length > 0 && (
              <div className="h-px bg-stone-100" />
            )}

            {/* ── Instagram section ── */}
            {instagramVideos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <SectionHeading
                  icon="photo_camera"
                  label="Instagram Reels"
                  color="text-pink-500"
                  count={`${instagramVideos.length} reel${instagramVideos.length !== 1 ? 's' : ''}`}
                />
                <div className={`grid gap-5 ${
                  instagramVideos.length === 1
                    ? 'grid-cols-1 max-w-xs'
                    : instagramVideos.length === 2
                    ? 'grid-cols-2 max-w-lg'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}>
                  {instagramVideos.map((v, i) => (
                    <InstagramCard key={v.id} video={v} index={i} />
                  ))}
                </div>

                {/* Follow nudge */}
                {settings.instagramUrl && (
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-stone-100" />
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-sans text-xs text-stone-400 hover:text-pink-500 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>photo_camera</span>
                      Follow us on Instagram for daily updates
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_outward</span>
                    </a>
                    <div className="flex-1 h-px bg-stone-100" />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </section>

      <CTASection />
    </>
  )
}
