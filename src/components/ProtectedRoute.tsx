import type { FC, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

interface ProtectedRouteProps {
  requiredRole: UserRole
  children: ReactNode
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  requiredRole,
  children,
}) => {
  const { currentUser, userProfile, loading, isConfigured } = useAuth()

  // If Firebase is not configured in .env.local yet, redirect to login page where instructions and status are shown
  if (!isConfigured) {
    const loginPath = requiredRole === 'doctor' ? '/doctor/login' : '/patient/login'
    return <Navigate to={loginPath} replace />
  }

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p className="auth-loading-text">Verifying clinical credentials...</p>
      </div>
    )
  }

  // If user is not authenticated, redirect to appropriate login page
  if (!currentUser) {
    const redirectPath = requiredRole === 'doctor' ? '/doctor/login' : '/patient/login'
    return <Navigate to={redirectPath} replace />
  }

  // Enforce role check against stored Firestore profile
  if (!userProfile || userProfile.role !== requiredRole) {
    // If signed in under another role, redirect to their proper portal or corresponding login
    const targetPath = userProfile?.role === 'doctor' ? '/doctor' : '/patient'
    return <Navigate to={targetPath} replace />
  }

  return <>{children}</>
}

