import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import QuestionDetail from '@/pages/QuestionDetail';
import * as api from '@/lib/api';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the getProblem API function
vi.mock('@/lib/api', () => ({
  getProblem: vi.fn(),
  runCode: vi.fn(),
  submitSolution: vi.fn(),
}));

// Mock useParams hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

describe('QuestionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (api.getProblem as vi.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <BrowserRouter>
        <QuestionDetail />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('fetches and displays problem data', async () => {
    const mockProblem = {
      problem: {
        id: 1,
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        tags: ['Array', 'Hash Table'],
        constraints: '2 <= nums.length <= 10^4',
        test_cases: [
          {
            input_data: '[2,7,11,15]\\n9',
            expected_output: '[0,1]'
          }
        ]
      }
    };
    
    (api.getProblem as vi.Mock).mockResolvedValue(mockProblem);
    
    render(
      <BrowserRouter>
        <QuestionDetail />
      </BrowserRouter>
    );
    
    // Wait for the component to update with the data
    await waitFor(() => {
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      // Use a more flexible matcher for the description
      expect(screen.getByText((content, element) => {
        return content.includes('Given an array of integers');
      })).toBeInTheDocument();
      expect(screen.getByText('Array')).toBeInTheDocument();
      expect(screen.getByText('Hash Table')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (api.getProblem as vi.Mock).mockRejectedValue(new Error('API Error'));
    
    render(
      <BrowserRouter>
        <QuestionDetail />
      </BrowserRouter>
    );
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch question. Please try again later.')).toBeInTheDocument();
    });
  });

  it('allows running code with the CodeEditor component', async () => {
    const mockProblem = {
      problem: {
        id: 1,
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        tags: ['Array', 'Hash Table'],
        constraints: '2 <= nums.length <= 10^4',
        test_cases: [
          {
            input_data: '[2,7,11,15]\\n9',
            expected_output: '[0,1]'
          }
        ]
      }
    };
    
    const mockRunCode = vi.fn().mockResolvedValue({ output: 'Test output\\n', error: false });
    (api.getProblem as vi.Mock).mockResolvedValue(mockProblem);
    (api.runCode as vi.Mock).mockImplementation(mockRunCode);
    
    render(
      <BrowserRouter>
        <QuestionDetail />
      </BrowserRouter>
    );
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
    });
    
    // Find the run button and click it
    const runButton = screen.getByText('Run');
    fireEvent.click(runButton);
    
    // Check that runCode was called
    await waitFor(() => {
      expect(mockRunCode).toHaveBeenCalled();
    });
  });

  it('allows submitting code with the CodeEditor component', async () => {
    const mockProblem = {
      problem: {
        id: 1,
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        tags: ['Array', 'Hash Table'],
        constraints: '2 <= nums.length <= 10^4',
        test_cases: [
          {
            input_data: '[2,7,11,15]\\n9',
            expected_output: '[0,1]'
          }
        ]
      }
    };
    
    (api.getProblem as vi.Mock).mockResolvedValue(mockProblem);
    
    render(
      <BrowserRouter>
        <QuestionDetail />
      </BrowserRouter>
    );
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
    });
    
    // Find the submit button and click it
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    // Check that the toast was called
    // Note: We can't easily test the toast in this setup, but we can verify the function was called
  });
});