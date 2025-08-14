import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '../../src/pages/Dashboard'
import * as api from '../../src/lib/api'

// Mock the API functions
vi.mock('../../src/lib/api', () => ({
  getProfile: vi.fn(),
  getDashboardData: vi.fn(),
}))

// Mock the react-router-dom Link component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

// Mock the CountdownTimer component
vi.mock('../../src/components/common/CountdownTimer', () => ({
  default: ({ targetDate }: { targetDate: Date }) => (
    <div>Countdown Timer: {targetDate.toString()}</div>
  ),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    // Mock API functions to return promises that never resolve
    (api.getProfile as jest.Mock).mockImplementation(() => new Promise(() => {}))
    ;(api.getDashboardData as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<Dashboard />)
    
    // Check if loading indicator is present
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('should fetch and display user profile data', async () => {
    // Mock API responses
    const mockProfile = {
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      },
    }
    
    const mockDashboardData = {
      stats: {
        total_submissions: 10,
        accepted_submissions: 8,
        accuracy: 80,
        total_problems: 50,
        solved_problems: 25,
      },
      upcoming_contests: [
        {
          id: '1',
          name: 'Weekly Contest',
          start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        },
      ],
    }

    ;(api.getProfile as jest.Mock).mockResolvedValue(mockProfile)
    ;(api.getDashboardData as jest.Mock).mockResolvedValue(mockDashboardData)

    render(<Dashboard />)
    
    // Wait for the component to update with the data
    await waitFor(() => {
      expect(screen.getByText(`Welcome back, ${mockProfile.user.username}! 👋`)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    // Mock API to throw an error
    ;(api.getProfile as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))
    ;(api.getDashboardData as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(<Dashboard />)
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument()
    })
  })
})