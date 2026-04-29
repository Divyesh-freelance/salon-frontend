import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { academyApi } from '../../api/services'
import { formatPrice, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'
import { format } from 'date-fns'

export default function AcademyEnrollmentPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isFailed = searchParams.get('status') === 'failed'

  const { data, isLoading } = useQuery({
    queryKey: ['academy-enrollment', id],
    queryFn: () => academyApi.getEnrollmentById(id),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-48"><Loader size="lg" /></div>

  const enrollment = data?.data
  if (!enrollment) return (
    <div className="max-w-3xl mx-auto px-6 pt-48 text-center">
      <p className="font-serif text-2xl text-stone-500 mb-6">Enrollment not found</p>
      <Link to="/academy" className="font-sans text-xs uppercase tracking-widest text-amber-700 hover:underline">← Back to Academy</Link>
    </div>
  )

  const isPaid = enrollment.paymentStatus === 'paid'
  const isPending = enrollment.paymentStatus === 'pending'
  const statusFailed = isFailed || enrollment.paymentStatus === 'failed'

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isPaid ? 'bg-green-100' : statusFailed ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <span className={`material-symbols-outlined text-4xl ${
              isPaid ? 'text-green-600' : statusFailed ? 'text-red-500' : 'text-amber-600'
            }`}>
              {isPaid ? 'check_circle' : statusFailed ? 'cancel' : 'schedule'}
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-stone-900 mb-3">
            {isPaid ? 'Enrollment Confirmed!' : statusFailed ? 'Payment Failed' : 'Enrollment Registered'}
          </h1>
          <p className="font-sans text-stone-500 max-w-md mx-auto">
            {isPaid
              ? 'Your payment was successful. Welcome aboard — our team will reach out with course details.'
              : statusFailed
              ? 'Your payment could not be processed. Please try enrolling again or contact us.'
              : 'Your enrollment has been registered. Our team will contact you shortly to complete the process.'}
          </p>
        </div>

        {/* Enrollment Details Card */}
        <div className="border border-stone-200 bg-white p-8 mb-8">
          {/* Course info */}
          {enrollment.course && (
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-stone-100">
              {enrollment.course.thumbnail && (
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-stone-100">
                  <img src={getImageUrl(enrollment.course.thumbnail)} alt={enrollment.course.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-stone-400 mb-1">Course</p>
                <p className="font-serif text-xl text-stone-900">{enrollment.course.title}</p>
                <p className="font-sans text-sm text-stone-500">{enrollment.course.duration}</p>
              </div>
            </div>
          )}

          {/* Details rows */}
          {[
            { label: 'Enrollment No.', value: enrollment.enrollmentNumber },
            { label: 'Student Name', value: enrollment.studentName },
            { label: 'Email', value: enrollment.studentEmail },
            { label: 'Phone', value: enrollment.studentPhone },
            { label: 'Amount', value: formatPrice(enrollment.amount) },
            { label: 'Payment Status', value: enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1) },
            { label: 'Date', value: format(new Date(enrollment.createdAt), 'dd MMM yyyy') },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-stone-50 last:border-0">
              <span className="font-sans text-sm text-stone-500">{label}</span>
              <span className={`font-sans text-sm font-medium ${
                label === 'Payment Status'
                  ? isPaid ? 'text-green-600' : statusFailed ? 'text-red-500' : 'text-amber-600'
                  : 'text-stone-900'
              }`}>{value}</span>
            </div>
          ))}

          {/* Certificate link (shown once admin uploads it) */}
          {enrollment.certificateLink && (
            <div className="mt-6 bg-amber-50 border border-amber-100 p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-2xl text-amber-600">workspace_premium</span>
              <div className="flex-1">
                <p className="font-sans text-sm font-semibold text-stone-900 mb-1">Your Certificate is Ready!</p>
                <a
                  href={enrollment.certificateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs uppercase tracking-widest text-amber-700 hover:underline"
                >
                  Download Certificate →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/academy"
            className="flex-1 text-center border border-stone-200 py-4 font-sans text-xs uppercase tracking-widest text-stone-700 hover:border-stone-900 transition-all"
          >
            Browse More Courses
          </Link>
          {statusFailed && (
            <Link
              to={`/academy/${enrollment.course?.slug}`}
              className="flex-1 text-center bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
            >
              Try Again
            </Link>
          )}
          {isPaid && (
            <Link
              to="/"
              className="flex-1 text-center bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
            >
              Back to Home
            </Link>
          )}
        </div>
      </motion.div>
    </main>
  )
}
