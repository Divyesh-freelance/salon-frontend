import { format, parseISO } from 'date-fns'

export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE, MMMM d, yyyy')
}

export const formatDateShort = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export const formatTime = (time) => {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/600x800?text=Image'
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_UPLOAD_URL || ''
  return `${base}${url}`
}

export const getDurationText = (minutes) => {
  if (minutes < 60) return `${minutes} Minutes`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h} Hour${h > 1 ? 's' : ''}`
}

export const getStatusColor = (status) => {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-stone-100 text-stone-800'
}
