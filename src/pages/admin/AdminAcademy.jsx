import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { academyApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import ImageUploadField from '../../components/shared/ImageUploadField'
import { formatPrice, getImageUrl } from '../../utils/format'

// ─── Course Form ───────────────────────────────────────────────────────────────
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

// ─── Certificate Modal ─────────────────────────────────────────────────────────
function CertificateModal({ enrollment, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit } = useForm({
    defaultValues: { certificateLink: enrollment.certificateLink || '' },
  })

  const updateMut = useMutation({
    mutationFn: (data) => academyApi.adminUpdateCertificate(enrollment.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-enrollments'] })
      toast.success('Certificate link saved')
      onClose()
    },
    onError: () => toast.error('Failed to save certificate'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative bg-white w-full max-w-md p-8 shadow-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h3 className="font-serif text-xl text-stone-900 mb-1">Certificate Link</h3>
        <p className="font-sans text-xs text-stone-400 mb-6">{enrollment.studentName} — {enrollment.course?.title}</p>

        <form onSubmit={handleSubmit((d) => updateMut.mutate(d))} className="space-y-4">
          <div>
            <label className="admin-label">Certificate URL</label>
            <input
              {...register('certificateLink')}
              className="admin-input"
              placeholder="https://drive.google.com/..."
            />
            <p className="mt-1 font-sans text-xs text-stone-400">Paste a Google Drive, Dropbox, or any public URL for the certificate PDF/image.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-stone-200 py-2.5 font-sans text-xs uppercase tracking-wider hover:border-stone-500 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={updateMut.isPending} className="flex-1 bg-stone-900 text-white py-2.5 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-amber-700 transition-all disabled:opacity-50">
              {updateMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Enrollments Tab ───────────────────────────────────────────────────────────
function EnrollmentsTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [certModal, setCertModal] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enrollments', { page, search, paymentStatus: filterStatus }],
    queryFn: () => academyApi.adminGetEnrollments({ page, limit: 20, search: search || undefined, paymentStatus: filterStatus || undefined }),
  })

  const enrollments = data?.data || []
  const meta = data?.meta || {}
  const stats = data?.stats || {}

  const statusColors = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-600',
    refunded: 'bg-stone-100 text-stone-600',
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Paid', value: stats.totalPaid || 0, icon: 'school' },
          { label: 'Revenue', value: formatPrice(stats.totalRevenue || 0), icon: 'payments' },
          { label: 'Total Enrollments', value: meta.total || 0, icon: 'groups' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-stone-50 border border-stone-100 p-5">
            <span className="material-symbols-outlined text-amber-600 text-xl block mb-2">{icon}</span>
            <p className="font-serif text-2xl text-stone-900 mb-1">{value}</p>
            <p className="font-sans text-xs text-stone-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email, phone or enrollment no..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 font-sans text-sm focus:outline-none focus:border-stone-900"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="border border-stone-200 px-3 py-2.5 font-sans text-sm focus:outline-none focus:border-stone-900 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? <Loader size="lg" className="py-20" /> : (
        <>
          <div className="overflow-x-auto border border-stone-100">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  {['Enrollment No.', 'Student', 'Course', 'Amount', 'Status', 'Date', 'Certificate'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-sans text-xs font-semibold uppercase tracking-widest text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {enrollments.map((e, i) => (
                    <motion.tr
                      key={e.id}
                      className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-4 py-3 font-sans text-xs text-stone-500 font-mono">{e.enrollmentNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-sans text-sm font-medium text-stone-900">{e.studentName}</p>
                        <p className="font-sans text-xs text-stone-400">{e.studentEmail}</p>
                        <p className="font-sans text-xs text-stone-400">{e.studentPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-sans text-sm text-stone-700 max-w-[160px] line-clamp-2">{e.course?.title}</p>
                        <p className="font-sans text-xs text-stone-400">{e.course?.duration}</p>
                      </td>
                      <td className="px-4 py-3 font-sans text-sm font-semibold text-stone-900">{formatPrice(e.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-sans text-xs font-medium capitalize ${statusColors[e.paymentStatus] || 'bg-stone-100 text-stone-500'}`}>
                          {e.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-stone-500 whitespace-nowrap">
                        {format(new Date(e.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        {e.paymentStatus === 'paid' ? (
                          <button
                            onClick={() => setCertModal(e)}
                            className={`flex items-center gap-1 font-sans text-xs uppercase tracking-wider transition-colors ${
                              e.certificateLink
                                ? 'text-amber-700 hover:text-amber-900'
                                : 'text-stone-400 hover:text-stone-900'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                            {e.certificateLink ? 'Update' : 'Add Link'}
                          </button>
                        ) : (
                          <span className="font-sans text-xs text-stone-300">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 font-sans text-stone-400">No enrollments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="font-sans text-sm text-stone-500">
                Showing {enrollments.length} of {meta.total} enrollments
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border border-stone-200 px-3 py-1.5 font-sans text-xs disabled:opacity-40 hover:border-stone-900 transition-all">← Prev</button>
                <span className="font-sans text-sm text-stone-500 flex items-center px-2">Page {page} / {meta.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages} className="border border-stone-200 px-3 py-1.5 font-sans text-xs disabled:opacity-40 hover:border-stone-900 transition-all">Next →</button>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {certModal && <CertificateModal enrollment={certModal} onClose={() => setCertModal(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminAcademy() {
  const [activeTab, setActiveTab] = useState('courses')
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
        {activeTab === 'courses' && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Course
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-stone-200 mb-8">
        {[
          { id: 'courses', label: 'Courses', icon: 'menu_book' },
          { id: 'enrollments', label: 'Enrollments', icon: 'school' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'courses' ? (
          <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
          </motion.div>
        ) : (
          <motion.div key="enrollments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EnrollmentsTab />
          </motion.div>
        )}
      </AnimatePresence>

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
