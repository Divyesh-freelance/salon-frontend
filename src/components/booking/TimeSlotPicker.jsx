import { motion } from 'framer-motion'

export default function TimeSlotPicker({ slots, selected, onSelect }) {
  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-sans text-sm text-stone-500">No available slots for this date. Please choose another date or artisan.</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="font-sans text-xs uppercase tracking-widest text-stone-500 mb-6 font-semibold">
        Available Times
      </h4>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot, i) => (
          <motion.button
            key={slot.time}
            onClick={() => slot.available && onSelect(slot)}
            disabled={!slot.available}
            className={`py-4 border font-sans text-xs uppercase tracking-widest transition-all duration-200 ${
              !slot.available
                ? 'border-stone-200 text-stone-300 cursor-not-allowed opacity-40'
                : selected?.time === slot.time
                ? 'border-stone-900 bg-stone-900 text-stone-50'
                : 'border-stone-200 hover:border-stone-900 hover:text-stone-900'
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: slot.available ? 1 : 0.4, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            whileHover={slot.available && selected?.time !== slot.time ? { scale: 1.02 } : {}}
            whileTap={slot.available ? { scale: 0.97 } : {}}
          >
            {slot.display}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
