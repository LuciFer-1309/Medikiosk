import type { FC, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, StethoscopeIcon } from './Icons'
import { useAuth } from '../context/AuthContext'

export interface PortalLayoutProps {
  portalTitle: string
  portalSubtitle: string
  portalBadge: string
  roleTheme?: 'teal' | 'slate'
  children: ReactNode
}

export const PortalLayout: FC<PortalLayoutProps> = ({
  portalTitle,
  portalSubtitle,
  portalBadge,
  roleTheme = 'teal',
  children,
}) => {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className={`portal-layout portal-theme-${roleTheme}`}>
      <div className="portal-demo-banner" role="status">
        <span className="demo-banner-badge">DEMO MODE</span>
        <span>Use fictional patient data only. Not for real medical emergencies or production clinical records.</span>
      </div>
      <header className="portal-header">
        <div className="portal-header-container">
          <div className="portal-brand-left">
            <Link to="/" className="portal-back-btn" aria-label="Return to landing page">
              <ArrowLeftIcon className="portal-back-icon" />
              <span>Back to Home</span>
            </Link>

            <div className="portal-header-divider" />

            <div className="brand-logo portal-brand-logo">
              <div className="brand-icon-wrapper portal-mini-icon">
                <StethoscopeIcon className="brand-icon" />
              </div>
              <div className="brand-details">
                <span className="brand-name">MEDIKIOSK</span>
                <span className="brand-tag">{portalBadge}</span>
              </div>
            </div>
          </div>

          <div className="portal-header-right">
            {currentUser && (
              <div className="portal-user-badge">
                <span className="portal-user-name">
                  {userProfile?.fullName || currentUser.email}
                </span>
                <span className="badge badge-pill">{userProfile?.role?.toUpperCase() || portalBadge}</span>
              </div>
            )}
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/" className="btn btn-outline btn-sm">
                Exit Portal
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="portal-main-container">
        <div className="portal-hero-intro">
          <span className="portal-eyebrow">{portalBadge}</span>
          <h1 className="portal-page-title">{portalTitle}</h1>
          <p className="portal-page-subtitle">{portalSubtitle}</p>
        </div>

        {children}
      </main>

      <footer className="portal-footer">
        <div className="portal-footer-content">
          <p>© {new Date().getFullYear()} MEDIKIOSK Clinical System • Healthcare Intake & Workstation Prototype</p>
          <div className="portal-footer-links">
            <Link to="/">Landing Page</Link>
            <span className="divider-dot">•</span>
            <Link to="/patient">Patient Portal</Link>
            <span className="divider-dot">•</span>
            <Link to="/doctor">Doctor Workstation</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
