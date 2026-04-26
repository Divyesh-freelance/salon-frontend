import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { socialVideosApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'

// ─── Platform badge ────────────────────────────────────────────────────────────
function PlatformBadge({ platform }) {
  if (platform === 'youtube') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-sans text-xs font-semibold">
        <span className="material-symbols-outlined text-sm" style={{ fontSize: 14 }}>smart_display</span>
        YouTube
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 font-sans text-xs font-semibold">
      <span className="material-symbols-outlined text-sm" style={{ fontSize: 14 }}>photo_camera</span>
      Instagram
    </span>
  )
}

// ─── Video preview card ────────────────────────────────────────────────────────
function VideoPreview({ video }) {
  const [showEmbed, setShowEmbed] = useState(false)

  return (
    <div className="aspect-video bg-stone-100 overflow-hidden relative group">
      {showEmbed ? (
        <iframe
          src={video.embedUrl}
          title={video.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div
          onClick={() => setShowEmbed(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-stone-200 transition-colors"
        >
          <span
            className="material-symbols-outlined text-5xl text-stone-400 group-hover:text-amber-600 transition-colors"
            style={{ fontSize: 48 }}
          >
            play_circle
          </span>
          <p className="font-sans text-xs text-stone-400">Click to preview</p>
        </div>
      )}
    </div>
  )
}

// ─── Add / Edit form ───────────────────────────────────────────────────────────
function VideoForm({ onSubmit, defaultValues, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="admin-label">Video Title *</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="admin-input"
          placeholder="e.g. Bridal Transformation Reel"
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>

      <div>
        <label className="admin-label">YouTube or Instagram URL *</label>
        <input
          {...register('url', { required: 'Video URL is required' })}
          className="admin-input"
          placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
        />
        {errors.url && <p className="form-error">{errors.url.message}</p>}
        <p className="font-sans text-xs text-stone-400 mt-1.5">
          Supported: YouTube watch links, Shorts, youtu.be · Instagram posts (/p/), Reels (/reel/)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Sort Order</label>
          <input
            {...register('sortOrder', { valueAsNumber: true })}
            type="number"
            className="admin-input"
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            {...register('isActive')}
            type="checkbox"
            id="videoActive"
            className="w-4 h-4"
            defaultChecked
          />
          <label htmlFor="videoActive" className="font-sans text-sm text-stone-700">
            Active (visible on website)
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Video'}
      </button>
    </form>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AdminSocialVideos() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-social-videos'],
    queryFn: () => socialVideosApi.adminGetAll({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: socialVideosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-social-videos'] })
      toast.success('Video added')
      setModalOpen(false)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error adding video'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => socialVideosApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-social-videos'] })
      toast.success('Video updated')
      setModalOpen(false)
      setEditing(null)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error updating video'),
  })

  const deleteMutation = useMutation({
    mutationFn: socialVideosApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-social-videos'] })
      toast.success('Video removed')
    },
    onError: () => toast.error('Error removing video'),
  })

  const handleSubmit = (formData) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: formData })
    else createMutation.mutate(formData)
  }

  const videos = data?.data || []

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Social Videos</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} — YouTube &amp; Instagram embeds
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Video
        </button>
      </div>

      {/* ── Tip banner ── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-5 py-4 mb-8">
        <span className="material-symbols-outlined text-amber-600 flex-shrink-0" style={{ fontSize: 20 }}>info</span>
        <p className="font-sans text-sm text-amber-800">
          Paste any YouTube or Instagram link — the platform is detected automatically and the video
          is embedded directly on your website. Videos are displayed in order of Sort Order.
        </p>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <Loader size="lg" className="py-32" />
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300 mb-4">play_circle</span>
          <p className="font-serif text-xl text-stone-400 mb-2">No videos yet</p>
          <p className="font-sans text-sm text-stone-400">
            Add your first YouTube or Instagram video to showcase on the website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              className="bg-white border border-stone-200 overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <VideoPreview video={video} />

              <div className="p-5">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-serif text-base text-stone-900 leading-snug">{video.title}</h3>
                  <span className={`flex-shrink-0 px-2 py-0.5 font-sans text-xs rounded-full ${video.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {video.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <PlatformBadge platform={video.platform} />
                  <span className="font-sans text-xs text-stone-400">Sort: {video.sortOrder}</span>
                </div>

                <p className="font-sans text-xs text-stone-400 truncate mb-4" title={video.url}>
                  {video.url}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setEditing(video); setModalOpen(true) }}
                    className="flex-1 border border-stone-200 py-2 font-sans text-xs uppercase tracking-wider hover:border-stone-900 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Remove this video?')) deleteMutation.mutate(video.id) }}
                    className="flex-1 border border-red-200 text-red-600 py-2 font-sans text-xs uppercase tracking-wider hover:bg-red-50 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Video' : 'Add Social Video'}
        size="md"
      >
        <VideoForm
          onSubmit={handleSubmit}
          defaultValues={editing || { isActive: true, sortOrder: 0 }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
