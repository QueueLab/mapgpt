import { expect, test, describe } from 'bun:test'
import {
  getUserColor,
  formatUserDisplayName,
  formatParticipantName
} from '../lib/utils/user-collaboration'
import type { Participant } from '../lib/types'

describe('User Collaboration Utilities', () => {
  describe('getUserColor', () => {
    test('returns consistent color for same identifier', () => {
      const color1 = getUserColor('user_12345')
      const color2 = getUserColor('user_12345')
      expect(color1).toBe(color2)
      expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    test('returns default color for empty identifier', () => {
      const color = getUserColor('')
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    test('generates valid hex colors for different users', () => {
      const color1 = getUserColor('ereq')
      const color2 = getUserColor('alice')
      expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(color2).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  describe('formatUserDisplayName', () => {
    test('prioritizes username when available', () => {
      const name = formatUserDisplayName({
        username: 'ereq',
        firstName: 'Ereq',
        fullName: 'Ereq User',
        primaryEmailAddress: { emailAddress: 'ereq@example.com' }
      })
      expect(name).toBe('ereq')
    })

    test('falls back to firstName when username is missing', () => {
      const name = formatUserDisplayName({
        username: null,
        firstName: 'John',
        fullName: 'John Doe',
        primaryEmailAddress: { emailAddress: 'john@example.com' }
      })
      expect(name).toBe('John')
    })

    test('falls back to email prefix when username and firstName are missing', () => {
      const name = formatUserDisplayName({
        username: null,
        firstName: null,
        primaryEmailAddress: { emailAddress: 'jane.doe@example.com' }
      })
      expect(name).toBe('jane.doe')
    })

    test('uses fallback identifier if user object is null but fallbackId is provided', () => {
      const name = formatUserDisplayName(null, 'collab@example.com')
      expect(name).toBe('collab')
    })

    test('returns null when user object and fallbackId are absent (unauthorized user)', () => {
      const name = formatUserDisplayName(null)
      expect(name).toBeNull()
    })
  })

  describe('formatParticipantName', () => {
    test('formats first and last name if present', () => {
      const participant: Participant = {
        id: 'p1',
        role: 'collaborator',
        userId: 'user_abc123',
        email: 'test@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        avatarUrl: null
      }
      expect(formatParticipantName(participant)).toBe('Alice Smith')
    })

    test('falls back to email prefix if name is absent', () => {
      const participant: Participant = {
        id: 'p2',
        role: 'collaborator',
        userId: 'user_xyz789',
        email: 'bob.builder@example.com',
        firstName: null,
        lastName: null,
        avatarUrl: null
      }
      expect(formatParticipantName(participant)).toBe('bob.builder')
    })

    test('falls back to truncated userId if email and name are absent', () => {
      const participant: Participant = {
        id: 'p3',
        role: 'collaborator',
        userId: 'user_1234567890',
        email: null,
        firstName: null,
        lastName: null,
        avatarUrl: null
      }
      expect(formatParticipantName(participant)).toBe('user_123')
    })
  })
})
