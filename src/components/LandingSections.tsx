import type { FC } from 'react'
import {
  StethoscopeIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  ClipboardHeartIcon,
  FileTextIcon,
  ActivityIcon,
  Building2Icon,
  ArrowRightIcon
} from './Icons'
import { PortalCard } from './PortalCard'

export const HeroSection: FC = () => {
  return (
    <section className="hero-section" id="about">
      <div className="hero-container">
        <div className="hero-badge-wrapper">
          <span className="hero-pill">
            <SparklesIcon className="hero-pill-icon" />
            Next-Generation Clinical Intake & Case Analysis
          </span>
        </div>

        <h1 className="hero-title">
          Smart digital patient <br />
          <span className="text-teal">case-taking & clinical triage</span>
        </h1>

        <p className="hero-description">
          MEDIKIOSK bridges the front desk and consultation room. Patients record structured medical histories at check-in, and clinicians receive instant, organized diagnostic summaries before stepping into the room.
        </p>

        <div className="hero-cta-group">
          <a href="#portals" className="btn btn-primary btn-lg">
            <span>Explore Access Portals</span>
            <ArrowRightIcon className="btn-icon" />
          </a>
          <a href="#features" className="btn btn-outline btn-lg">
            Learn How It Works
          </a>
        </div>

        {/* Value metric pills */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <ClockIcon className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-heading">Under 3 Minutes</span>
              <span className="stat-sub">Average intake completion</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <ClipboardHeartIcon className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-heading">Standardized SBAR</span>
              <span className="stat-sub">Structured case documentation</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <ShieldCheckIcon className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-heading">HIPAA-Aligned</span>
              <span className="stat-sub">Strict clinic privacy safeguards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const PortalsSection: FC = () => {
  return (
    <section className="portals-section" id="portals">
      <div className="section-header">
        <span className="section-eyebrow">CHOOSE YOUR WORKFLOW</span>
        <h2 className="section-title">Dedicated Portals for Every Stakeholder</h2>
        <p className="section-subtitle">
          Designed specifically to keep patient check-in simple while giving healthcare providers actionable clinical clarity.
        </p>
      </div>

      <div className="portals-grid">
        <PortalCard
          id="patient-portal"
          title="Patient Intake Kiosk"
          badge="Self-Service Portal"
          role="Patient"
          description="Interactive, guided health intake form enabling patients to log symptoms, allergies, medication history, and chief complaints comfortably."
          icon={<UserIcon className="portal-icon" />}
          features={[
            'Guided symptom & chief complaint questionnaire',
            'Pain scale & duration timeline assessment',
            'Allergy & current prescription verification',
            'Multi-language friendly touch-first kiosk design'
          ]}
          buttonText="Enter Patient Portal"
          accentColor="teal"
          to="/patient"
        />

        <PortalCard
          id="doctor-portal"
          title="Doctor Clinical Workstation"
          badge="Provider Portal"
          role="Clinician"
          description="High-density clinical dashboard showing real-time queued patient cases, categorized severity alerts, and longitudinal encounter briefs."
          icon={<StethoscopeIcon className="portal-icon" />}
          features={[
            'Live triage queue with urgent condition highlights',
            'Structured chronological case history cards',
            'Pre-consultation differential diagnostic notes',
            'Exportable clinical summaries & prescription draft'
          ]}
          buttonText="Enter Doctor Portal"
          accentColor="slate"
          to="/doctor"
        />
      </div>
    </section>
  )
}

export const FeaturesSection: FC = () => {
  const features = [
    {
      icon: <ActivityIcon className="feature-icon" />,
      title: 'Automated Case Structuring',
      description: 'Converts unstructured conversational patient input into clean, standardized medical records ready for examination.'
    },
    {
      icon: <ClockIcon className="feature-icon" />,
      title: 'Eliminate Waiting Room Latency',
      description: 'Patients complete pre-visit intakes on their own mobile devices or dedicated clinic lobby kiosk tablets.'
    },
    {
      icon: <FileTextIcon className="feature-icon" />,
      title: 'Actionable Clinical Summaries',
      description: 'Doctors receive concise patient profiles with flagged contraindications and vital timelines prior to consult.'
    },
    {
      icon: <ShieldCheckIcon className="feature-icon" />,
      title: 'Private & Secure Architecture',
      description: 'Engineered from the ground up for strict confidentiality and role-separated access barriers.'
    },
    {
      icon: <Building2Icon className="feature-icon" />,
      title: 'Clinic & Hospital Scalability',
      description: 'Designed for single-doctor outpatient clinics, multi-specialty practices, and busy urgent care centers.'
    },
    {
      icon: <SparklesIcon className="feature-icon" />,
      title: 'Modern Digital Healthcare UI',
      description: 'Clean, accessible contrast and high legibility built according to modern healthcare UI/UX standards.'
    }
  ]

  return (
    <section className="features-section" id="features">
      <div className="section-header">
        <span className="section-eyebrow">SYSTEM CAPABILITIES</span>
        <h2 className="section-title">Built for Smooth Clinical Workflows</h2>
        <p className="section-subtitle">
          Everything your facility needs to replace manual clipboards with high-fidelity digital case histories.
        </p>
      </div>

      <div className="features-grid">
        {features.map((item, idx) => (
          <div key={idx} className="feature-card">
            <div className="feature-icon-wrapper">{item.icon}</div>
            <h3 className="feature-title">{item.title}</h3>
            <p className="feature-description">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export const Footer: FC = () => {
  return (
    <footer className="footer" id="security">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-logo">
              <div className="brand-icon-wrapper">
                <StethoscopeIcon className="brand-icon" />
              </div>
              <div className="brand-details">
                <span className="brand-name">MEDIKIOSK</span>
                <span className="brand-tag">CLINICAL PLATFORM</span>
              </div>
            </div>
            <p className="footer-tagline">
              Modern digital patient intake and clinical case-taking suite. Transforming consultation efficiency one visit at a time.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4 className="footer-col-title">Platform Portals</h4>
              <ul>
                <li><a href="/patient">Patient Intake Kiosk</a></li>
                <li><a href="/doctor">Doctor Clinical Workstation</a></li>
                <li><a href="#portals">Facility Admin (Planned)</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Clinical Standards</h4>
              <ul>
                <li><a href="#about">Digital SBAR Intake</a></li>
                <li><a href="#features">HIPAA Architecture Ready</a></li>
                <li><a href="#features">Accessibility Guidelines</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Project</h4>
              <ul>
                <li><a href="#top">Overview</a></li>
                <li><a href="#features">System Capabilities</a></li>
                <li><a href="#portals">Access Links</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MEDIKIOSK Platform. All rights reserved. Built for modern clinical practice.</p>
          <div className="footer-badges">
            <span className="compliance-pill">Healthcare SaaS Foundation</span>
            <span className="compliance-pill">Frontend Phase 1</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

