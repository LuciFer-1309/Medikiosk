import { useState, type FC } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ActivityIcon,
  UserIcon,
} from './Icons'
import type { PatientVisit, VisitStatus } from '../types/auth'
import { generateVisitSummary } from '../lib/triage'

interface CaseReviewModalProps {
  visit: PatientVisit | null
  onClose: () => void
  onStatusUpdated: (visitId: string, newStatus: VisitStatus) => void
}

export const CaseReviewModal: FC<CaseReviewModalProps> = ({
  visit,
  onClose,
  onStatusUpdated,
}) => {
  const [pendingStatus, setPendingStatus] = useState<VisitStatus | null>(null)
  const [updating, setUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!visit) return null

  const handleStatusChangeRequest = (status: VisitStatus) => {
    if (status === visit.status) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setPendingStatus(status)
  }

  const confirmStatusUpdate = async () => {
    if (!pendingStatus || !visit.id || !db) return

    setUpdating(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const visitRef = doc(db, 'visits', visit.id)
      await updateDoc(visitRef, {
        status: pendingStatus,
      })

      onStatusUpdated(visit.id, pendingStatus)
      setSuccessMsg(`Encounter status successfully updated to "${pendingStatus}".`)
      setPendingStatus(null)
    } catch (err: unknown) {
      console.error('Failed to update visit status:', err)
      const error = err as { code?: string; message?: string }
      if (error.code === 'permission-denied') {
        setErrorMsg('Authorization Error: Only verified clinical doctors are permitted to update encounter status.')
      } else {
        setErrorMsg(error.message || 'Failed to update visit status. Please try again.')
      }
    } finally {
      setUpdating(false)
    }
  }

  const cancelPendingChange = () => {
    setPendingStatus(null)
    setErrorMsg(null)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card modal-card-wide printable-case-modal">
        {/* Print-Only Clinical Summary Document */}
        <div className="print-only-summary">
          <div className="print-brand-header">
            <h2>MEDIKIOSK — Patient Encounter Summary</h2>
            <p>Official Clinical Consultation Document</p>
          </div>
          <hr className="print-divider" />
          <div className="print-grid">
            {visit.patientName && (
              <div><strong>Patient Name:</strong> {visit.patientName}</div>
            )}
            {visit.status && (
              <div><strong>Visit Status:</strong> {visit.status.toUpperCase()}</div>
            )}
            {visit.createdAt && (
              <div><strong>Encounter Date:</strong> {new Date(visit.createdAt).toLocaleString()}</div>
            )}
            {visit.painLevel !== undefined && (
              <div><strong>Reported Pain:</strong> {visit.painLevel} / 10</div>
            )}
          </div>
          <hr className="print-divider" />
          {visit.chiefComplaint && (
            <div className="print-section">
              <h4>Chief Complaint:</h4>
              <p>{visit.chiefComplaint}</p>
            </div>
          )}
          {visit.duration && (
            <div className="print-section">
              <h4>Symptom Duration:</h4>
              <p>{visit.duration}</p>
            </div>
          )}
          {visit.allergies && (
            <div className="print-section">
              <h4>Allergy Information:</h4>
              <p>{visit.allergies}</p>
            </div>
          )}
          <hr className="print-divider" />
          <p className="print-disclaimer">
            Confidential medical intake record printed from MediKiosk. Intended for attending healthcare personnel only.
          </p>
        </div>

        <div className="modal-header no-print">
          <div>
            <div className="modal-badge-row">
              <span className="badge badge-pill">CASE REVIEW</span>
              <span className={`status-pill status-${visit.status}`}>
                Current: {visit.status}
              </span>
            </div>
            <h2 className="modal-title">Clinical Encounter Intake Brief</h2>
            <p className="modal-subtitle">
              Patient ID: <code>{visit.patientUid}</code> • Submission: {new Date(visit.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-alert" role="alert">
            <ShieldCheckIcon className="auth-error-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-success" role="alert">
            <CheckCircleIcon className="feature-check-icon text-teal" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="case-review-body no-print">
          {/* Patient Overview Strip */}
          <div className="case-patient-strip">
            <div className="patient-avatar-wrap">
              <UserIcon className="patient-avatar-svg" />
            </div>
            <div className="patient-meta">
              <h3 className="patient-name-heading">{visit.patientName}</h3>
              <p className="patient-sub-id">Self-Registered Kiosk Intake</p>
            </div>
            <div className="patient-pain-box">
              <span className="pain-box-label">Reported Pain</span>
              <span className={`pain-box-value ${visit.painLevel >= 7 ? 'pain-severe' : visit.painLevel >= 4 ? 'pain-moderate' : 'pain-mild'}`}>
                {visit.painLevel} / 10
              </span>
            </div>
          </div>

          {/* Structured Clinical Intake Data */}
          <div className="case-sections-grid">
            <div className="case-data-card">
              <h4 className="case-section-heading">Chief Complaint</h4>
              <p className="case-complaint-text">{visit.chiefComplaint}</p>
            </div>

            <div className="case-data-card">
              <h4 className="case-section-heading">Symptom Duration</h4>
              <p className="case-meta-value">{visit.duration}</p>
            </div>

            <div className="case-data-card">
              <h4 className="case-section-heading">Known Allergies</h4>
              <p className={`case-meta-value ${visit.allergies.includes('NKDA') ? 'text-teal' : 'text-alert'}`}>
                {visit.allergies}
              </p>
            </div>

            <div className="case-data-card">
              <h4 className="case-section-heading">Consent & Transmission</h4>
              <p className="case-meta-value text-teal">
                ✓ Patient consent confirmed at kiosk check-in
              </p>
            </div>
          </div>

          {/* Structured Doctor Clinical Summary */}
          <div className="case-data-card summary-card-highlight">
            <div className="summary-header-row">
              <div>
                <h4 className="case-section-heading">Structured Clinical Summary</h4>
                <p className="summary-subtitle">Concise template-based synthesis for rapid clinical review.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(generateVisitSummary(visit))
                  alert('Clinical brief copied to clipboard!')
                }}
              >
                Copy Brief
              </button>
            </div>
            <pre className="summary-pre-text">{generateVisitSummary(visit)}</pre>
          </div>

          {/* Status Progression Controls */}
          <div className="case-status-control-section">
            <h4 className="control-heading">Encounter Progression Workflow</h4>
            <p className="control-sub">
              Update the patient's queue state as you begin or finalize their medical consultation.
            </p>

            <div className="status-button-group">
              <button
                type="button"
                className={`btn btn-md ${visit.status === 'waiting' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleStatusChangeRequest('waiting')}
                disabled={visit.status === 'waiting' || updating}
              >
                Waiting
              </button>
              <button
                type="button"
                className={`btn btn-md ${visit.status === 'in-consultation' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleStatusChangeRequest('in-consultation')}
                disabled={visit.status === 'in-consultation' || updating}
              >
                In Consultation
              </button>
              <button
                type="button"
                className={`btn btn-md ${visit.status === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleStatusChangeRequest('completed')}
                disabled={visit.status === 'completed' || updating}
              >
                Completed
              </button>
            </div>

            {/* Status Change Confirmation Prompt */}
            {pendingStatus && (
              <div className="status-confirm-banner">
                <div className="status-confirm-text">
                  <ActivityIcon className="text-teal" />
                  <span>
                    Confirm moving this encounter from <strong>"{visit.status}"</strong> to{' '}
                    <strong>"{pendingStatus}"</strong>?
                  </span>
                </div>
                <div className="confirm-btn-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={cancelPendingChange}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={confirmStatusUpdate}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <ClockIcon className="btn-icon animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Confirm Status Change</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer no-print">
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={handlePrint}
          >
            🖨️ Print Visit Summary
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={onClose}
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  )
}

