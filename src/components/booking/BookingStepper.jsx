import { motion } from 'framer-motion'

const steps = [
  { num: 1, label: 'Service' },
  { num: 2, label: 'Artisan' },
  { num: 3, label: 'Schedule' },
  { num: 4, label: 'Details' },
  { num: 5, label: 'Confirm' },
]

export default function BookingStepper({ currentStep }) {
  return (
    <div className="w-full flex items-center justify-between mb-16 relative">
      {/* Track line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-stone-200 -z-10" />

      {steps.map((step, i) => {
        const isActive = step.num === currentStep
        const isCompleted = step.num < currentStep
        const isLast = i === steps.length - 1

        return (
          <div
            key={step.num}
            className={`flex items-center gap-3 bg-surface ${isLast ? 'pl-6' : i === 0 ? 'pr-6' : 'px-6'}`}
          >
            <motion.span
              className={`w-8 h-8 rounded-full border flex items-center justify-center font-sans text-xs font-semibold transition-all duration-500 ${
                isCompleted
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : isActive
                  ? 'border-stone-900 text-stone-900 bg-secondary-container'
                  : 'border-stone-300 text-stone-400'
              }`}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-sm">check</span>
              ) : (
                step.num
              )}
            </motion.span>
            <span
              className={`font-sans text-xs uppercase tracking-widest font-semibold transition-colors duration-300 hidden sm:block ${
                isActive ? 'text-stone-900' : isCompleted ? 'text-stone-600' : 'text-stone-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
