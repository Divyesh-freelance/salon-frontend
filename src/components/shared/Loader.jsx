export default function Loader({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border border-stone-300 border-t-stone-900 rounded-full animate-spin`}
      />
    </div>
  )
}
