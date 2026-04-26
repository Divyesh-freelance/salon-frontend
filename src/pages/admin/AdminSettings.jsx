import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { settingsApi } from '../../api/services'
import Loader from '../../components/shared/Loader'
import ImageUploadField from '../../components/shared/ImageUploadField'
import { getImageUrl } from '../../utils/format'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function AdminSettings() {
  const qc = useQueryClient()
  const heroFileRef = useRef(null)
  const [uploadingHero, setUploadingHero] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  })

  const settings = data?.data

  const { register, handleSubmit, reset, watch, control, setValue } = useForm({
    defaultValues: { heroImages: [], philosophyImage: '' },
  })

  const { fields: heroFields, append: appendHero, remove: removeHero } = useFieldArray({
    control,
    name: 'heroImages',
  })

  useEffect(() => {
    if (settings) {
      reset({
        ...settings,
        heroImages: settings.heroImages || [],
        philosophyImage: settings.philosophyImage || '',
      })
    }
  }, [settings, reset])

  const philosophyImageValue = watch('philosophyImage') || ''
  const logoImageValue = watch('logoImage') || ''

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Error saving settings'),
  })

  // Upload a hero image and append it to the array immediately
  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const result = await settingsApi.uploadImage(file)
      appendHero({ url: result.data.url })
      toast.success('Hero image added')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingHero(false)
      if (heroFileRef.current) heroFileRef.current.value = ''
    }
  }

  if (isLoading) return <Loader size="lg" className="py-32" />

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Settings</h1>
        <p className="font-sans text-sm text-stone-500 mt-1">Manage your studio details and configuration</p>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">

        {/* ── Studio Information ─────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-6">Studio Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="admin-label">Studio Name</label>
              <input {...register('salonName')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Tagline</label>
              <input {...register('tagline')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Phone</label>
              <input {...register('phone')} className="admin-input" type="tel" />
            </div>
            <div>
              <label className="admin-label">Email</label>
              <input {...register('email')} className="admin-input" type="email" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Address</label>
              <input {...register('address')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Website</label>
              <input {...register('website')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Slot Interval (minutes)</label>
              <input {...register('slotInterval', { valueAsNumber: true })} type="number" className="admin-input" />
            </div>
          </div>
        </div>

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-1">Logo</h2>
          <p className="font-sans text-sm text-stone-500 mb-6">
            Shown in the navigation bar and admin sidebar. Use a transparent PNG for best results.
            If no logo is set the studio name text is displayed as a fallback.
          </p>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-64">
              <input type="hidden" {...register('logoImage')} />
              <ImageUploadField
                value={logoImageValue}
                onChange={(url) => setValue('logoImage', url, { shouldDirty: true })}
                uploadFn={settingsApi.uploadImage}
                label="Logo Image"
                aspectClass="aspect-[3/1]"
              />
            </div>
            {/* Live preview on both light and dark backgrounds */}
            {logoImageValue && (
              <div className="flex flex-col gap-3">
                <p className="admin-label mb-0">Preview</p>
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-48 h-16 bg-neutral-50 border border-stone-200 px-4">
                    <img src={logoImageValue} alt="Logo on light" className="h-8 w-auto object-contain max-w-full" />
                  </div>
                  <div className="flex items-center justify-center w-48 h-16 bg-stone-900 px-4">
                    <img src={logoImageValue} alt="Logo on dark" className="h-8 w-auto object-contain max-w-full brightness-0 invert" />
                  </div>
                </div>
                <p className="font-sans text-xs text-stone-400">Left: navbar &nbsp;·&nbsp; Right: admin sidebar (auto-inverted)</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Social Links ───────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-6">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="admin-label">Instagram URL</label>
              <input {...register('instagramUrl')} className="admin-input" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="admin-label">Facebook URL</label>
              <input {...register('facebookUrl')} className="admin-input" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="admin-label">Pinterest URL</label>
              <input {...register('pinterestUrl')} className="admin-input" placeholder="https://pinterest.com/..." />
            </div>
          </div>
        </div>

        {/* ── Homepage · Hero Images ─────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-1">Homepage · Hero Images</h2>
          <p className="font-sans text-sm text-stone-500 mb-6">
            The first image is the full-screen hero background. Add multiple for future slideshow support.
            Click <strong>Save Settings</strong> below after adding or removing images.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroFields.map((field, index) => (
              <div
                key={field.id}
                className="relative group aspect-video bg-stone-100 overflow-hidden border border-stone-200"
              >
                <img
                  src={getImageUrl(field.url)}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-amber-700 text-white font-sans text-[10px] px-2 py-0.5 uppercase tracking-wider">
                    Primary
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeHero(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white px-3 py-1.5 font-sans text-xs uppercase tracking-wider hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Upload slot */}
            <div
              onClick={() => !uploadingHero && heroFileRef.current?.click()}
              className="aspect-video border-2 border-dashed border-stone-300 hover:border-stone-900 transition-colors flex flex-col items-center justify-center cursor-pointer"
            >
              <input
                ref={heroFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
              />
              {uploadingHero ? (
                <Loader size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl text-stone-400 mb-1">add_photo_alternate</span>
                  <p className="font-sans text-xs text-stone-400">Add Image</p>
                </>
              )}
            </div>
          </div>

          {heroFields.length === 0 && (
            <p className="font-sans text-xs text-amber-700 mt-4">
              No hero images set — homepage will show a default fallback until you add one and save.
            </p>
          )}
        </div>

        {/* ── Homepage · Philosophy Image ────────────────────────────────── */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-1">Homepage · Philosophy Image</h2>
          <p className="font-sans text-sm text-stone-500 mb-6">
            The portrait shown beside the "Philosophy of Curated Care" section. Best at 4:5 aspect ratio.
          </p>
          <div className="max-w-xs">
            <input type="hidden" {...register('philosophyImage')} />
            <ImageUploadField
              value={philosophyImageValue}
              onChange={(url) => setValue('philosophyImage', url, { shouldDirty: true })}
              uploadFn={settingsApi.uploadImage}
              label="Philosophy Portrait"
              aspectClass="aspect-[4/5]"
            />
          </div>
        </div>

        {/* ── Working Hours ──────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-6">Working Hours</h2>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-stone-50">
                <label className="font-sans text-sm font-medium capitalize text-stone-900">{day}</label>
                <input
                  {...register(`workingHours.${day}.open`)}
                  type="time"
                  className="border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900 outline-none"
                />
                <input
                  {...register(`workingHours.${day}.close`)}
                  type="time"
                  className="border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900 outline-none"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...register(`workingHours.${day}.isOpen`)} type="checkbox" className="w-4 h-4" />
                  <span className="font-sans text-sm text-stone-700">Open</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Save ───────────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-stone-900 text-white px-12 py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
