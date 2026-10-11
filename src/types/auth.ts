export type UserRole = 'patient' | 'doctor'

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
  licenseNumber?: string
  specialty?: string
  dateOfBirth?: string
  phone?: string
}

export type VisitStatus = 'waiting' | 'in-consultation' | 'completed'

export interface PatientVisit {
  id?: string
  patientUid: string
  patientName: string
  chiefComplaint: string
  duration: string
  painLevel: number
  allergies: string
  consentGiven: boolean
  status: VisitStatus
  createdAt: string
}
