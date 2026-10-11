/**
 * triage.ts — Rule-based clinical triage helpers for MEDIKIOSK.
 *
 * These are ADMINISTRATIVE PRIORITISATION TOOLS only.
 * They do NOT diagnose, treat, or replace professional clinical judgment.
 * All flags are based solely on patient-reported intake data.
 */

import type { PatientVisit } from '../types/auth'

// ── Types ─────────────────────────────────────────────────────────────────────

export type TriageSeverity = 'critical' | 'urgent' | 'routine'

export interface TriageFlag {
  reason: string
  severity: TriageSeverity
}

// ── Keyword sets ──────────────────────────────────────────────────────────────

const CRITICAL_KEYWORDS = [
  'chest pain',
  'chest tightness',
  'can\'t breathe',
  'difficulty breathing',
  'shortness of breath',
  'stroke',
  'unconscious',
  'unresponsive',
  'collapsed',
  'seizure',
  'severe bleeding',
  'heavy bleeding',
  'head injury',
  'overdose',
  'anaphylaxis',
  'allergic reaction',
  'no pulse',
  'heart attack',
]

const URGENT_KEYWORDS = [
  'fever',
  'high temperature',
  'vomiting',
  'vomit',
  'blood',
  'bleeding',
  'fracture',
  'broken',
  'dizziness',
  'dizzy',
  'faint',
  'confusion',
  'confused',
  'infection',
  'swelling',
  'rash',
  'abdominal pain',
  'stomach pain',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function containsKeyword(text: string, keywords: string[]): string | null {
  const lower = text.toLowerCase()
  for (const kw of keywords) {
    if (lower.includes(kw)) return kw
  }
  return null
}

/**
 * Parse a plain-language duration string and return hours.
 * Returns null if it cannot be parsed.
 */
function parseDurationHours(duration: string): number | null {
  const lower = duration.toLowerCase()
  const numMatch = lower.match(/(\d+(?:\.\d+)?)/)
  if (!numMatch) return null
  const n = parseFloat(numMatch[1])

  if (lower.includes('min')) return n / 60
  if (lower.includes('hour') || lower.includes('hr')) return n
  if (lower.includes('day')) return n * 24
  if (lower.includes('week')) return n * 168
  return null
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Compute rule-based triage flags for a single patient visit.
 *
 * Returns an empty array for routine cases.
 * Severity order: critical > urgent > routine
 *
 * ⚠️  NOT a medical diagnosis. For queue prioritisation only.
 */
export function computeTriageFlags(visit: PatientVisit): TriageFlag[] {
  const flags: TriageFlag[] = []

  // 1. Pain level — critical threshold ≥ 8
  if (visit.painLevel >= 8) {
    flags.push({
      reason: `Severe reported pain (${visit.painLevel}/10)`,
      severity: 'critical',
    })
  } else if (visit.painLevel >= 6) {
    flags.push({
      reason: `Moderate-high reported pain (${visit.painLevel}/10)`,
      severity: 'urgent',
    })
  }

  // 2. Critical complaint keywords
  const criticalMatch = containsKeyword(visit.chiefComplaint, CRITICAL_KEYWORDS)
  if (criticalMatch) {
    flags.push({
      reason: `Chief complaint includes critical term: "${criticalMatch}"`,
      severity: 'critical',
    })
  }

  // 3. Urgent complaint keywords (only if not already flagged as critical)
  if (!criticalMatch) {
    const urgentMatch = containsKeyword(visit.chiefComplaint, URGENT_KEYWORDS)
    if (urgentMatch) {
      flags.push({
        reason: `Chief complaint includes urgent term: "${urgentMatch}"`,
        severity: 'urgent',
      })
    }
  }

  // 4. Very recent onset (< 2 hours) elevates existing flags
  const hours = parseDurationHours(visit.duration)
  if (hours !== null && hours < 2 && flags.length > 0) {
    flags.push({
      reason: `Acute onset reported: "${visit.duration}"`,
      severity: 'urgent',
    })
  }

  // 5. Known allergy that is not NKDA / Unknown
  const allergyLower = visit.allergies.toLowerCase()
  const hasKnownAllergy =
    allergyLower !== 'nkda' &&
    allergyLower !== 'unknown' &&
    allergyLower !== 'none' &&
    visit.allergies.trim() !== ''

  if (hasKnownAllergy) {
    // Escalate if the complaint might relate to an allergic response
    const reactionTerms = ['rash', 'hive', 'itch', 'swell', 'reaction', 'allerg', 'anaphyl']
    const hasReaction = reactionTerms.some((t) =>
      visit.chiefComplaint.toLowerCase().includes(t)
    )
    if (hasReaction) {
      flags.push({
        reason: `Known allergy history + possible allergic reaction reported`,
        severity: 'urgent',
      })
    }
  }

  return flags
}

/**
 * Derive a single worst-case severity from a list of flags.
 * Returns 'routine' when no flags are present.
 */
export function overallSeverity(flags: TriageFlag[]): TriageSeverity {
  if (flags.some((f) => f.severity === 'critical')) return 'critical'
  if (flags.some((f) => f.severity === 'urgent')) return 'urgent'
  return 'routine'
}

// ── Structured summary ────────────────────────────────────────────────────────

const PAIN_LABEL: Record<string, string> = {
  mild: 'Mild (1–3)',
  moderate: 'Moderate (4–6)',
  severe: 'Severe (7–10)',
}

function painCategory(level: number): string {
  if (level >= 7) return PAIN_LABEL.severe
  if (level >= 4) return PAIN_LABEL.moderate
  return PAIN_LABEL.mild
}

/**
 * Generate a plain-text clinical intake brief from patient-reported intake data.
 *
 * ⚠️  FOR CLINICIAN REVIEW ONLY. This is NOT a diagnosis or clinical assessment.
 * It summarises patient self-reported information collected at kiosk check-in.
 */
export function generateVisitSummary(visit: PatientVisit): string {
  const date = new Date(visit.createdAt).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const lines = [
    `CLINICAL INTAKE BRIEF — ${date}`,
    `──────────────────────────────────────`,
    `Patient:         ${visit.patientName}`,
    `Queue Status:    ${visit.status}`,
    ``,
    `Chief Complaint: ${visit.chiefComplaint}`,
    `Duration:        ${visit.duration || 'Not specified'}`,
    `Pain Level:      ${visit.painLevel}/10 — ${painCategory(visit.painLevel)}`,
    `Known Allergies: ${visit.allergies || 'Not specified'}`,
    `Patient Consent: Confirmed at kiosk check-in`,
    ``,
    `──────────────────────────────────────`,
    `⚠️  DISCLAIMER: This brief summarises patient self-reported information`,
    `only. It is NOT a diagnosis, clinical assessment, or treatment plan.`,
    `All clinical decisions must be made by a qualified healthcare professional.`,
  ]

  return lines.join('\n')
}

