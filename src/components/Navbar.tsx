import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { StethoscopeIcon } from './Icons'

export const Navbar: FC = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo" aria-label="MEDIKIOSK Home">
          <div className="brand-icon-wrapper">
            <StethoscopeIcon className="brand-icon" />
          </div>
          <div className="brand-details">
            <span className="brand-name">MEDIKIOSK</span>
            <span className="brand-tag">CLINICAL SUITE</span>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Main Navigation">
          <a href="#about" className="nav-link">About Platform</a>
          <a href="#portals" className="nav-link">Access Portals</a>
          <a href="#features" className="nav-link">Key Capabilities</a>
          <a href="#security" className="nav-link">Standards</a>
        </nav>

        <div className="nav-actions">
          <Link to="/patient" className="btn btn-outline btn-sm">
            Patient Portal
          </Link>
          <Link to="/doctor" className="btn btn-primary btn-sm">
            Doctor Workstation
          </Link>
        </div>
      </div>
    </header>
  )
}
