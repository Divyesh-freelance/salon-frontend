export default function EmptyState({ title = 'Nothing here yet', message = '', icon = '◇' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-4xl text-stone-300 mb-6">{icon}</span>
      <h3 className="font-serif text-xl text-stone-900 mb-2">{title}</h3>
      {message && <p className="font-sans text-sm text-stone-500 max-w-xs">{message}</p>}
    </div>
  )
}
