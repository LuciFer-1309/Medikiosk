import { useState, useEffect, type FC } from 'react'
import {
  collection,
  query,
  onSnapshot,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { PortalLayout } from '../components/PortalLayout'
import { CaseReviewModal } from '../components/CaseReviewModal'
import {
  ActivityIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserIcon,
} from '../components/Icons'
import type { PatientVisit, VisitStatus } from '../types/auth'
import { computeTriageFlags, overallSeverity, type TriageSeverity } from '../lib/triage'

export const DoctorPortalPage: FC = () => {
  const [visits, setVisits] = useState<PatientVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null)
  const [activeTab, setActiveTab] = useState<'waiting' | 'in-consultation' | 'completed' | 'all'>('waiting')

  useEffect(() => {
    if (!db) {
      setLoading(false)
      setErrorMsg('Firestore database connection is unavailable.')
      return
    }

    // Live query for visits: Ordered oldest-first for the clinical triage queue
    const q = query(collection(db, 'visits'), orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PatientVisit[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Safe handling of malformed or missing fields
          list.push({
            id: doc.id,
            patientUid: data.patientUid || 'Unknown UID',
            patientName: data.patientName || 'Anonymous Patient',
            chiefComplaint: data.chiefComplaint || 'No complaint specified',
            duration: data.duration || 'Unspecified duration',
            painLevel: typeof data.painLevel === 'number' ? data.painLevel : 0,
            allergies: data.allergies || 'Unknown',
            consentGiven: Boolean(data.consentGiven),
            status: (data.status as VisitStatus) || 'waiting',
            createdAt: data.createdAt || new Date().toISOString(),
          })
        })
        setVisits(list)
        setLoading(false)
        setErrorMsg(null)

        // Keep selected modal visit updated if updated in snapshot
        if (selectedVisit) {
          const updated = list.find((v) => v.id === selectedVisit.id)
          if (updated) setSelectedVisit(updated)
        }
      },
      (err) => {
        console.error('Doctor consultation queue error:', err)
        setErrorMsg('Failed to subscribe to live visits queue: ' + err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [selectedVisit?.id])

  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'all') return true
    return v.status === activeTab
  })

  const waitingCount = visits.filter((v) => v.status === 'waiting').length
  const inConsultCount = visits.filter((v) => v.status === 'in-consultation').length
  const completedCount = visits.filter((v) => v.status === 'completed').length

  const handleStatusUpdated = (visitId: string, newStatus: VisitStatus) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v))
    )
    if (selectedVisit && selectedVisit.id === visitId) {
      setSelectedVisit((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  const severityLabel: Record<TriageSeverity, string> = {
    critical: '🔴 Critical',
    urgent: '🟡 Urgent',
    routine: '🟢 Routine',
  }

  return (
    <PortalLayout
      portalTitle="Doctor Clinical Workstation"
      portalSubtitle="Real-time triage queue. Review patient check-in intakes, inspect severity and allergy flags, and manage active consultation workflows."
      portalBadge="DOCTOR PORTAL"
      roleTheme="slate"
    >
      <div className="portal-content-wrapper">
        {/* Triage Queue Summary Strip */}
        <div className="triage-metrics-bar">
          <div className="metric-pill" onClick={() => setActiveTab('waiting')}>
            <span className="metric-num text-amber">{waitingCount}</span>
            <span className="metric-label">Waiting in Lobby</span>
          </div>
          <div className="metric-pill" onClick={() => setActiveTab('in-consultation')}>
            <span className="metric-num text-teal">{inConsultCount}</span>
            <span className="metric-label">In Consultation</span>
          </div>
          <div className="metric-pill" onClick={() => setActiveTab('completed')}>
            <span className="metric-num text-slate">{completedCount}</span>
            <span className="metric-label">Completed Today</span>
          </div>
          <div className="metric-pill" onClick={() => setActiveTab('all')}>
            <span className="metric-num">{visits.length}</span>
            <span className="metric-label">Total Registered</span>
          </div>
        </div>

        {errorMsg && (
          <div className="auth-error-alert" role="alert">
            <ShieldCheckIcon className="auth-error-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Queue Workstation View */}
        <div className="doctor-queue-section">
          <div className="queue-header-row">
            <div className="queue-title-left">
              <ActivityIcon className="text-teal queue-header-icon" />
              <div>
                <h3 className="portal-section-title">Consultation Triage Queue</h3>
                <p className="queue-sub-text">
                  Sorted chronologically (oldest-first) for equitable clinic lobby intake order.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="queue-tabs">
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === 'waiting' ? 'active' : ''}`}
                onClick={() => setActiveTab('waiting')}
              >
                Waiting ({waitingCount})
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === 'in-consultation' ? 'active' : ''}`}
                onClick={() => setActiveTab('in-consultation')}
              >
                In Consult ({inConsultCount})
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({completedCount})
              </button>
              <button
                type="button"
                className={`queue-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({visits.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="visits-loading-card">
              <ClockIcon className="auth-notice-icon animate-spin" />
              <span>Connecting to real-time clinic triage queue...</span>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="visits-empty-card">
              <p className="empty-title">
                {activeTab === 'waiting'
                  ? 'No patients currently waiting in queue'
                  : `No encounters in "${activeTab}" status`}
              </p>
              <p className="empty-sub">
                When patients complete the digital check-in kiosk at the lobby, their structured chief complaint and pain level will stream here immediately.
              </p>
            </div>
          ) : (
            <div className="triage-table-card">
              <div className="triage-table-responsive">
                <table className="triage-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Patient Name</th>
                      <th>Chief Complaint</th>
                      <th>Duration</th>
                      <th>Pain</th>
                      <th>Allergies</th>
                      <th>Check-in Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.map((visit) => {
                      const flags = computeTriageFlags(visit)
                      const severity = overallSeverity(flags)
                      const rowClass =
                        severity === 'critical'
                          ? 'row-critical'
                          : severity === 'urgent'
                          ? 'row-urgent'
                          : ''
                      return (
                        <tr
                          key={visit.id}
                          className={`triage-row ${rowClass}`}
                          onClick={() => setSelectedVisit(visit)}
                        >
                          <td>
                            <span className={`status-pill status-${visit.status}`}>
                              {visit.status}
                            </span>
                          </td>
                          <td>
                            <div className="priority-cell">
                              <span className={`priority-pill priority-${severity}`}>
                                {severityLabel[severity]}
                              </span>
                              {flags.length > 0 && (
                                <div className="priority-flags">
                                  {flags.map((f, i) => (
                                    <span key={i} className="priority-flag-reason">
                                      {f.reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="patient-col">
                            <div className="patient-name-cell">
                              <UserIcon className="table-user-icon" />
                              <div>
                                <span className="patient-name-text">{visit.patientName}</span>
                                <span className="patient-id-sub">UID: {visit.patientUid.substring(0, 8)}...</span>
                              </div>
                            </div>
                          </td>
                          <td className="complaint-col">
                            <p className="complaint-truncate">{visit.chiefComplaint}</p>
                          </td>
                          <td className="meta-col">{visit.duration}</td>
                          <td>
                            <span className={`pain-pill ${visit.painLevel >= 7 ? 'pain-severe' : visit.painLevel >= 4 ? 'pain-moderate' : 'pain-mild'}`}>
                              {visit.painLevel}/10
                            </span>
                          </td>
                          <td className="allergy-col">
                            <span className={visit.allergies.includes('NKDA') ? 'text-teal' : 'text-alert'}>
                              {visit.allergies}
                            </span>
                          </td>
                          <td className="time-col">
                            {new Date(visit.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm triage-review-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedVisit(visit)
                              }}
                            >
                              <span>Review</span>
                              <ArrowRightIcon className="btn-icon" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Workstation Capabilities Overview */}
        <div className="workstation-info-banner">
          <div className="info-banner-left">
            <CheckCircleIcon className="feature-check-icon text-teal" />
            <div>
              <h4 className="info-banner-title">Live Clinical Triage Verified</h4>
              <p className="info-banner-desc">
                Protected by Firestore security rules. Only authorized medical staff can view all encounters and progress queue statuses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Case Review Modal */}
      <CaseReviewModal
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </PortalLayout>
  )
}
