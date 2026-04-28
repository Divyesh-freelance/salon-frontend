import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { CartProvider } from './context/CartContext'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'

// Public pages — existing
import HomePage from './pages/public/HomePage'
import ServicesPage from './pages/public/ServicesPage'
import ServiceDetailPage from './pages/public/ServiceDetailPage'
import BookingPage from './pages/public/BookingPage'
import AppointmentConfirmation from './pages/public/AppointmentConfirmation'
import GalleryPage from './pages/public/GalleryPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import SocialsPage from './pages/public/SocialsPage'

// Public pages — new modules
import ProductsPage from './pages/public/ProductsPage'
import ProductDetailPage from './pages/public/ProductDetailPage'
import CartPage from './pages/public/CartPage'
import CheckoutPage from './pages/public/CheckoutPage'
import OrderConfirmationPage from './pages/public/OrderConfirmationPage'
import AcademyPage from './pages/public/AcademyPage'
import AcademyDetailPage from './pages/public/AcademyDetailPage'
import DiscountsPage from './pages/public/DiscountsPage'

// Admin pages — existing
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServices from './pages/admin/AdminServices'
import AdminStylists from './pages/admin/AdminStylists'
import AdminBookings from './pages/admin/AdminBookings'
import AdminGallery from './pages/admin/AdminGallery'
import AdminSocialVideos from './pages/admin/AdminSocialVideos'
import AdminSettings from './pages/admin/AdminSettings'

// Admin pages — new modules
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminAcademy from './pages/admin/AdminAcademy'
import AdminDiscounts from './pages/admin/AdminDiscounts'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            {/* Existing */}
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

            {/* New modules */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/academy/:slug" element={<AcademyDetailPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
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
            {/* Existing */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/stylists" element={<AdminStylists />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
            <Route path="/admin/social-videos" element={<AdminSocialVideos />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* New modules */}
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/academy" element={<AdminAcademy />} />
            <Route path="/admin/discounts" element={<AdminDiscounts />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
