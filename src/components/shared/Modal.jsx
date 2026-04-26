import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${sizes[size]} bg-white shadow-2xl overflow-hidden`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {title && (
              <div className="flex justify-between items-center px-8 py-6 border-b border-stone-100">
                <h2 className="font-serif text-xl text-stone-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}
            <div className="p-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
