import { describe, it, expect } from 'vitest'
import { generateInvitationCode } from '@/lib/invitation'

describe('Invitation Utilities', () => {
  describe('generateInvitationCode', () => {
    it('generates a 14-character code (12 chars + 2 dashes)', () => {
      const code = generateInvitationCode()
      expect(code).toHaveLength(14)
    })

    it('generates code with correct format (XXXX-XXXX-XXXX)', () => {
      const code = generateInvitationCode()
      const format = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
      expect(code).toMatch(format)
    })

    it('generates unique codes', () => {
      const code1 = generateInvitationCode()
      const code2 = generateInvitationCode()
      expect(code1).not.toBe(code2)
    })
  })
})
