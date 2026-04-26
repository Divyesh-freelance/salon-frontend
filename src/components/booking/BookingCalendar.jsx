import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth, isSameDay,
  isToday, isBefore, startOfDay,
} from 'date-fns'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// disabledDayOfWeek: JS day-of-week numbers the stylist is off (0=Sun … 6=Sat)
// disabledDates: specific Date objects to disable (e.g. public holidays)
export default function BookingCalendar({ selected, onSelect, disabledDates = [], disabledDayOfWeek = [] }) {
  const [viewDate, setViewDate] = useState(new Date())

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const isPast = (d) => isBefore(startOfDay(d), startOfDay(new Date()))
  const isOffDay = (d) => disabledDayOfWeek.includes(d.getDay())
  const isDisabled = (d) => isPast(d) || isOffDay(d) || disabledDates.some((dd) => isSameDay(dd, d))

  return (
    <div className="mb-12">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-8">
        <AnimatePresence mode="wait">
          <motion.h3
            key={format(viewDate, 'MMMM yyyy')}
            className="font-serif text-xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {format(viewDate, 'MMMM yyyy')}
          </motion.h3>
        </AnimatePresence>
        <div className="flex gap-4">
          <motion.button
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="p-2 border border-stone-200 hover:border-stone-900 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </motion.button>
          <motion.button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="p-2 border border-stone-200 hover:border-stone-900 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </motion.button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {DAYS.map((d) => (
          <div key={d} className="font-sans text-[10px] uppercase text-stone-400 pb-4">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(viewDate, 'yyyy-MM')}
          className="grid grid-cols-7 gap-2 text-center"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
        >
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewDate)
            const isSelected = selected && isSameDay(day, selected)
            const disabled = isDisabled(day)
            const today = isToday(day)

            return (
              <motion.button
                key={day.toISOString()}
                onClick={() => !disabled && inMonth && onSelect(day)}
                disabled={disabled || !inMonth}
                className={`h-12 flex items-center justify-center font-sans text-sm transition-all duration-200 ${
                  !inMonth
                    ? 'text-stone-300 cursor-default'
                    : disabled
                    ? 'text-stone-300 cursor-not-allowed'
                    : isSelected
                    ? 'bg-stone-900 text-white font-bold'
                    : today
                    ? 'border border-amber-500 text-amber-700 font-semibold hover:bg-stone-100'
                    : 'hover:bg-stone-100 text-stone-900 cursor-pointer'
                }`}
                whileHover={!disabled && inMonth ? { scale: 1.05 } : {}}
                whileTap={!disabled && inMonth ? { scale: 0.95 } : {}}
              >
                {format(day, 'd')}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
