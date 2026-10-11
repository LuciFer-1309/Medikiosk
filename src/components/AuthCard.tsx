import { useState, type FC, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  StethoscopeIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '../components/Icons'
import type { UserRole } from '../types/auth'

interface AuthCardProps {
  role: UserRole
  mode: 'login' | 'register'
}

export const AuthCard: FC<AuthCardProps> = ({ role, mode }) => {
  const navigate = useNavigate()
  const { login, register, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [extraField, setExtraField] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isDoctor = role === 'doctor'
  const isRegister = mode === 'register'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!isConfigured) {
      setErrorMsg(
        'Firebase credentials are not configured yet. Please configure .env.local with your Firebase project settings.'
      )
      return
    }

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    if (isRegister && !fullName.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }

    setSubmitting(true)

    try {
      if (isRegister) {
        const extra = { phone: extraField.trim() }
        await register(email.trim(), password, fullName.trim(), role, extra)
      } else {
        await login(email.trim(), password, role)
      }

      // Navigate to corresponding portal upon success
      navigate(isDoctor ? '/doctor' : '/patient')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      let readableError = 'An error occurred during authentication.'

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        readableError = 'Invalid email or password. Please verify your credentials.'
      } else if (error.code === 'auth/email-already-in-use') {
        readableError = 'An account with this email address already exists. Please log in.'
      } else if (error.code === 'auth/weak-password') {
        readableError = 'Password should be at least 6 characters long.'
      } else if (error.code === 'auth/invalid-email') {
        readableError = 'Please provide a valid email format.'
      } else if (error.message) {
        readableError = error.message
      }

      setErrorMsg(readableError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        {/* Navigation back */}
        <div className="auth-top-nav">
          <Link to="/" className="portal-back-btn">
            <ArrowLeftIcon className="portal-back-icon" />
            <span>Back to Landing Page</span>
          </Link>
        </div>

        <div className={`auth-card auth-card-${isDoctor ? 'slate' : 'teal'}`}>
          <div className="auth-card-header">
            <div className="brand-logo auth-header-logo">
              <div className={`brand-icon-wrapper ${isDoctor ? 'bg-slate' : ''}`}>
                {isDoctor ? <StethoscopeIcon className="brand-icon" /> : <UserIcon className="brand-icon" />}
              </div>
              <div className="brand-details">
                <span className="brand-name">MEDIKIOSK</span>
                <span className="brand-tag">{isDoctor ? 'PROVIDER ACCESS' : 'PATIENT INTAKE'}</span>
              </div>
            </div>

            <h1 className="auth-title">
              {isDoctor
                ? 'Doctor Workstation Sign In'
                : isRegister
                  ? 'Create Patient Account'
                  : 'Patient Portal Sign In'}
            </h1>
            <p className="auth-sub">
              {isDoctor
                ? 'Authorized medical staff and attending physician portal.'
                : 'Self-service kiosk check-in and medical history management.'}
            </p>
          </div>

          {!isConfigured && (
            <div className="auth-config-notice">
              <ClockIcon className="auth-notice-icon" />
              <div>
                <strong>Firebase Setup Required:</strong> Web credentials must be provided in <code>.env.local</code> to authenticate with your Firebase project.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="auth-error-alert" role="alert">
              <ShieldCheckIcon className="auth-error-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && (
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder={isDoctor ? 'doctor.demo@medikiosk.internal' : 'patient@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label" htmlFor="extra">
                  Contact Phone Number
                </label>
                <input
                  id="extra"
                  type="text"
                  className="form-input"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={extraField}
                  onChange={(e) => setExtraField(e.target.value)}
                />
              </div>
            )}

            <div className="form-group-role">
              <span className="form-role-badge">
                Role Assignment: <strong>{role.toUpperCase()}</strong> (Verified via database)
              </span>
            </div>

            <button
              type="submit"
              className={`btn ${isDoctor ? 'btn-secondary' : 'btn-primary'} btn-block btn-lg`}
              disabled={submitting}
            >
              <span>{submitting ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In'}</span>
              <ArrowRightIcon className="btn-icon" />
            </button>
          </form>

          <div className="auth-card-footer">
            {isDoctor ? (
              <div className="doctor-provision-notice">
                <p className="notice-text">
                  Doctor accounts are provisioned by clinic administration.
                </p>
                <p className="demo-hint-text">
                  For hackathon review, use the demo credentials: <code>doctor.demo@medikiosk.internal</code>
                </p>
              </div>
            ) : isRegister ? (
              <p>
                Already have an account?{' '}
                <Link to="/patient/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            ) : (
              <p>
                Need to register?{' '}
                <Link to="/patient/register" className="auth-link">
                  Create an account
                </Link>
              </p>
            )}

            <div className="auth-switch-role">
              <span className="auth-switch-divider">or switch portal</span>
              <Link to={isDoctor ? '/patient/login' : '/doctor/login'} className="auth-switch-link">
                Go to {isDoctor ? 'Patient Portal' : 'Doctor Workstation'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
