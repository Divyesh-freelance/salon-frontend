import { createContext, useContext, useState, useReducer } from 'react'

const BookingContext = createContext(null)

const initialState = {
  step: 1,
  service: null,
  stylist: null,
  date: null,
  timeSlot: null,
  customerDetails: null,
  bookingId: null,
}

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_SERVICE':
      return { ...state, service: action.payload, stylist: null, date: null, timeSlot: null }
    case 'SET_STYLIST':
      return { ...state, stylist: action.payload, date: null, timeSlot: null }
    case 'SET_DATE':
      return { ...state, date: action.payload, timeSlot: null }
    case 'SET_TIME_SLOT':
      return { ...state, timeSlot: action.payload }
    case 'SET_CUSTOMER_DETAILS':
      return { ...state, customerDetails: action.payload }
    case 'SET_BOOKING_ID':
      return { ...state, bookingId: action.payload }
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 6) }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) }
    case 'GO_TO_STEP':
      return { ...state, step: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const setService = (service) => dispatch({ type: 'SET_SERVICE', payload: service })
  const setStylist = (stylist) => dispatch({ type: 'SET_STYLIST', payload: stylist })
  const setDate = (date) => dispatch({ type: 'SET_DATE', payload: date })
  const setTimeSlot = (slot) => dispatch({ type: 'SET_TIME_SLOT', payload: slot })
  const setCustomerDetails = (details) => dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details })
  const setBookingId = (id) => dispatch({ type: 'SET_BOOKING_ID', payload: id })
  const nextStep = () => dispatch({ type: 'NEXT_STEP' })
  const prevStep = () => dispatch({ type: 'PREV_STEP' })
  const goToStep = (step) => dispatch({ type: 'GO_TO_STEP', payload: step })
  const reset = () => dispatch({ type: 'RESET' })

  const totalAmount = state.service?.price || 0

  return (
    <BookingContext.Provider
      value={{
        ...state,
        totalAmount,
        setService,
        setStylist,
        setDate,
        setTimeSlot,
        setCustomerDetails,
        setBookingId,
        nextStep,
        prevStep,
        goToStep,
        reset,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
