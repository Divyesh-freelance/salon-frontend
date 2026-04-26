import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../../api/services'

export default function ContactPage() {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, staleTime: 1000 * 60 * 30 })
  const settings = data?.data || {}

  const days = settings.workingHours
    ? Object.entries(settings.workingHours)
    : []

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-section-gap">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            Get In Touch
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-8">Visit The Studio</h1>
          <p className="font-sans text-lg text-stone-600 leading-relaxed">
            We would love to hear from you. Book an appointment or simply come say hello.
          </p>
        </motion.div>
      </section>

      {/* Contact Info + Hours */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap grid grid-cols-12 gap-12">
        <motion.div
          className="col-span-12 md:col-span-5"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl mb-8">Contact Details</h2>
          <div className="space-y-8">
            {[
              { icon: 'location_on', label: 'Address', value: settings.address || '42 Mayfair Lane, Mumbai' },
              { icon: 'phone', label: 'Phone', value: settings.phone || '+91 98765 43210' },
              { icon: 'email', label: 'Email', value: settings.email || 'hello@rajlaxmi.com' },
              { icon: 'language', label: 'Website', value: settings.website || 'www.rajlaxmi.com' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="material-symbols-outlined text-amber-700 mt-1">{icon}</span>
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-stone-500 mb-1">{label}</p>
                  <p className="font-sans text-stone-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social */}
          <div className="mt-12">
            <h3 className="font-serif text-xl mb-6">Follow Us</h3>
            <div className="flex gap-6">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer"
                  className="font-sans text-sm text-stone-500 hover:text-stone-900 transition-colors border-b border-stone-300 hover:border-stone-900 pb-1">
                  Instagram
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer"
                  className="font-sans text-sm text-stone-500 hover:text-stone-900 transition-colors border-b border-stone-300 hover:border-stone-900 pb-1">
                  Facebook
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hours */}
        <motion.div
          className="col-span-12 md:col-span-5 md:col-start-7"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="font-serif text-3xl mb-8">Studio Hours</h2>
          <div className="space-y-4">
            {days.length > 0 ? (
              days.map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="font-sans text-sm font-medium text-stone-900">{capitalize(day)}</span>
                  <span className="font-sans text-sm text-stone-500">
                    {hours.isOpen ? `${hours.open} – ${hours.close}` : 'Closed'}
                  </span>
                </div>
              ))
            ) : (
              ['Monday – Friday', 'Saturday', 'Sunday'].map((day, i) => (
                <div key={day} className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="font-sans text-sm font-medium text-stone-900">{day}</span>
                  <span className="font-sans text-sm text-stone-500">{i === 2 ? 'Closed' : i === 1 ? '10:00 – 18:00' : '09:00 – 19:00'}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-12 p-8 bg-secondary-container">
            <p className="font-sans text-sm text-stone-700 leading-relaxed">
              <strong className="font-semibold">Appointments are recommended.</strong> Walk-ins are welcome based on availability. For last-minute bookings, please call us directly.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  )
}
