import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { settingsApi } from '../../api/services'
import Loader from '../../components/shared/Loader'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DEFAULT_HOURS = { open: '09:00', close: '19:00', isOpen: true }

export default function AdminSettings() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  })

  const settings = data?.data

  const { register, handleSubmit, reset, watch } = useForm()

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Error saving settings'),
  })

  if (isLoading) return <Loader size="lg" className="py-32" />

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Settings</h1>
        <p className="font-sans text-sm text-stone-500 mt-1">Manage your studio details and configuration</p>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8">

        {/* Salon Info */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-6">Studio Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="admin-label">Studio Name</label>
              <input {...register('salonName')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Tagline</label>
              <input {...register('tagline')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Phone</label>
              <input {...register('phone')} className="admin-input" type="tel" />
            </div>
            <div>
              <label className="admin-label">Email</label>
              <input {...register('email')} className="admin-input" type="email" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Address</label>
              <input {...register('address')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Website</label>
              <input {...register('website')} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Slot Interval (minutes)</label>
              <input {...register('slotInterval', { valueAsNumber: true })} type="number" className="admin-input" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-6">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="admin-label">Instagram URL</label>
              <input {...register('instagramUrl')} className="admin-input" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="admin-label">Facebook URL</label>
              <input {...register('facebookUrl')} className="admin-input" placeholder="https://facebook.com/..." />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white border border-stone-200 p-8">
          <h2 className="font-serif text-xl mb-6">Working Hours</h2>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-stone-50">
                <label className="font-sans text-sm font-medium capitalize text-stone-900">{day}</label>
                <input
                  {...register(`workingHours.${day}.open`)}
                  type="time"
                  className="border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900 outline-none"
                />
                <input
                  {...register(`workingHours.${day}.close`)}
                  type="time"
                  className="border border-stone-200 px-3 py-2 font-sans text-sm focus:border-stone-900 outline-none"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...register(`workingHours.${day}.isOpen`)} type="checkbox" className="w-4 h-4" />
                  <span className="font-sans text-sm text-stone-700">Open</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-stone-900 text-white px-12 py-4 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
