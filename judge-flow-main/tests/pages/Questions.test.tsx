import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Questions from '../../src/pages/Questions'
import * as api from '../../src/lib/api'

// Mock the API functions
vi.mock('../../src/lib/api', () => ({
  getProblems: vi.fn(),
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

describe('Questions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    // Mock API functions to return promises that never resolve
    (api.getProblems as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <Questions />
      </BrowserRouter>
    )
    
    // Check if loading indicator is present
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('should fetch and display problems data', async () => {
    // Mock API responses
    const mockProblems = [
      {
        id: 1,
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        tags: ['Array', 'Hash Table'],
        constraints: '2 ≤ nums.length ≤ 10⁴\
-10⁹ ≤ nums[i] ≤ 10⁹\
-10⁹ ≤ target ≤ 10⁹',
        examples: [
          {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ]
      },
      {
        id: 2,
        title: 'Longest Common Subsequence',
        description: 'Given two strings text1 and text2, return the length of their longest common subsequence.',
        difficulty: 'medium',
        tags: ['Dynamic Programming', 'String'],
        constraints: '1 ≤ text1.length, text2.length ≤ 1000',
        examples: [
          {
            input: 'text1 = "abcde", text2 = "ace"',
            output: '3',
            explanation: 'The longest common subsequence is "ace" and its length is 3.'
          }
        ]
      }
    ]

    ;(api.getProblems as jest.Mock).mockResolvedValue(mockProblems)

    render(
      <BrowserRouter>
        <Questions />
      </BrowserRouter>
    )
    
    // Wait for the component to update with the data
    await waitFor(() => {
      expect(screen.getByText('Two Sum')).toBeInTheDocument()
      expect(screen.getByText('Longest Common Subsequence')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    // Mock API to throw an error
    ;(api.getProblems as jest.Mock).mockRejectedValue(new Error('Failed to fetch'))

    render(
      <BrowserRouter>
        <Questions />
      </BrowserRouter>
    )
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch problems. Please try again later.')).toBeInTheDocument()
    })
  })
})