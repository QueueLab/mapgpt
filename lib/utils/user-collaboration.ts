import type { Participant } from '@/lib/types'

const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
]

export function getUserColor(identifier: string): string {
  if (!identifier) return COLOR_PALETTE[0]
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length
  return COLOR_PALETTE[index]
}

export function formatUserDisplayName(
  clerkUser?: {
    username?: string | null
    firstName?: string | null
    fullName?: string | null
    primaryEmailAddress?: { emailAddress?: string | null } | null
  } | null,
  fallbackId?: string
): string {
  if (clerkUser) {
    if (clerkUser.username) return clerkUser.username
    if (clerkUser.firstName) return clerkUser.firstName
    if (clerkUser.fullName) return clerkUser.fullName
    if (clerkUser.primaryEmailAddress?.emailAddress) {
      return clerkUser.primaryEmailAddress.emailAddress.split('@')[0]
    }
  }
  if (fallbackId) {
    if (fallbackId.includes('@')) {
      return fallbackId.split('@')[0]
    }
    return fallbackId.slice(0, 8)
  }
  return 'ereq' // Default fallback matching system user preview
}

export function formatParticipantName(participant: Participant): string {
  if (participant.firstName || participant.lastName) {
    return `${participant.firstName || ''} ${participant.lastName || ''}`.trim()
  }
  if (participant.email) {
    return participant.email.split('@')[0]
  }
  return participant.userId.slice(0, 8)
}
