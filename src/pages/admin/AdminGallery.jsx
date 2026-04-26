import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { galleryApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import EmptyState from '../../components/shared/EmptyState'
import { getImageUrl } from '../../utils/format'

const CATEGORIES = ['Hair Styling', 'Skin Therapy', 'Hands & Feet', 'Bridal', 'Occasions', 'General']

export default function AdminGallery() {
  const [uploading, setUploading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [category, setCategory] = useState('General')
  const [alt, setAlt] = useState('')
  const fileRef = useRef(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: galleryApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: galleryApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); toast.success('Image removed') },
    onError: () => toast.error('Error deleting image'),
  })

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('category', category)
      formData.append('alt', alt)
      await galleryApi.upload(formData)
      qc.invalidateQueries({ queryKey: ['admin-gallery'] })
      toast.success('Image uploaded')
      if (fileRef.current) fileRef.current.value = ''
      setAlt('')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const allImages = data?.data || []
  const categories = ['All', ...new Set(allImages.map((img) => img.category))]
  const filtered = activeCategory === 'All' ? allImages : allImages.filter((img) => img.category === activeCategory)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Gallery</h1>
        <p className="font-sans text-sm text-stone-500 mt-1">{allImages.length} images</p>
      </div>

      {/* Upload Panel */}
      <div className="bg-white border border-stone-200 p-6 mb-8">
        <h2 className="font-serif text-xl mb-4">Upload Image</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="admin-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Alt Text</label>
            <input value={alt} onChange={(e) => setAlt(e.target.value)} className="admin-input" placeholder="Description of the image" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Image File</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full font-sans text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:border file:border-stone-900 file:bg-stone-900 file:text-white file:font-sans file:text-xs file:uppercase file:tracking-widest hover:file:bg-amber-700 file:transition-colors cursor-pointer"
            />
          </div>
        </div>
        {uploading && <div className="mt-4"><Loader size="sm" /></div>}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 font-sans text-xs uppercase tracking-wider transition-all rounded-full ${
              activeCategory === cat ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-500 hover:border-stone-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <Loader size="lg" className="py-32" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No images yet" message="Upload your first image above." icon="🖼" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img, i) => (
            <motion.div
              key={img.id}
              className="group relative aspect-square overflow-hidden bg-stone-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <img src={getImageUrl(img.image)} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => { if (confirm('Delete this image?')) deleteMutation.mutate(img.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-600 px-4 py-2 font-sans text-xs uppercase tracking-wider hover:bg-red-600 hover:text-white"
                >
                  Remove
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-sans text-xs text-white uppercase tracking-wider">{img.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
