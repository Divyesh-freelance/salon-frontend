import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { servicesApi, stylistsApi, bookingsApi } from '../../api/services'
import { useBooking } from '../../context/BookingContext'
import BookingStepper from '../../components/booking/BookingStepper'
import BookingCalendar from '../../components/booking/BookingCalendar'
import TimeSlotPicker from '../../components/booking/TimeSlotPicker'
import AppointmentSummary from '../../components/booking/AppointmentSummary'
import Loader from '../../components/shared/Loader'
import { getImageUrl, formatPrice, getDurationText } from '../../utils/format'

const customerSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(7, 'Phone number required'),
  notes: z.string().optional(),
})

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
}

export default function BookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const booking = useBooking()
  const { step, service, stylist, date, timeSlot, setService, setStylist, setDate, setTimeSlot, nextStep, prevStep, setCustomerDetails, setBookingId } = booking

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
  })

  // Prefetch serviceId from navigation state
  const preselectedServiceId = location.state?.serviceId

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', { active: 'true', limit: 50 }],
    queryFn: () => servicesApi.getAll({ active: 'true', limit: 50 }),
  })

  const { data: stylistsData, isLoading: stylistsLoading } = useQuery({
    queryKey: ['stylists-for-service', service?.id],
    queryFn: () => stylistsApi.getAll({ serviceId: service?.id, active: 'true', limit: 50 }),
    enabled: !!service?.id,
  })

  // Days of week the selected stylist doesn't work (0=Sun … 6=Sat)
  const offDays = stylist?.availability
    ? stylist.availability.filter((a) => a.isOff).map((a) => a.dayOfWeek)
    : []

  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', stylist?.id, service?.id, date ? format(date, 'yyyy-MM-dd') : null],
    queryFn: () => bookingsApi.getAvailability({
      stylistId: stylist?.id,
      serviceId: service?.id,
      date: format(date, 'yyyy-MM-dd'),
    }),
    enabled: !!stylist && !!service && !!date,
  })

  const slots = availabilityData?.data?.slots || []

  const createBookingMutation = useMutation({
    mutationFn: (data) => bookingsApi.create(data),
    onSuccess: (res) => {
      setBookingId(res.data.id)
      toast.success('Appointment confirmed!')
      navigate(`/appointment-confirmation/${res.data.id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    },
  })

  const onSubmitDetails = (data) => {
    setCustomerDetails(data)
    nextStep()
  }

  const onConfirmBooking = () => {
    if (!service || !stylist || !date || !timeSlot || !booking.customerDetails) return
    createBookingMutation.mutate({
      serviceId: service.id,
      stylistId: stylist.id,
      customerName: booking.customerDetails.customerName,
      customerEmail: booking.customerDetails.customerEmail,
      customerPhone: booking.customerDetails.customerPhone,
      notes: booking.customerDetails.notes || '',
      appointmentDate: format(date, 'yyyy-MM-dd'),
      appointmentTime: timeSlot.time,
      discountId: booking.discount?.id || null,
    })
  }

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
      <BookingStepper currentStep={step} />

      <div className="grid grid-cols-12 gap-8 md:gap-12">
        {/* ─── Left/Center Panel ─────────────────────────────────────────── */}
        <div className="col-span-12 md:col-span-9">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Select Service ─────────────────────────────── */}
            {step === 1 && (
              <motion.section
                key="step-1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-serif text-3xl mb-8">Select Service</h2>
                {servicesLoading ? (
                  <Loader size="lg" className="py-20" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicesData?.data?.map((s) => (
                      <motion.div
                        key={s.id}
                        onClick={() => { setService(s); nextStep() }}
                        className={`group border p-6 cursor-pointer transition-all duration-300 ${
                          service?.id === s.id
                            ? 'border-stone-900 bg-surface-container-lowest'
                            : 'border-stone-200 hover:border-stone-900'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-stone-100">
                            <img src={getImageUrl(s.image)} alt={s.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-serif text-lg">{s.title}</h3>
                              <span className="font-sans text-sm text-amber-700 font-semibold ml-2 flex-shrink-0">
                                {formatPrice(s.price)}
                              </span>
                            </div>
                            <p className="font-sans text-sm text-stone-500 mb-3 line-clamp-2">{s.shortDesc || s.description}</p>
                            <span className="font-sans text-xs text-stone-400 uppercase tracking-wider">
                              {getDurationText(s.duration)}
                            </span>
                          </div>
                        </div>
                        {service?.id === s.id && (
                          <div className="flex items-center gap-2 text-stone-900 mt-4">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="font-sans text-xs uppercase tracking-widest font-semibold">Selected</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* ── Step 2: Select Artisan ─────────────────────────────── */}
            {step === 2 && (
              <motion.section
                key="step-2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={prevStep} className="text-stone-400 hover:text-stone-900 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h2 className="font-serif text-3xl">Choose Artisan</h2>
                </div>
                {stylistsLoading ? (
                  <Loader size="lg" className="py-20" />
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {stylistsData?.data?.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="font-sans text-stone-500">All our artisans are available for this service.</p>
                        <button
                          onClick={() => {
                            // Use first available
                            if (stylistsData?.data?.[0]) {
                              setStylist(stylistsData.data[0])
                              nextStep()
                            }
                          }}
                          className="mt-4 bg-stone-900 text-white px-8 py-3 font-sans text-xs uppercase tracking-widest"
                        >
                          Continue
                        </button>
                      </div>
                    ) : (
                      (stylistsData?.data || []).map((s) => (
                        <motion.div
                          key={s.id}
                          onClick={() => { setStylist(s); setDate(null); nextStep() }}
                          className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-300 ${
                            stylist?.id === s.id
                              ? 'border-stone-900 bg-surface-container-lowest'
                              : 'border-stone-200 hover:border-stone-900'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <img
                            src={getImageUrl(s.image)}
                            alt={s.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="font-serif text-lg">{s.name}</p>
                            <p className="font-sans text-xs text-stone-500 uppercase tracking-wider">{s.title}</p>
                            <p className="font-sans text-sm text-stone-500 mt-1">{s.specialization}</p>
                          </div>
                          {stylist?.id === s.id && (
                            <span className="material-symbols-outlined text-stone-900">check</span>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </motion.section>
            )}

            {/* ── Step 3: Schedule ───────────────────────────────────── */}
            {step === 3 && (
              <motion.section
                key="step-3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={prevStep} className="text-stone-400 hover:text-stone-900 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h2 className="font-serif text-3xl">Select Schedule</h2>
                </div>

                <BookingCalendar
                  selected={date}
                  onSelect={setDate}
                  disabledDayOfWeek={offDays}
                />

                {date && (
                  <div>
                    {slotsLoading ? (
                      <Loader className="py-8" />
                    ) : (
                      <TimeSlotPicker
                        slots={slots}
                        selected={timeSlot}
                        onSelect={(slot) => { setTimeSlot(slot); nextStep() }}
                      />
                    )}
                  </div>
                )}
              </motion.section>
            )}

            {/* ── Step 4: Customer Details ───────────────────────────── */}
            {step === 4 && (
              <motion.section
                key="step-4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={prevStep} className="text-stone-400 hover:text-stone-900 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h2 className="font-serif text-3xl">Your Details</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-8 max-w-lg">
                  {[
                    { name: 'customerName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
                    { name: 'customerEmail', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                    { name: 'customerPhone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
                  ].map(({ name, label, type, placeholder }) => (
                    <div key={name}>
                      <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-3 font-semibold">
                        {label}
                      </label>
                      <input
                        {...register(name)}
                        type={type}
                        placeholder={placeholder}
                        className="ghost-input font-sans text-base text-stone-900"
                      />
                      {errors[name] && (
                        <p className="mt-2 text-xs text-red-600 font-sans">{errors[name].message}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest text-stone-500 block mb-3 font-semibold">
                      Special Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      placeholder="Any special requests or notes for your artisan..."
                      className="ghost-input font-sans text-base text-stone-900 resize-none"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full bg-stone-900 text-stone-50 py-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-amber-700 transition-all duration-300 mt-4"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Review Appointment
                  </motion.button>
                </form>
              </motion.section>
            )}

            {/* ── Step 5: Final Confirmation ─────────────────────────── */}
            {step === 5 && (
              <motion.section
                key="step-5"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={prevStep} className="text-stone-400 hover:text-stone-900 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h2 className="font-serif text-3xl">Review & Confirm</h2>
                </div>

                {booking.customerDetails && (
                  <div className="space-y-4 max-w-lg mb-8">
                    <h3 className="font-sans text-xs uppercase tracking-widest text-stone-500 mb-4 font-semibold">
                      Your Information
                    </h3>
                    {[
                      { label: 'Name', value: booking.customerDetails.customerName },
                      { label: 'Email', value: booking.customerDetails.customerEmail },
                      { label: 'Phone', value: booking.customerDetails.customerPhone },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-3 border-b border-stone-100">
                        <span className="font-sans text-sm text-stone-500">{label}</span>
                        <span className="font-sans text-sm font-medium text-stone-900">{value}</span>
                      </div>
                    ))}
                    {booking.customerDetails.notes && (
                      <div className="py-3 border-b border-stone-100">
                        <span className="font-sans text-sm text-stone-500 block mb-1">Notes</span>
                        <span className="font-sans text-sm text-stone-900">{booking.customerDetails.notes}</span>
                      </div>
                    )}
                  </div>
                )}

                <motion.button
                  onClick={onConfirmBooking}
                  disabled={createBookingMutation.isPending}
                  className="bg-stone-900 text-stone-50 px-12 py-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] hover:bg-amber-700 transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Appointment'}
                </motion.button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Right: Summary ─────────────────────────────────────────────── */}
        <div className="col-span-12 md:col-span-3">
          <AppointmentSummary
            booking={booking}
            onConfirm={step === 5 ? onConfirmBooking : null}
            isSubmitting={createBookingMutation.isPending}
          />
        </div>
      </div>
    </main>
  )
}
