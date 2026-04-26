import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { socialVideosApi } from '../../api/services'

// ─── Platform icon + label ─────────────────────────────────────────────────────
function PlatformTag({ platform }) {
  if (platform === 'youtube') {
    return (
      <span className="inline-flex items-center gap-1 font-sans text-xs text-red-500 font-semibold uppercase tracking-wider">
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>smart_display</span>
        YouTube
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 font-sans text-xs text-pink-500 font-semibold uppercase tracking-wider">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>photo_camera</span>
      Instagram
    </span>
  )
}

// ─── Single embed card ─────────────────────────────────────────────────────────
function VideoCard({ video, index }) {
  const [playing, setPlaying] = useState(false)

  return (
    <motion.div
      className="bg-white border border-stone-200 overflow-hidden group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Embed area */}
      <div className="aspect-video bg-stone-100 relative overflow-hidden">
        {playing ? (
          <iframe
            src={`${video.embedUrl}${video.platform === 'youtube' ? '&autoplay=1' : ''}`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-4 transition-all duration-300"
            aria-label={`Play ${video.title}`}
          >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 group-hover:from-stone-300 group-hover:to-stone-400 transition-all duration-500" />

            {/* Play button */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-stone-900" style={{ fontSize: 32 }}>
                play_arrow
              </span>
            </div>

            <p className="relative z-10 font-sans text-xs text-stone-600 font-medium">Click to play</p>
          </button>
        )}
      </div>

      {/* Card footer */}
      <div className="px-5 py-4 flex items-center justify-between">
        <p className="font-serif text-sm text-stone-800 truncate mr-3">{video.title}</p>
        <PlatformTag platform={video.platform} />
      </div>
    </motion.div>
  )
}

// ─── Section ───────────────────────────────────────────────────────────────────
export default function SocialVideosSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['social-videos'],
    queryFn: () => socialVideosApi.getAll({ limit: 6 }),
    staleTime: 1000 * 60 * 5,
  })

  const videos = data?.data || []

  // Don't render section at all when there's nothing to show
  if (!isLoading && videos.length === 0) return null

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-sans text-xs font-semibold text-amber-700 tracking-widest uppercase block mb-4">
            Follow Our Work
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            Studio in Motion
          </h2>
          <p className="font-sans text-stone-500 max-w-xl mx-auto leading-relaxed">
            Behind-the-scenes transformations, bridal stories, and the artistry that defines us —
            straight from our studio.
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-stone-200 overflow-hidden animate-pulse">
                <div className="aspect-video bg-stone-200" />
                <div className="px-5 py-4">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video grid */}
        {!isLoading && (
          <div className={`grid gap-6 ${
            videos.length === 1
              ? 'grid-cols-1 max-w-lg mx-auto'
              : videos.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {videos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        )}

        {/* Follow CTA */}
        {!isLoading && videos.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="font-sans text-sm text-stone-400 mb-4">
              Want to see more? Follow us on social media.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {videos.some((v) => v.platform === 'youtube') && (
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-stone-300 px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest text-stone-600 hover:border-red-500 hover:text-red-500 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>smart_display</span>
                  YouTube
                </a>
              )}
              {videos.some((v) => v.platform === 'instagram') && (
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-stone-300 px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest text-stone-600 hover:border-pink-500 hover:text-pink-500 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_camera</span>
                  Instagram
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
