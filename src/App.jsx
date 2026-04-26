import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'

// Public pages
import HomePage from './pages/public/HomePage'
import ServicesPage from './pages/public/ServicesPage'
import ServiceDetailPage from './pages/public/ServiceDetailPage'
import BookingPage from './pages/public/BookingPage'
import AppointmentConfirmation from './pages/public/AppointmentConfirmation'
import GalleryPage from './pages/public/GalleryPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import SocialsPage from './pages/public/SocialsPage'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServices from './pages/admin/AdminServices'
import AdminStylists from './pages/admin/AdminStylists'
import AdminBookings from './pages/admin/AdminBookings'
import AdminGallery from './pages/admin/AdminGallery'
import AdminSocialVideos from './pages/admin/AdminSocialVideos'
import AdminSettings from './pages/admin/AdminSettings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:slug" element={<ServiceDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/socials" element={<SocialsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/booking"
            element={
              <BookingProvider>
                <BookingPage />
              </BookingProvider>
            }
          />
          <Route path="/appointment-confirmation/:id" element={<AppointmentConfirmation />} />
        </Route>

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/stylists" element={<AdminStylists />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/social-videos" element={<AdminSocialVideos />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
