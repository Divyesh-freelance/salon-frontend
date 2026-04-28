import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { academyApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import ImageUploadField from '../../components/shared/ImageUploadField'
import { formatPrice, getImageUrl } from '../../utils/format'

function AcademyForm({ onSubmit, defaultValues, isLoading }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      ...defaultValues,
      benefits: Array.isArray(defaultValues?.benefits) ? defaultValues.benefits.join('\n') : defaultValues?.benefits || '',
    },
  })
  const thumbnail = watch('thumbnail') || ''
  const price = watch('price') || 0
  const discount = watch('discountPercentage') || 0
  const finalPrice = price ? (price * (1 - discount / 100)).toFixed(2) : 0

  const handleFormSubmit = (data) => {
    const benefits = data.benefits ? data.benefits.split('\n').filter(Boolean) : []
    onSubmit({ ...data, benefits })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="admin-label">Course Title *</label>
          <input {...register('title', { required: true })} className="admin-input" placeholder="e.g. Advanced Bridal Makeup" />
          {errors.title && <p className="form-error">Title is required</p>}
        </div>
        <div>
          <label className="admin-label">Duration *</label>
          <input {...register('duration', { required: true })} className="admin-input" placeholder="e.g. 3 Months, 6 Weeks" />
          {errors.duration && <p className="form-error">Duration is required</p>}
        </div>
        <div>
          <label className="admin-label">Instructor</label>
          <input {...register('instructor')} className="admin-input" placeholder="Instructor name" />
        </div>
        <div>
          <label className="admin-label">Price (₹) *</label>
          <input {...register('price', { required: true, valueAsNumber: true, min: 0 })} type="number" className="admin-input" placeholder="15000" />
          {errors.price && <p className="form-error">Price is required</p>}
        </div>
        <div>
          <label className="admin-label">Discount %</label>
          <input {...register('discountPercentage', { valueAsNumber: true, min: 0, max: 100 })} type="number" className="admin-input" placeholder="0" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Final Price (auto-calculated)</label>
          <div className="admin-input bg-stone-50 text-amber-700 font-semibold">₹ {finalPrice}</div>
        </div>
        <div className="col-span-2">
          <label className="admin-label">Short Description</label>
          <input {...register('shortDesc')} className="admin-input" placeholder="One-line summary" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Full Description *</label>
          <textarea {...register('description', { required: true })} rows={5} className="admin-input resize-none" />
          {errors.description && <p className="form-error">Description is required</p>}
        </div>
        <div className="col-span-2">
          <label className="admin-label">What Students Learn (one benefit per line)</label>
          <textarea {...register('benefits')} rows={4} className="admin-input resize-none" placeholder="Learn professional makeup techniques&#10;Understand skin types and prep&#10;Bridal makeup artistry" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Certification Details</label>
          <input {...register('certification')} className="admin-input" placeholder="e.g. CIDESCO Certified / International Certificate" />
        </div>
        <div>
          <label className="admin-label">Sort Order</label>
          <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="admin-input" placeholder="0" />
        </div>
        <div className="flex items-center gap-4 mt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('featured')} type="checkbox" className="w-4 h-4" />
            <span className="font-sans text-sm text-stone-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="w-4 h-4" defaultChecked />
            <span className="font-sans text-sm text-stone-700">Active</span>
          </label>
        </div>

        <input type="hidden" {...register('thumbnail')} />
        <div className="col-span-2">
          <label className="admin-label">Thumbnail Image</label>
          <ImageUploadField
            value={thumbnail}
            onChange={(url) => setValue('thumbnail', url, { shouldDirty: true })}
            uploadFn={academyApi.uploadImage}
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50">
        {isLoading ? 'Saving...' : 'Save Course'}
      </button>
    </form>
  )
}

export default function AdminAcademy() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-academy'],
    queryFn: () => academyApi.adminGetAll({ active: 'all', limit: 100 }),
  })

  const createMut = useMutation({
    mutationFn: academyApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-academy'] }); toast.success('Course created'); setModalOpen(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => academyApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-academy'] }); toast.success('Course updated'); setModalOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })
  const deleteMut = useMutation({
    mutationFn: academyApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-academy'] }); toast.success('Course deleted') },
    onError: () => toast.error('Error deleting course'),
  })

  const courses = data?.data || []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Academy</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">{courses.length} courses</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Course
        </button>
      </div>

      {isLoading ? <Loader size="lg" className="py-32" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                className="bg-white border border-stone-200 overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="aspect-video overflow-hidden bg-stone-100">
                  <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-serif text-lg text-stone-900 leading-snug flex-1 mr-2">{course.title}</h3>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full font-sans text-xs ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      {course.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-stone-400 mb-2">{course.duration} {course.instructor && `· ${course.instructor}`}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-serif text-base text-amber-700">{formatPrice(course.finalPrice)}</span>
                    {course.discountPercentage > 0 && (
                      <span className="font-sans text-xs text-stone-400 line-through">{formatPrice(course.price)}</span>
                    )}
                    {course.featured && <span className="font-sans text-xs text-amber-600">★ Featured</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(course); setModalOpen(true) }} className="flex-1 border border-stone-200 py-2 font-sans text-xs uppercase tracking-wider hover:border-stone-900 transition-all">Edit</button>
                    <button onClick={() => { if (confirm('Delete this course?')) deleteMut.mutate(course.id) }} className="flex-1 border border-red-200 text-red-600 py-2 font-sans text-xs uppercase tracking-wider hover:bg-red-50 transition-all">Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {courses.length === 0 && !isLoading && <p className="text-center font-sans text-stone-400 py-16">No courses yet.</p>}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Edit Course' : 'Add New Course'} size="xl">
        <AcademyForm
          onSubmit={(d) => editing ? updateMut.mutate({ id: editing.id, data: d }) : createMut.mutate(d)}
          defaultValues={editing || { isActive: true, sortOrder: 0, discountPercentage: 0, featured: false }}
          isLoading={createMut.isPending || updateMut.isPending}
        />
      </Modal>
    </div>
  )
}
