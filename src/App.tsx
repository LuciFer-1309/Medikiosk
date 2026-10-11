import type { FC } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { PatientPortalPage } from './pages/PatientPortalPage'
import { DoctorPortalPage } from './pages/DoctorPortalPage'
import {
  PatientLoginPage,
  PatientRegisterPage,
  DoctorLoginPage,
} from './pages/AuthPages'
import './App.css'

const App: FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Patient Authentication Routes */}
          <Route path="/patient/login" element={<PatientLoginPage />} />
          <Route path="/patient/register" element={<PatientRegisterPage />} />

          {/* Doctor Authentication Route (Registration disabled for security) */}
          <Route path="/doctor/login" element={<DoctorLoginPage />} />
          <Route path="/doctor/register" element={<Navigate to="/doctor/login" replace />} />

          {/* Role-Protected Portals */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
