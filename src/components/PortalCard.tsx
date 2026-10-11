import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, CheckCircleIcon } from './Icons'

export interface PortalCardProps {
  id: string
  title: string
  badge: string
  role: string
  description: string
  icon: ReactNode
  features: string[]
  buttonText: string
  accentColor?: 'teal' | 'slate'
  to: string
}

export const PortalCard: FC<PortalCardProps> = ({
  id,
  title,
  badge,
  role,
  description,
  icon,
  features,
  buttonText,
  accentColor = 'teal',
  to,
}) => {
  return (
    <div className={`portal-card portal-card-${accentColor}`} id={id}>
      <div className="portal-card-header">
        <div className="portal-icon-container">{icon}</div>
        <div className="portal-badge-group">
          <span className="badge badge-pill">{badge}</span>
          <span className="portal-role-hint">{role}</span>
        </div>
      </div>

      <div className="portal-card-body">
        <h3 className="portal-card-title">{title}</h3>
        <p className="portal-card-desc">{description}</p>

        <div className="portal-features-list">
          <span className="portal-features-label">Module Highlights:</span>
          <ul>
            {features.map((feat, idx) => (
              <li key={idx} className="portal-feature-item">
                <CheckCircleIcon className="feature-check-icon" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="portal-card-footer">
        <Link
          to={to}
          className={`btn ${accentColor === 'teal' ? 'btn-primary' : 'btn-secondary'} btn-block`}
        >
          <span>{buttonText}</span>
          <ArrowRightIcon className="btn-icon" />
        </Link>
        <p className="portal-footnote">Direct entry portal for authorized {role.toLowerCase()}s</p>
      </div>
    </div>
  )
}
