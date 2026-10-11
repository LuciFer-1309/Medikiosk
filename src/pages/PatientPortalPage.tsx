import { useState, useEffect, type FC } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { PortalLayout } from '../components/PortalLayout'
import { PatientIntakeModal } from '../components/PatientIntakeModal'
import {
  PlusCircleIcon,
  UserIcon,
  HistoryIcon,
  FolderIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ActivityIcon,
} from '../components/Icons'
import type { PatientVisit } from '../types/auth'

export const PatientPortalPage: FC = () => {
  const { currentUser, userProfile } = useAuth()
  const [isIntakeOpen, setIsIntakeOpen] = useState(false)
  const [visits, setVisits] = useState<PatientVisit[]>([])
  const [loadingVisits, setLoadingVisits] = useState(true)

  useEffect(() => {
    if (!currentUser || !db) {
      setLoadingVisits(false)
      return
    }

    const q = query(
      collection(db, 'visits'),
      where('patientUid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const records: PatientVisit[] = []
        snap.forEach((doc) => {
          records.push({ id: doc.id, ...(doc.data() as Omit<PatientVisit, 'id'>) })
        })
        setVisits(records)
        setLoadingVisits(false)
      },
      (err) => {
        console.error('Error listening to patient visits:', err)
        setLoadingVisits(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  const handleVisitCreated = (newVisit: PatientVisit) => {
    setVisits((prev) => [newVisit, ...prev])
  }

  const patientCards = [
    {
      id: 'new-visit',
      title: 'Start New Visit',
      desc: 'Begin guided kiosk intake. Log chief complaint, pain scale, and current symptoms.',
      icon: <PlusCircleIcon className="portal-feature-svg" />,
      actionText: 'Begin Intake',
      highlight: true,
      tag: 'Interactive Intake',
      onClick: () => setIsIntakeOpen(true),
    },
    {
      id: 'profile',
      title: 'My Profile',
      desc: `Registered as: ${userProfile?.fullName || currentUser?.email}. Emergency contacts and contact information.`,
      icon: <UserIcon className="portal-feature-svg" />,
      actionText: 'View Profile',
      highlight: false,
      tag: 'Account Record',
      onClick: () => alert(`Patient profile for: ${userProfile?.fullName || currentUser?.email}\nPhone: ${userProfile?.phone || 'Not recorded'}`),
    },
    {
      id: 'history',
      title: 'Medical History',
      desc: 'Review recorded past medical conditions, known allergies, surgeries, and immunizations.',
      icon: <HistoryIcon className="portal-feature-svg" />,
      actionText: 'Review History',
      highlight: false,
      tag: 'Clinical Data',
      onClick: () => alert('Medical History archive: Intake submissions automatically update your active clinical file.'),
    },
    {
      id: 'documents',
      title: 'My Documents',
      desc: 'Access post-visit summaries, uploaded insurance cards, and digital referral slips.',
      icon: <FolderIcon className="portal-feature-svg" />,
      actionText: 'Browse Files',
      highlight: false,
      tag: 'Records',
      onClick: () => alert('Documents module: Visit summaries are generated once your clinician completes your consult.'),
    },
  ]

  return (
    <PortalLayout
      portalTitle="Welcome to the Patient Intake Kiosk"
      portalSubtitle="Complete your pre-consultation check-in quickly and securely. Your entries are directly shared with your attending physician."
      portalBadge="PATIENT PORTAL"
      roleTheme="teal"
    >
      <div className="portal-content-wrapper">
        {/* Active Intake Banner */}
        <div className="active-intake-banner">
          <div className="active-intake-details">
            <span className="badge badge-pill">CLINIC LOBBY KIOSK</span>
            <h2 className="active-intake-heading">Ready to see a doctor today?</h2>
            <p className="active-intake-sub">
              Start your intake below to be placed in the consultation triage queue.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => setIsIntakeOpen(true)}
          >
            <PlusCircleIcon className="btn-icon" />
            <span>Start New Visit Intake</span>
          </button>
        </div>

        {/* Recent Submitted Visits Section */}
        <div className="patient-visits-section">
          <div className="section-title-row">
            <div className="section-title-left">
              <ActivityIcon className="section-title-icon text-teal" />
              <h3 className="portal-section-title">Your Recent Clinic Intakes</h3>
            </div>
            <span className="badge badge-pill">{visits.length} Visit{visits.length === 1 ? '' : 's'}</span>
          </div>

          {loadingVisits ? (
            <div className="visits-loading-card">
              <ClockIcon className="auth-notice-icon animate-spin" />
              <span>Retrieving your visit history...</span>
            </div>
          ) : visits.length === 0 ? (
            <div className="visits-empty-card">
              <p className="empty-title">No intake visits recorded yet today</p>
              <p className="empty-sub">
                Click <strong>"Start New Visit"</strong> to record your chief complaint and join the clinician's waiting queue.
              </p>
            </div>
          ) : (
            <div className="visits-list-grid">
              {visits.map((v) => (
                <div key={v.id || v.createdAt} className="visit-record-card">
                  <div className="visit-record-header">
                    <div className="visit-badge-group">
                      <span className={`status-pill status-${v.status}`}>
                        {v.status === 'waiting'
                          ? '⏳ Waiting for Clinician'
                          : v.status === 'in-consultation'
                          ? '🩺 With Doctor Now'
                          : '✅ Consultation Completed'}
                      </span>
                      <span className="visit-time">
                        {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="pain-tag">Pain: {v.painLevel}/10</span>
                  </div>

                  <div className="visit-record-body">
                    <h4 className="visit-complaint">{v.chiefComplaint}</h4>
                    <div className="visit-details-meta">
                      <span><strong>Duration:</strong> {v.duration}</span>
                      <span><strong>Allergies:</strong> {v.allergies}</span>
                    </div>
                  </div>

                  <div className="visit-record-footer">
                    {v.status === 'waiting' && (
                      <>
                        <ClockIcon className="feature-check-icon text-amber" />
                        <span className="visit-transmitted-text">You are in queue. Please remain in the clinic lobby.</span>
                      </>
                    )}
                    {v.status === 'in-consultation' && (
                      <>
                        <ActivityIcon className="feature-check-icon text-teal" />
                        <span className="visit-transmitted-text">Active visit. The physician is reviewing your chart.</span>
                      </>
                    )}
                    {v.status === 'completed' && (
                      <>
                        <CheckCircleIcon className="feature-check-icon text-teal" />
                        <span className="visit-transmitted-text">Visit complete. Thank you for checking in with MediKiosk.</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Navigation Grid */}
        <h3 className="portal-section-title mt-6">Kiosk Modules</h3>
        <div className="portal-modules-grid">
          {patientCards.map((card) => (
            <div key={card.id} className={`portal-module-card ${card.highlight ? 'module-highlight' : ''}`}>
              <div className="module-card-top">
                <div className="module-icon-wrap">{card.icon}</div>
                <div className="module-tag-group">
                  <span className="module-tag">{card.tag}</span>
                </div>
              </div>

              <div className="module-card-body">
                <h3 className="module-title">{card.title}</h3>
                <p className="module-desc">{card.desc}</p>
              </div>

              <div className="module-card-bottom">
                <button
                  type="button"
                  className={`btn ${card.highlight ? 'btn-primary' : 'btn-outline'} btn-block`}
                  onClick={card.onClick}
                >
                  <span>{card.actionText}</span>
                  <ArrowRightIcon className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intake Modal Dialog */}
      <PatientIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSuccess={handleVisitCreated}
      />
    </PortalLayout>
  )
}
