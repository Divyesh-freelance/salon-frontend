import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { settingsApi } from '../api/services'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/bookings', icon: 'calendar_month', label: 'Bookings' },
  { to: '/admin/services', icon: 'spa', label: 'Services' },
  { to: '/admin/stylists', icon: 'person', label: 'Stylists' },
  { to: '/admin/products', icon: 'inventory_2', label: 'Products' },
  { to: '/admin/orders', icon: 'shopping_bag', label: 'Orders' },
  { to: '/admin/academy', icon: 'school', label: 'Academy' },
  { to: '/admin/discounts', icon: 'local_offer', label: 'Discounts' },
  { to: '/admin/gallery', icon: 'photo_library', label: 'Gallery' },
  { to: '/admin/social-videos', icon: 'smart_display', label: 'Social Videos' },
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 1000 * 60 * 30,
  })
  const logoImage = settingsData?.data?.logoImage || null
  const salonName = settingsData?.data?.salonName || 'RajLaxmi'

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans">
      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-full bg-stone-900 text-stone-50 z-40 flex flex-col"
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-stone-800">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt={salonName}
                    className="h-7 w-auto object-contain max-w-[140px]"
                  />
                ) : (
                  <span className="font-serif tracking-widest text-sm uppercase text-stone-50">
                    {salonName.split(' ')[0]}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-stone-400 hover:text-stone-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:text-stone-50 hover:bg-stone-800'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium tracking-wide"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">{user?.name?.[0] || 'A'}</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold text-stone-50 truncate">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-stone-500 truncate uppercase tracking-wider">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 text-stone-500 hover:text-stone-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">logout</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 256 }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl text-stone-900">Admin Panel</h1>
          <a href="/" target="_blank" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm">
            <span className="material-symbols-outlined text-base">open_in_new</span>
            View Site
          </a>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
