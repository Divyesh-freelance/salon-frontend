import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { academyApi } from '../../api/services'
import { formatPrice, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'

export default function AcademyDetailPage() {
  const { slug } = useParams()
  const [activeImg, setActiveImg] = useState(0)

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

          {/* Sticky booking card */}
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

              <Link
                to="/contact"
                className="block w-full text-center bg-stone-900 text-white py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300 mb-3"
              >
                Enquire Now
              </Link>
              <Link
                to="/contact"
                className="block w-full text-center border border-stone-200 py-4 font-sans text-xs uppercase tracking-widest text-stone-600 hover:border-stone-900 transition-all duration-300"
              >
                Apply for Admission
              </Link>

              <div className="mt-8 pt-6 border-t border-stone-100 space-y-3">
                {[['schedule', 'Duration: ' + course.duration], ['workspace_premium', 'Certificate on completion'], ['groups', 'Small batch sizes'], ['support_agent', 'Lifetime support']].map(([icon, text]) => (
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
    </>
  )
}
