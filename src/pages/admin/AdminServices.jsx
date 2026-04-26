import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { servicesApi, settingsApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import ImageUploadField from '../../components/shared/ImageUploadField'
import { formatPrice, getDurationText, getImageUrl } from '../../utils/format'

const CATEGORIES = ['Hair Styling', 'Skin Therapy', 'Hands & Feet', 'Occasions', 'Other']

// ─── Service Form ──────────────────────────────────────────────────────────────
function ServiceForm({ onSubmit, defaultValues, isLoading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ defaultValues })
  const imageValue = watch('image') || ''

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="admin-label">Service Title *</label>
          <input {...register('title', { required: true })} className="admin-input" placeholder="e.g. Signature Precision Cut" />
          {errors.title && <p className="form-error">Title is required</p>}
        </div>
        <div>
          <label className="admin-label">Category *</label>
          <select {...register('category', { required: true })} className="admin-input">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="admin-label">Price (₹) *</label>
          <input {...register('price', { required: true, valueAsNumber: true })} type="number" className="admin-input" placeholder="3500" />
          {errors.price && <p className="form-error">Price is required</p>}
        </div>
        <div>
          <label className="admin-label">Duration (minutes) *</label>
          <input {...register('duration', { required: true, valueAsNumber: true })} type="number" className="admin-input" placeholder="60" />
        </div>
        <div>
          <label className="admin-label">Sort Order</label>
          <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="admin-input" placeholder="0" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Short Description</label>
          <input {...register('shortDesc')} className="admin-input" placeholder="Brief one-line description" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Full Description *</label>
          <textarea {...register('description', { required: true })} rows={4} className="admin-input resize-none" />
          {errors.description && <p className="form-error">Description is required</p>}
        </div>

        {/* Smart image field — hidden input keeps the URL in the form */}
        <input type="hidden" {...register('image')} />
        <ImageUploadField
          value={imageValue}
          onChange={(url) => setValue('image', url, { shouldDirty: true })}
        />

        <div className="flex items-center gap-3">
          <input {...register('isActive')} type="checkbox" id="isActive" className="w-4 h-4" defaultChecked />
          <label htmlFor="isActive" className="font-sans text-sm text-stone-700">Active (visible on website)</label>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Service'}
      </button>
    </form>
  )
}

export default function AdminServices() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => servicesApi.getAll({ active: 'all', limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service created'); setModalOpen(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error creating service'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service updated'); setModalOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error updating service'),
  })

  const deleteMutation = useMutation({
    mutationFn: servicesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast.success('Service deleted') },
    onError: () => toast.error('Error deleting service'),
  })

  const handleSubmit = (data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data })
    else createMutation.mutate(data)
  }

  const openEdit = (service) => { setEditing(service); setModalOpen(true) }
  const openCreate = () => { setEditing(null); setModalOpen(true) }

  const services = data?.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Services</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">{services.length} services total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Service
        </button>
      </div>

      {isLoading ? (
        <Loader size="lg" className="py-32" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              className="bg-white border border-stone-200 overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="aspect-video overflow-hidden bg-stone-100">
                <img src={getImageUrl(service.image)} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-lg text-stone-900 leading-tight">{service.title}</h3>
                  <span className={`ml-2 flex-shrink-0 px-2 py-0.5 font-sans text-xs rounded-full ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {service.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="font-sans text-xs text-stone-500 uppercase tracking-wider mb-3">{service.category}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-serif text-amber-700">{formatPrice(service.price)}</span>
                  <span className="font-sans text-xs text-stone-400">{getDurationText(service.duration)}</span>
                </div>
                <p className="font-sans text-sm text-stone-500 line-clamp-2 mb-4">{service.shortDesc || service.description}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEdit(service)}
                    className="flex-1 border border-stone-200 py-2 font-sans text-xs uppercase tracking-wider hover:border-stone-900 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(service.id) }}
                    className="flex-1 border border-red-200 text-red-600 py-2 font-sans text-xs uppercase tracking-wider hover:bg-red-50 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Service' : 'Add New Service'}
        size="lg"
      >
        <ServiceForm
          onSubmit={handleSubmit}
          defaultValues={editing || { isActive: true, sortOrder: 0 }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
