import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Cleanup after each test
afterEach(() => {
  cleanup()
})
