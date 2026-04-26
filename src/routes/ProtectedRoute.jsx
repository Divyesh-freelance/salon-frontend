import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/shared/Loader'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader /></div>
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
