import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { discountsApi, servicesApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import ImageUploadField from '../../components/shared/ImageUploadField'
import { formatDateShort, getImageUrl } from '../../utils/format'

const CATEGORIES = ['Hair', 'Facial', 'Makeup', 'Bridal', 'Spa', 'Nails', 'Skin Care', 'General']

// ─── Service multi-select chip picker ─────────────────────────────────────────
function ServicePicker({ services, value = [], onChange }) {
  const toggle = (id) => {
    const next = value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    onChange(next)
  }

  return (
    <div>
      <p className="font-sans text-xs text-stone-400 mb-2">
        Leave all un-selected to make this offer apply to <strong className="text-stone-600">all services</strong>.
      </p>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
        {services.map((s) => {
          const selected = value.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`px-3 py-1.5 border font-sans text-xs transition-all ${
                selected
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 text-stone-600 hover:border-stone-500'
              }`}
            >
              {s.title}
              {selected && <span className="ml-1.5 material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'middle' }}>check</span>}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="font-sans text-xs text-amber-700 mt-2">
          Applied to {value.length} service{value.length > 1 ? 's' : ''} only
        </p>
      )}
    </div>
  )
}

// ─── Discount Form ─────────────────────────────────────────────────────────────
function DiscountForm({ onSubmit, defaultValues, isLoading, services }) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm({
    defaultValues: {
      ...defaultValues,
      serviceIds: defaultValues?.serviceIds || [],
      expiryDate: defaultValues?.expiryDate
        ? new Date(defaultValues.expiryDate).toISOString().split('T')[0]
        : '',
    },
  })
  const image = watch('image') || ''
  const serviceIds = watch('serviceIds') || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="admin-label">Offer Title *</label>
          <input {...register('title', { required: true })} className="admin-input" placeholder="e.g. Monsoon Hair Care 30% Off" />
          {errors.title && <p className="form-error">Title is required</p>}
        </div>

        <div>
          <label className="admin-label">Category *</label>
          <select {...register('category', { required: true })} className="admin-input">
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="form-error">Category is required</p>}
        </div>

        <div>
          <label className="admin-label">Discount % *</label>
          <input
            {...register('discountPercentage', { required: true, valueAsNumber: true, min: 1, max: 100 })}
            type="number"
            className="admin-input"
            placeholder="30"
          />
          {errors.discountPercentage && <p className="form-error">Discount % required (1–100)</p>}
        </div>

        <div className="col-span-2">
          <label className="admin-label">Description</label>
          <textarea {...register('description')} rows={3} className="admin-input resize-none" placeholder="Brief description of the offer" />
        </div>

        {/* ── Service link ───────────────────────────────────────────────── */}
        <div className="col-span-2">
          <label className="admin-label">Applicable Services</label>
          <Controller
            name="serviceIds"
            control={control}
            render={({ field }) => (
              <ServicePicker
                services={services}
                value={field.value || []}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <label className="admin-label">Expiry Date</label>
          <input {...register('expiryDate')} type="date" className="admin-input" />
        </div>

        <div>
          <label className="admin-label">CTA Button Text</label>
          <input {...register('ctaText')} className="admin-input" placeholder="Book Now" />
        </div>

        <div className="col-span-2">
          <label className="admin-label">CTA Link (optional)</label>
          <input {...register('ctaLink')} className="admin-input" placeholder="/booking or /services/haircut" />
        </div>

        <div>
          <label className="admin-label">Sort Order</label>
          <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="admin-input" placeholder="0" />
        </div>

        <div className="flex items-center gap-4 mt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('trending')} type="checkbox" className="w-4 h-4" />
            <span className="font-sans text-sm text-stone-700">Trending</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="w-4 h-4" defaultChecked />
            <span className="font-sans text-sm text-stone-700">Active</span>
          </label>
        </div>

        <input type="hidden" {...register('image')} />
        <div className="col-span-2">
          <label className="admin-label">Banner Image</label>
          <ImageUploadField
            value={image}
            onChange={(url) => setValue('image', url, { shouldDirty: true })}
            uploadFn={discountsApi.uploadImage}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Offer'}
      </button>
    </form>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDiscounts() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => discountsApi.adminGetAll({ active: 'all', limit: 100 }),
  })

  // Fetch all active services for the service picker
  const { data: servicesData } = useQuery({
    queryKey: ['services-picker'],
    queryFn: () => servicesApi.getAll({ active: 'true', limit: 100 }),
    staleTime: 1000 * 60 * 5,
  })
  const allServices = servicesData?.data || []

  const createMut = useMutation({
    mutationFn: discountsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-discounts'] }); toast.success('Offer created'); setModalOpen(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => discountsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-discounts'] }); toast.success('Offer updated'); setModalOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })
  const deleteMut = useMutation({
    mutationFn: discountsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-discounts'] }); toast.success('Offer deleted') },
    onError: () => toast.error('Error deleting offer'),
  })

  const discounts = data?.data || []

  const toggleActive = (d) => updateMut.mutate({ id: d.id, data: { ...d, isActive: !d.isActive } })

  // Resolve service names for the card
  const getServiceNames = (serviceIds) => {
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) return null
    const names = serviceIds
      .map((id) => allServices.find((s) => s.id === id)?.title)
      .filter(Boolean)
    return names.length > 0 ? names : null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Discounts & Offers</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">
            {discounts.length} offers · {discounts.filter((d) => d.isActive).length} active
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Offer
        </button>
      </div>

      {isLoading ? <Loader size="lg" className="py-32" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {discounts.map((d, i) => {
              const serviceNames = getServiceNames(d.serviceIds)
              return (
                <motion.div
                  key={d.id}
                  className="bg-white border border-stone-200 overflow-hidden"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Banner */}
                  <div className="aspect-[16/7] bg-stone-100 overflow-hidden relative">
                    {d.image ? (
                      <img src={getImageUrl(d.image)} alt={d.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-600 flex items-center justify-center">
                        <span className="font-serif text-4xl font-bold text-amber-400">{Math.round(d.discountPercentage)}%</span>
                      </div>
                    )}
                    {d.trending && (
                      <span className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-0.5 font-sans text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">local_fire_department</span> Trending
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-white text-stone-900 px-2 py-1 font-serif text-xl font-bold leading-none">
                      -{Math.round(d.discountPercentage)}%
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif text-base text-stone-900 leading-snug flex-1">{d.title}</h3>
                      <span className="flex-shrink-0 px-2 py-0.5 bg-stone-100 text-stone-500 font-sans text-xs uppercase tracking-wider">{d.category}</span>
                    </div>

                    {/* Service scope indicator */}
                    <div className="mb-2">
                      {serviceNames ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {serviceNames.slice(0, 3).map((name) => (
                            <span key={name} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 font-sans text-[10px] uppercase tracking-wider">
                              {name}
                            </span>
                          ))}
                          {serviceNames.length > 3 && (
                            <span className="px-2 py-0.5 bg-stone-50 text-stone-500 font-sans text-[10px]">+{serviceNames.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-sans text-xs text-stone-400 italic">All services</span>
                      )}
                    </div>

                    {d.expiryDate && (
                      <p className="font-sans text-xs text-stone-400 mb-3">Expires: {formatDateShort(d.expiryDate)}</p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => toggleActive(d)}
                        className={`px-3 py-1 rounded-full font-sans text-xs font-semibold transition-all ${
                          d.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {d.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(d); setModalOpen(true) }}
                        className="flex-1 border border-stone-200 py-2 font-sans text-xs uppercase tracking-wider hover:border-stone-900 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this offer?')) deleteMut.mutate(d.id) }}
                        className="flex-1 border border-red-200 text-red-600 py-2 font-sans text-xs uppercase tracking-wider hover:bg-red-50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {discounts.length === 0 && !isLoading && (
        <p className="text-center font-sans text-stone-400 py-16">No offers yet.</p>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Offer' : 'Create Offer'}
        size="lg"
      >
        <DiscountForm
          onSubmit={(d) => editing ? updateMut.mutate({ id: editing.id, data: d }) : createMut.mutate(d)}
          defaultValues={editing || { isActive: true, trending: false, ctaText: 'Book Now', sortOrder: 0, serviceIds: [] }}
          isLoading={createMut.isPending || updateMut.isPending}
          services={allServices}
        />
      </Modal>
    </div>
  )
}
