import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getImageUrl } from '../../utils/format'

/**
 * Reusable image upload field.
 *
 * Props:
 *   value      – current image URL (server path or full URL)
 *   onChange   – called with the new URL string (or '' to clear)
 *   uploadFn   – async fn that receives a File and returns { data: { url } }
 *   label      – field label (default: "Image")
 *   aspectClass – Tailwind aspect-ratio class for the preview (default: 'aspect-video')
 */
export default function ImageUploadField({
  value,
  onChange,
  uploadFn,
  label = 'Image',
  aspectClass = 'aspect-video',
}) {
  const [mode, setMode] = useState(value && !value.startsWith('blob:') ? 'preview' : 'upload')
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const previewSrc = value ? getImageUrl(value) : null

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setUploading(true)
    try {
      const result = await uploadFn(file)
      onChange(result.data.url)
      setMode('preview')
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }, [uploadFn, onChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUrlConfirm = () => {
    if (!urlInput.trim()) return
    onChange(urlInput.trim())
    setMode('preview')
  }

  const handleRemove = () => {
    onChange('')
    setUrlInput('')
    setMode('upload')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <label className="admin-label">{label}</label>

      {/* ── Preview ── */}
      {mode === 'preview' && previewSrc && (
        <div className={`relative group w-full ${aspectClass} bg-stone-100 overflow-hidden border border-stone-200`}>
          <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setMode('upload'); onChange('') }}
              className="bg-white text-stone-900 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-50 transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-2 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ── Upload / URL ── */}
      {mode !== 'preview' && (
        <div className="space-y-3">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-sm py-8 cursor-pointer transition-colors
              ${dragOver ? 'border-amber-600 bg-amber-50' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {uploading ? (
              <>
                <span className="material-symbols-outlined text-3xl text-amber-600 animate-pulse">cloud_upload</span>
                <p className="font-sans text-sm text-stone-500">Uploading…</p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-3xl text-stone-400">add_photo_alternate</span>
                <div className="text-center">
                  <p className="font-sans text-sm text-stone-600 font-medium">Click to upload or drag & drop</p>
                  <p className="font-sans text-xs text-stone-400 mt-1">JPG, PNG, WebP — max 5 MB</p>
                </div>
              </>
            )}
          </div>

          {/* URL toggle */}
          {mode === 'upload' && (
            <button
              type="button"
              onClick={() => setMode('url')}
              className="font-sans text-xs text-stone-400 hover:text-amber-700 underline transition-colors"
            >
              Or paste an image URL instead
            </button>
          )}

          {/* URL input */}
          {mode === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlConfirm())}
                className="admin-input flex-1"
                placeholder="https://example.com/image.jpg"
                autoFocus
              />
              <button
                type="button"
                onClick={handleUrlConfirm}
                className="px-4 bg-stone-900 text-white font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all whitespace-nowrap"
              >
                Use URL
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className="px-3 border border-stone-200 font-sans text-xs text-stone-500 hover:border-stone-400 transition-all"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
