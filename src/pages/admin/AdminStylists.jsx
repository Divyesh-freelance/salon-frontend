import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { stylistsApi, servicesApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import { getImageUrl } from '../../utils/format'

function StylistForm({ onSubmit, defaultValues, services, isLoading }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues })
  const selectedServiceIds = watch('serviceIds') || []

  const toggleService = (serviceId) => {
    const current = Array.isArray(selectedServiceIds) ? selectedServiceIds : []
    if (current.includes(serviceId)) {
      setValue('serviceIds', current.filter((id) => id !== serviceId), { shouldDirty: true })
    } else {
      setValue('serviceIds', [...current, serviceId], { shouldDirty: true })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Full Name *</label>
          <input {...register('name', { required: true })} className="admin-input" placeholder="e.g. Priya Sharma" />
          {errors.name && <p className="form-error">Name required</p>}
        </div>
        <div>
          <label className="admin-label">Title *</label>
          <input {...register('title', { required: true })} className="admin-input" placeholder="e.g. Creative Director" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Specialization *</label>
          <input {...register('specialization', { required: true })} className="admin-input" placeholder="e.g. Bridal & Editorial Makeup" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Bio *</label>
          <textarea {...register('bio', { required: true })} rows={4} className="admin-input resize-none" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Image URL</label>
          <input {...register('image')} className="admin-input" placeholder="https://..." />
        </div>
        <div>
          <label className="admin-label">Sort Order</label>
          <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="admin-input" placeholder="0" />
        </div>
        <div className="flex items-center gap-3">
          <input {...register('isActive')} type="checkbox" id="stylistActive" className="w-4 h-4" defaultChecked />
          <label htmlFor="stylistActive" className="font-sans text-sm">Active</label>
        </div>

        {/* ── Service Assignments ─────────────────────────────────── */}
        <div className="col-span-2">
          <label className="admin-label">Services Offered</label>
          <p className="font-sans text-xs text-stone-400 mb-3">
            Select which services this artisan can perform. Clients can only book this artisan for ticked services.
          </p>
          {services.length === 0 ? (
            <p className="font-sans text-sm text-stone-400 italic">No services found — add services first.</p>
          ) : (
            <div className="border border-stone-200 rounded-sm divide-y divide-stone-100 max-h-52 overflow-y-auto">
              {services.map((s) => {
                const checked = Array.isArray(selectedServiceIds) && selectedServiceIds.includes(s.id)
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(s.id)}
                      className="w-4 h-4 accent-stone-900 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-stone-800 truncate">{s.title}</p>
                      <p className="font-sans text-xs text-stone-400">{s.category}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
          {/* Hidden field keeps the array in form state */}
          <input type="hidden" {...register('serviceIds')} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Artisan'}
      </button>
    </form>
  )
}

export default function AdminStylists() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stylists'],
    queryFn: () => stylistsApi.getAll({ active: 'all', limit: 100 }),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services-all'],
    queryFn: () => servicesApi.getAll({ active: 'all', limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: stylistsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-stylists'] }); toast.success('Artisan created'); setModalOpen(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => stylistsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-stylists'] }); toast.success('Artisan updated'); setModalOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })

  const deleteMutation = useMutation({
    mutationFn: stylistsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-stylists'] }); toast.success('Artisan deleted') },
  })

  const handleSubmit = (formData) => {
    // Ensure serviceIds is always a plain array (RHF may return undefined)
    const payload = { ...formData, serviceIds: formData.serviceIds || [] }
    if (editing) updateMutation.mutate({ id: editing.id, data: payload })
    else createMutation.mutate(payload)
  }

  // Derive flat serviceIds array from the nested relation so checkboxes pre-fill
  const prepareEditDefaults = (stylist) => ({
    ...stylist,
    serviceIds: stylist.services?.map((ss) => ss.serviceId) ?? [],
  })

  const stylists = data?.data || []
  const services = servicesData?.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Artisans</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">{stylists.length} artisans</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Artisan
        </button>
      </div>

      {isLoading ? (
        <Loader size="lg" className="py-32" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stylists.map((stylist, i) => (
            <motion.div
              key={stylist.id}
              className="bg-white border border-stone-200 p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={getImageUrl(stylist.image)}
                  alt={stylist.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-serif text-lg">{stylist.name}</h3>
                  <p className="font-sans text-xs text-amber-700 uppercase tracking-wider">{stylist.title}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 font-sans text-xs rounded-full ${stylist.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {stylist.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="font-sans text-sm text-stone-500 mb-4">{stylist.specialization}</p>
              <p className="font-sans text-sm text-stone-600 line-clamp-2 mb-4">{stylist.bio}</p>
              {stylist.services?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {stylist.services.map((ss) => (
                    <span key={ss.service.id} className="px-2 py-0.5 bg-stone-100 font-sans text-xs text-stone-600 rounded-full">
                      {ss.service.title}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditing(prepareEditDefaults(stylist)); setModalOpen(true) }}
                  className="flex-1 border border-stone-200 py-2 font-sans text-xs uppercase tracking-wider hover:border-stone-900 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => { if (confirm('Delete artisan?')) deleteMutation.mutate(stylist.id) }}
                  className="flex-1 border border-red-200 text-red-600 py-2 font-sans text-xs uppercase tracking-wider hover:bg-red-50 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Artisan' : 'Add New Artisan'}
        size="lg"
      >
        <StylistForm
          onSubmit={handleSubmit}
          defaultValues={editing || { isActive: true, sortOrder: 0, serviceIds: [] }}
          services={services}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
