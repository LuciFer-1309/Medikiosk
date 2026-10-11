import type { FC } from 'react'
import { AuthCard } from '../components/AuthCard'

export const PatientLoginPage: FC = () => {
  return <AuthCard role="patient" mode="login" />
}

export const PatientRegisterPage: FC = () => {
  return <AuthCard role="patient" mode="register" />
}

export const DoctorLoginPage: FC = () => {
  return <AuthCard role="doctor" mode="login" />
}
