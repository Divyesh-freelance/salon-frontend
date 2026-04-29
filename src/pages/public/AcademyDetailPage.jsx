import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { academyApi } from '../../api/services'
import { formatPrice, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'

// Dynamically load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function EnrollModal({ course, onClose }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const enrollMutation = useMutation({
    mutationFn: (data) => academyApi.enroll(data),
    onError: (err) => toast.error(err.response?.data?.message || 'Enrollment failed. Please try again.'),
  })

  const onSubmit = async (formData) => {
    const result = await enrollMutation.mutateAsync({
      courseId: course.id,
      studentName: formData.studentName,
      studentEmail: formData.studentEmail,
      studentPhone: formData.studentPhone,
      notes: formData.notes || '',
    })

    const { enrollment, razorpayOrder, razorpayKeyId } = result.data

    // ── Scaffold mode (no Razorpay keys) ─────────────────────────────────────
    if (!razorpayOrder || !razorpayKeyId) {
      toast.success('Enrollment registered! Our team will contact you shortly.')
      navigate(`/academy-enrollment/${enrollment.id}`)
      return
    }

    // ── Live Razorpay mode ────────────────────────────────────────────────────
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      toast.error('Payment gateway failed to load. Please refresh and try again.')
      return
    }

    const options = {
      key: razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'RajLaxmi Academy',
      description: course.title,
      image: getImageUrl(course.thumbnail),
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          await academyApi.verifyPayment(enrollment.id, response)
          toast.success('Payment successful! Welcome to the course.')
          navigate(`/academy-enrollment/${enrollment.id}`)
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment verification failed.')
          navigate(`/academy-enrollment/${enrollment.id}?status=failed`)
        }
      },
      prefill: {
        name: formData.studentName,
        email: formData.studentEmail,
        contact: formData.studentPhone,
      },
      theme: { color: '#1c1917' },
      modal: {
        ondismiss: async () => {
          await academyApi.paymentFailed(enrollment.id, { reason: 'modal_dismissed' }).catch(() => {})
          toast.error('Payment cancelled.')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', async (response) => {
      await academyApi.paymentFailed(enrollment.id, response.error).catch(() => {})
      toast.error(response.error?.description || 'Payment failed.')
      navigate(`/academy-enrollment/${enrollment.id}?status=failed`)
    })
    rzp.open()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white w-full max-w-lg p-8 shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900">
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 className="font-serif text-2xl text-stone-900 mb-1">Enroll in Course</h2>
        <p className="font-sans text-sm text-stone-500 mb-6">{course.title}</p>

        <div className="bg-stone-50 rounded p-4 mb-6 flex justify-between items-center">
          <span className="font-sans text-sm text-stone-600">Course Fee</span>
          <div className="text-right">
            <span className="font-serif text-xl text-stone-900">{formatPrice(course.finalPrice)}</span>
            {course.discountPercentage > 0 && (
              <p className="font-sans text-xs text-stone-400 line-through">{formatPrice(course.price)}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-2 font-semibold">Full Name *</label>
            <input
              {...register('studentName', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              className="w-full border-b border-stone-300 py-2 font-sans text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors bg-transparent"
              placeholder="Enter your full name"
            />
            {errors.studentName && <p className="mt-1 text-xs text-red-600 font-sans">{errors.studentName.message}</p>}
          </div>

          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-2 font-semibold">Email Address *</label>
            <input
              {...register('studentEmail', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email required' } })}
              type="email"
              className="w-full border-b border-stone-300 py-2 font-sans text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors bg-transparent"
              placeholder="your@email.com"
            />
            {errors.studentEmail && <p className="mt-1 text-xs text-red-600 font-sans">{errors.studentEmail.message}</p>}
          </div>

          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-2 font-semibold">Phone Number *</label>
            <input
              {...register('studentPhone', { required: 'Phone is required', minLength: { value: 7, message: 'Valid phone required' } })}
              type="tel"
              className="w-full border-b border-stone-300 py-2 font-sans text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors bg-transparent"
              placeholder="+91 98765 43210"
            />
            {errors.studentPhone && <p className="mt-1 text-xs text-red-600 font-sans">{errors.studentPhone.message}</p>}
          </div>

          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-2 font-semibold">Message (Optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full border-b border-stone-300 py-2 font-sans text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors bg-transparent resize-none"
              placeholder="Any questions or special requirements..."
            />
          </div>

          <motion.button
            type="submit"
            disabled={enrollMutation.isPending}
            className="w-full mt-2 bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {enrollMutation.isPending ? 'Processing...' : `Pay ${formatPrice(course.finalPrice)}`}
          </motion.button>

          <p className="text-center font-sans text-[10px] text-stone-400 uppercase tracking-wider mt-2">
            Secured by Razorpay · No cancellations after payment
          </p>
        </form>
      </motion.div>
    </div>
  )
}

export default function AcademyDetailPage() {
  const { slug } = useParams()
  const [activeImg, setActiveImg] = useState(0)
  const [enrollOpen, setEnrollOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['academy-course', slug],
    queryFn: () => academyApi.getBySlug(slug),
    enabled: !!slug,
  })

  if (isLoading) return <div className="flex justify-center py-48"><Loader size="lg" /></div>

  const course = data?.data
  const related = course?.related || []

  if (!course) return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-48 text-center">
      <p className="font-serif text-2xl text-stone-500 mb-6">Course not found</p>
      <Link to="/academy" className="font-sans text-xs uppercase tracking-widest text-amber-700 hover:underline">← Back to Academy</Link>
    </div>
  )

  const images = [course.thumbnail, ...(course.gallery || [])].filter(Boolean)
  const benefits = Array.isArray(course.benefits) ? course.benefits : []
  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : []

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="h-80 md:h-[480px] overflow-hidden bg-stone-200">
          {images[activeImg] && (
            <motion.img
              key={activeImg}
              src={getImageUrl(images[activeImg])}
              alt={course.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-6 md:px-12">
          <Link to="/academy" className="inline-flex items-center gap-1 font-sans text-xs text-white/70 uppercase tracking-widest hover:text-white transition-colors mb-4">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Academy
          </Link>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-3">{course.title}</h1>
          {course.instructor && (
            <p className="font-sans text-sm text-white/70">by {course.instructor}</p>
          )}
        </div>
      </section>

      {/* Gallery thumbnails */}
      {images.length > 1 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${activeImg === i ? 'border-stone-900' : 'border-transparent hover:border-stone-300'}`}
            >
              <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <h2 className="font-serif text-3xl text-stone-900 mb-5">About This Course</h2>
              <p className="font-sans text-stone-600 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div>
                <h2 className="font-serif text-3xl text-stone-900 mb-5">What You'll Learn</h2>
                <ul className="space-y-3">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5 flex-shrink-0">check_circle</span>
                      <span className="font-sans text-stone-600">{typeof b === 'string' ? b : b.text || b.item || String(b)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <div>
                <h2 className="font-serif text-3xl text-stone-900 mb-5">Curriculum</h2>
                <div className="space-y-3">
                  {curriculum.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 border border-stone-100 p-4">
                      <span className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center font-sans text-xs font-bold text-stone-600 flex-shrink-0">{i + 1}</span>
                      <span className="font-sans text-stone-700">{typeof item === 'string' ? item : item.title || item.topic || String(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certification */}
            {course.certification && (
              <div className="bg-amber-50 border border-amber-100 p-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-2xl text-amber-600 flex-shrink-0">workspace_premium</span>
                  <div>
                    <h3 className="font-serif text-lg text-stone-900 mb-2">Certification</h3>
                    <p className="font-sans text-sm text-stone-600">{course.certification}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky enrollment card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 p-8 sticky top-28">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-sm text-stone-400">schedule</span>
                <span className="font-sans text-sm text-stone-500">{course.duration}</span>
              </div>

              <div className="mb-6">
                <span className="font-serif text-3xl text-stone-900">{formatPrice(course.finalPrice)}</span>
                {course.discountPercentage > 0 && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-sans text-base text-stone-400 line-through">{formatPrice(course.price)}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 font-sans text-xs font-semibold">{Math.round(course.discountPercentage)}% OFF</span>
                  </div>
                )}
              </div>

              <motion.button
                onClick={() => setEnrollOpen(true)}
                className="block w-full text-center bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300 mb-3"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Enroll Now
              </motion.button>

              <div className="mt-8 pt-6 border-t border-stone-100 space-y-3">
                {[
                  ['schedule', 'Duration: ' + course.duration],
                  ['workspace_premium', 'Certificate on completion'],
                  ['groups', 'Small batch sizes'],
                  ['support_agent', 'Lifetime support'],
                  ['lock', 'Secured payment via Razorpay'],
                ].map(([icon, text]) => (
                  <div key={icon} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm text-amber-600">{icon}</span>
                    <span className="font-sans text-xs text-stone-600">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-stone-100">
          <h2 className="font-serif text-3xl text-stone-900 mb-10">Other Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((c) => (
              <Link key={c.id} to={`/academy/${c.slug}`} className="group bg-white border border-stone-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="aspect-video overflow-hidden bg-stone-50">
                  <img src={getImageUrl(c.thumbnail)} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg text-stone-900 group-hover:text-amber-700 transition-colors mb-2 line-clamp-2">{c.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-sm text-stone-500">{c.duration}</span>
                    <span className="font-serif text-base text-stone-900">{formatPrice(c.finalPrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Enrollment Modal */}
      <AnimatePresence>
        {enrollOpen && <EnrollModal course={course} onClose={() => setEnrollOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
