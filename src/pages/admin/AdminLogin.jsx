import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password required'),
})

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard')
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl tracking-widest text-stone-900 uppercase mb-2">RajLaxmi</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-stone-500">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 p-10">
          <h2 className="font-serif text-2xl mb-8">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-3 font-semibold">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@rajlaxmi.com"
                className="ghost-input font-sans text-base"
                autoComplete="email"
              />
              {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-3 font-semibold">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="ghost-input font-sans text-base"
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stone-900 text-stone-50 py-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-amber-700 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="font-sans text-xs text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-wider">
            ← Back to Website
          </a>
        </div>
      </motion.div>
    </div>
  )
}
