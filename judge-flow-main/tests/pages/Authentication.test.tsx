import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../src/pages/Login'
import Signup from '../../src/pages/Signup'
import * as api from '../../src/lib/api'

// Mock the API functions
vi.mock('../../src/lib/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
}))

// Mock the toast hook
vi.mock('../../src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Authentication Flow', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('Login Component', () => {
    it('should render login form correctly', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
      
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('should show error when submitting empty form', async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
      
      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      await user.click(submitButton)
      
      // We can't easily test the toast notification, but we can verify the form prevents submission
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should call login API with correct credentials', async () => {
      const mockLoginResponse = {
        success: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
      }
      
      ;(api.login as jest.Mock).mockResolvedValue(mockLoginResponse)
      
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
      
      // Fill in the form
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      await user.click(submitButton)
      
      // Check that the login API was called with correct data
      await waitFor(() => {
        expect(api.login).toHaveBeenCalledWith({
          username: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should navigate to dashboard on successful login', async () => {
      const mockLoginResponse = {
        success: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
      }
      
      ;(api.login as jest.Mock).mockResolvedValue(mockLoginResponse)
      
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
      
      // Fill in the form
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      await user.click(submitButton)
      
      // Check that navigation occurred
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should show error message on failed login', async () => {
      ;(api.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'))
      
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
      
      // Fill in the form
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'wrongpassword')
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      await user.click(submitButton)
      
      // We can't easily test the toast notification, but we can verify navigation doesn't occur
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('Signup Component', () => {
    it('should render signup form correctly', () => {
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      )
      
      expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
    })

    it('should show error when submitting empty form', async () => {
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      )
      
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      await user.click(submitButton)
      
      // We can't easily test the toast notification, but we can verify the form prevents submission
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should call signup API with correct data', async () => {
      const mockSignupResponse = {
        success: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
      }
      
      ;(api.signup as jest.Mock).mockResolvedValue(mockSignupResponse)
      
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      )
      
      // Fill in the form
      await user.type(screen.getByLabelText('Username'), 'testuser')
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText('Confirm Password'), 'password123')
      
      // Check the terms checkbox
      await user.click(screen.getByLabelText(/I agree to the/i))
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      await user.click(submitButton)
      
      // Check that the signup API was called with correct data
      await waitFor(() => {
        expect(api.signup).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should navigate to dashboard on successful signup', async () => {
      const mockSignupResponse = {
        success: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
      }
      
      ;(api.signup as jest.Mock).mockResolvedValue(mockSignupResponse)
      
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      )
      
      // Fill in the form
      await user.type(screen.getByLabelText('Username'), 'testuser')
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText('Confirm Password'), 'password123')
      
      // Check the terms checkbox
      await user.click(screen.getByLabelText(/I agree to the/i))
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      await user.click(submitButton)
      
      // Check that navigation occurred
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should show error message on failed signup', async () => {
      ;(api.signup as jest.Mock).mockRejectedValue(new Error('Username already exists'))
      
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      )
      
      // Fill in the form
      await user.type(screen.getByLabelText('Username'), 'existinguser')
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText('Confirm Password'), 'password123')
      
      // Check the terms checkbox
      await user.click(screen.getByLabelText(/I agree to the/i))
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      await user.click(submitButton)
      
      // We can't easily test the toast notification, but we can verify navigation doesn't occur
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })
})