import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../../api/services'

const navLinks = [
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/socials', label: 'Socials' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 1000 * 60 * 30,
  })
  const salonName = settingsData?.data?.salonName || 'RajLaxmi Makeup Studio'
  const logoImage = settingsData?.data?.logoImage || null

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-neutral-50 border-b border-stone-200 shadow-sm' : 'bg-neutral-50 border-b border-stone-200'
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-8 w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-300">
          {logoImage ? (
            <img
              src={logoImage}
              alt={salonName}
              className="h-8 md:h-10 w-auto object-contain max-w-[160px]"
            />
          ) : (
            <span className="text-lg md:text-2xl font-serif tracking-[0.2em] text-stone-900 uppercase hover:text-amber-700 transition-colors duration-500">
              {salonName.split(' ')[0]}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-serif tracking-tight text-base uppercase transition-colors duration-500 pb-1 ${
                  isActive
                    ? 'text-stone-900 border-b border-stone-900'
                    : 'text-stone-500 font-light hover:text-amber-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/booking')}
            className="hidden md:block bg-stone-900 text-stone-50 px-8 py-3 font-sans text-xs font-semibold uppercase tracking-[0.1em] hover:bg-amber-700 transition-all duration-300"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Now
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-stone-900 p-1"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-neutral-50 border-t border-stone-200 px-6 py-8 space-y-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block font-serif text-lg uppercase text-stone-900 hover:text-amber-600 transition-colors"
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { navigate('/booking'); setMenuOpen(false) }}
              className="w-full bg-stone-900 text-stone-50 py-4 font-sans text-xs font-semibold uppercase tracking-widest mt-4"
            >
              Book Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
