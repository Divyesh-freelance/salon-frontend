import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { academyApi } from '../../api/services'
import { formatPrice, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'
import EmptyState from '../../components/shared/EmptyState'

function CourseCard({ course, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-stone-100 overflow-hidden group hover:shadow-md transition-shadow duration-300"
    >
      <Link to={`/academy/${course.slug}`} className="block">
        <div className="aspect-video overflow-hidden bg-stone-50 relative">
          <img
            src={getImageUrl(course.thumbnail)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {course.featured && (
            <span className="absolute top-3 left-3 bg-amber-600 text-white px-2 py-1 font-sans text-xs font-semibold uppercase tracking-wider">
              Featured
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 px-3 py-1.5">
            <span className="material-symbols-outlined text-sm text-amber-700">schedule</span>
            <span className="font-sans text-xs font-semibold text-stone-700">{course.duration}</span>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/academy/${course.slug}`}>
          <h3 className="font-serif text-xl text-stone-900 mb-2 leading-snug hover:text-amber-700 transition-colors group-hover:text-amber-700">
            {course.title}
          </h3>
        </Link>

        {course.instructor && (
          <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-3">
            by {course.instructor}
          </p>
        )}

        {course.shortDesc && (
          <p className="font-sans text-sm text-stone-500 line-clamp-2 mb-4">{course.shortDesc}</p>
        )}

        <div className="flex items-center gap-3 mb-6">
          <span className="font-serif text-xl text-stone-900">{formatPrice(course.finalPrice)}</span>
          {course.discountPercentage > 0 && (
            <>
              <span className="font-sans text-sm text-stone-400 line-through">{formatPrice(course.price)}</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 font-sans text-xs font-semibold">
                {Math.round(course.discountPercentage)}% OFF
              </span>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            to={`/academy/${course.slug}`}
            className="flex-1 text-center bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
          >
            View Details
          </Link>
          <Link
            to="/contact"
            className="px-4 py-3 border border-stone-200 font-sans text-xs uppercase tracking-wider text-stone-600 hover:border-stone-900 transition-all duration-300"
          >
            Enquire
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function AcademyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['academy', { active: 'true', limit: 50 }],
    queryFn: () => academyApi.getAll({ active: 'true', limit: 50 }),
  })

  const courses = data?.data || []

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            RajLaxmi Academy
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
            Learn from the <br />best in beauty.
          </h1>
          <p className="font-sans text-lg text-stone-600 max-w-xl leading-relaxed">
            Professional beauty training courses designed to launch or elevate your career. Learn makeup artistry, hair styling, skin care, and more from our experienced instructors.
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-lg border-t border-stone-200 pt-12"
        >
          {[['500+', 'Students Trained'], ['10+', 'Expert Courses'], ['100%', 'Certification']].map(([num, label]) => (
            <div key={label}>
              <p className="font-serif text-3xl text-amber-700 mb-1">{num}</p>
              <p className="font-sans text-xs text-stone-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Courses Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-serif text-4xl text-stone-900">Our Courses</h2>
          <span className="font-sans text-xs text-stone-400 uppercase tracking-widest">{courses.length} courses available</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader size="lg" /></div>
        ) : courses.length === 0 ? (
          <EmptyState title="No courses available" message="Check back soon — new courses are coming." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
        <div className="py-20 border-y border-stone-200 text-center">
          <h2 className="font-serif text-4xl mb-6">Ready to start your journey?</h2>
          <p className="font-sans text-stone-500 max-w-md mx-auto mb-10">
            Have questions about our courses or want to enrol? Get in touch with our academy team.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-stone-900 text-white px-12 py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all duration-300"
          >
            Contact the Academy
          </Link>
        </div>
      </section>
    </>
  )
}
