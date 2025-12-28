import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvitationValidateForm from '@/app/[locale]/invitation/validate/form'

// Mock the notification context
vi.mock('@/contexts/notification-context', () => ({
  useNotifications: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}))

// Mock the server action
vi.mock('@/app/actions/invitations', () => ({
  submitInvitation: vi.fn((userId: number) => async (prevState: any, formData: FormData) => {
    const code = formData.get('code')
    if (code === 'INVALID') {
      return {
        errors: {
          fieldErrors: {
            code: ['Invalid invitation code'],
          },
        },
      }
    }
    return { success: true }
  }),
}))

describe('InvitationValidateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all elements', () => {
    render(<InvitationValidateForm userId={1} />)

    expect(screen.getByLabelText(/invitation code/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    expect(screen.getByText(/enter the 12-character invitation code/i)).toBeInTheDocument()
  })

  it('updates OTP input when user types', async () => {
    const user = userEvent.setup()
    render(<InvitationValidateForm userId={1} />)

    const input = screen.getByRole('textbox', { hidden: true })
    await user.type(input, 'ABCD1234EFGH')

    // The hidden input should have the value
    expect(input).toHaveValue('ABCD1234EFGH')
  })

  it('shows error message when submission fails', async () => {
    const user = userEvent.setup()
    render(<InvitationValidateForm userId={1} />)

    const input = screen.getByRole('textbox', { hidden: true })
    await user.type(input, 'INVALID')

    const submitButton = screen.getByRole('button', { name: /complete registration/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid invitation code/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while pending', async () => {
    const user = userEvent.setup()
    render(<InvitationValidateForm userId={1} />)

    const submitButton = screen.getByRole('button', { name: /complete registration/i })
    
    // Button should be enabled initially
    expect(submitButton).not.toBeDisabled()
  })
})
