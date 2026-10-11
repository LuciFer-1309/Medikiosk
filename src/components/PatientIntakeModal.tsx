import { useState, useRef, useEffect, type FC, type FormEvent } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { CheckCircleIcon, ShieldCheckIcon, ClockIcon } from './Icons'
import type { PatientVisit } from '../types/auth'

interface PatientIntakeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newVisit: PatientVisit) => void
}

export const PatientIntakeModal: FC<PatientIntakeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, userProfile } = useAuth()

  const [chiefComplaint, setChiefComplaint] = useState('')
  const [duration, setDuration] = useState('')
  const [painLevel, setPainLevel] = useState<number>(3)
  const [allergyChoice, setAllergyChoice] = useState<'none' | 'unknown' | 'specific'>('unknown')
  const [specificAllergies, setSpecificAllergies] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Voice Input States
  const [selectedLang, setSelectedLang] = useState<'en-IN' | 'hi-IN' | 'mr-IN'>('en-IN')
  const [isListening, setIsListening] = useState(false)
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check speech recognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSpeechSupported(false)
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    setVoiceNotice(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSpeechSupported(false)
      setVoiceNotice('Voice recognition is not supported in this browser. Please type your symptoms.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.lang = selectedLang
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
        setVoiceNotice('🎙️ Listening... Speak your symptoms clearly.')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setChiefComplaint((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setVoiceNotice('✅ Transcribed. You can review and edit the text.')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone access denied. Please allow microphone permission.')
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech detected. Please click the mic and try again.')
        } else {
          setVoiceNotice(`Voice recognition notice: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err: unknown) {
      setIsListening(false)
      const error = err as { message?: string }
      setVoiceNotice(`Unable to start voice recording: ${error.message || 'Unknown error'}`)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!currentUser || !currentUser.uid) {
      setErrorMsg('You must be signed in to submit a visit.')
      return
    }

    if (!chiefComplaint.trim()) {
      setErrorMsg('Please enter your chief complaint / reason for visit.')
      return
    }

    if (!duration.trim()) {
      setErrorMsg('Please state how long you have been experiencing these symptoms.')
      return
    }

    if (!consentGiven) {
      setErrorMsg('Please acknowledge consent for clinical intake review.')
      return
    }

    let finalAllergies = 'Unknown / Unrecorded'
    if (allergyChoice === 'none') {
      finalAllergies = 'No Known Drug Allergies (NKDA)'
    } else if (allergyChoice === 'specific') {
      finalAllergies = specificAllergies.trim() || 'Specified allergies unstated'
    }

    setSubmitting(true)

    try {
      if (!db) {
        throw new Error('Database service is currently unavailable.')
      }

      const visitPayload = {
        patientUid: currentUser.uid,
        patientName: userProfile?.fullName || currentUser.email || 'Registered Patient',
        chiefComplaint: chiefComplaint.trim(),
        duration: duration.trim(),
        painLevel: Number(painLevel),
        allergies: finalAllergies,
        consentGiven: true,
        status: 'waiting' as const,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'visits'), visitPayload)

      const createdVisit: PatientVisit = {
        id: docRef.id,
        patientUid: currentUser.uid,
        patientName: visitPayload.patientName,
        chiefComplaint: visitPayload.chiefComplaint,
        duration: visitPayload.duration,
        painLevel: visitPayload.painLevel,
        allergies: visitPayload.allergies,
        consentGiven: true,
        status: 'waiting',
        createdAt: visitPayload.createdAt,
      }

      onSuccess(createdVisit)
      onClose()
    } catch (err: unknown) {
      console.error('Error submitting visit intake:', err)
      const error = err as { message?: string }
      setErrorMsg(error.message || 'Failed to submit intake. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="badge badge-pill">CLINICAL INTAKE</span>
            <h2 className="modal-title">Patient Intake & Symptom Log</h2>
            <p className="modal-subtitle">
              Record your symptoms accurately for your attending physician.
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

        <form onSubmit={handleSubmit} className="intake-form">
          <div className="form-group">
            <div className="voice-input-header">
              <label className="form-label" htmlFor="chiefComplaint">
                Chief Complaint / Reason for Visit <span className="text-required">*</span>
              </label>

              {/* Voice Input Controls */}
              <div className="voice-controls-row">
                <select
                  className="voice-lang-select"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as 'en-IN' | 'hi-IN' | 'mr-IN')}
                  disabled={isListening}
                  aria-label="Dictation Language"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                  <option value="mr-IN">मराठी (Marathi)</option>
                </select>

                <button
                  type="button"
                  className={`btn btn-sm ${isListening ? 'btn-mic-active' : 'btn-outline'} btn-voice-toggle`}
                  onClick={toggleVoiceInput}
                  title="Speak symptoms using microphone"
                >
                  <span className="mic-icon">{isListening ? '⏹️' : '🎙️'}</span>
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>
            </div>

            {voiceNotice && (
              <div className={`voice-notice-banner ${isListening ? 'voice-listening' : ''}`}>
                <span>{voiceNotice}</span>
              </div>
            )}

            {!isSpeechSupported && (
              <div className="voice-unsupported-note">
                <span>ℹ️ Voice dictation is not supported in this browser. Please type directly into the box.</span>
              </div>
            )}

            <textarea
              id="chiefComplaint"
              className="form-input form-textarea"
              rows={3}
              placeholder="Describe your primary symptoms, discomfort, or what brought you in today (type or use voice dictation above)..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              required
              maxLength={500}
            />
            <span className="voice-field-hint">
              💡 You can freely review and edit the transcribed text before submitting.
            </span>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="duration">
                Symptom Duration <span className="text-required">*</span>
              </label>
              <input
                id="duration"
                type="text"
                className="form-input"
                placeholder="e.g. 2 days, since this morning"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="painLevel">
                Pain Level (1–10): <strong>{painLevel} / 10</strong>
              </label>
              <div className="pain-slider-wrapper">
                <input
                  id="painLevel"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  className="pain-slider"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                />
                <div className="pain-scale-labels">
                  <span>1 (Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Allergy History <span className="text-required">*</span>
            </label>
            <div className="radio-options-grid">
              <label className={`radio-pill ${allergyChoice === 'unknown' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="allergyChoice"
                  value="unknown"
                  checked={allergyChoice === 'unknown'}
                  onChange={() => setAllergyChoice('unknown')}
                />
                <span>Unknown / Not Sure</span>
              </label>

              <label className={`radio-pill ${allergyChoice === 'none' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="allergyChoice"
                  value="none"
                  checked={allergyChoice === 'none'}
                  onChange={() => setAllergyChoice('none')}
                />
                <span>No Known Allergies (NKDA)</span>
              </label>

              <label className={`radio-pill ${allergyChoice === 'specific' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="allergyChoice"
                  value="specific"
                  checked={allergyChoice === 'specific'}
                  onChange={() => setAllergyChoice('specific')}
                />
                <span>Has Known Allergies</span>
              </label>
            </div>

            {allergyChoice === 'specific' && (
              <input
                type="text"
                className="form-input mt-2"
                placeholder="List known allergies (e.g. Penicillin, Peanuts, Latex, Aspirin)..."
                value={specificAllergies}
                onChange={(e) => setSpecificAllergies(e.target.value)}
                required={allergyChoice === 'specific'}
                maxLength={200}
              />
            )}
          </div>

          <div className="form-consent-box">
            <label className="consent-checkbox-label">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                required
              />
              <span className="consent-text">
                I confirm that the health details provided are accurate to the best of my knowledge and consent to their transmission to attending clinical staff.
              </span>
            </label>
          </div>

          <div className="intake-actions">
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <ClockIcon className="btn-icon animate-spin" />
                  <span>Submitting Intake...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="btn-icon" />
                  <span>Submit to Triage Queue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

