import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ContestDetail from '@/pages/ContestDetail';

// Mock data that matches the backend API response
const mockContestResponse = {
  contest: {
    id: 1,
    name: 'Weekly Contest 387',
    start_time: '2024-01-20T14:00:00Z',
    end_time: '2024-01-20T15:30:00Z',
    problems: [
      {
        id: 1,
        title: 'Two Sum',
        difficulty: 'easy',
      },
      {
        id: 2,
        title: 'Longest Common Subsequence',
        difficulty: 'medium',
      },
    ],
    is_active: true,
  }
};

// Create a query client for testing
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });
};

describe('ContestDetail', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  it('should render contest details', async () => {
    // Mock the fetch function
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContestResponse,
    } as Response);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/contests/1']}>
          <Routes>
            <Route path="/contests/:id" element={<ContestDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Contest 387')).toBeInTheDocument();
    });

    // Check that contest details are rendered
    expect(screen.getByText('Two Sum')).toBeInTheDocument();
    expect(screen.getByText('Longest Common Subsequence')).toBeInTheDocument();
    
    // Verify fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith('/api/contests/1/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
  });

  it('should show loading state', async () => {
    // Mock the fetch function to delay response
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => mockContestResponse,
          } as Response);
        }, 100);
      });
    });

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/contests/1']}>
          <Routes>
            <Route path="/contests/:id" element={<ContestDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should show loading spinner initially
    expect(screen.getByText('', { selector: '.animate-spin' })).toBeInTheDocument();
  });

  it('should handle fetch errors', async () => {
    // Mock the fetch function to return an error
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/contests/1']}>
          <Routes>
            <Route path="/contests/:id" element={<ContestDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText('Contest Not Found')).toBeInTheDocument();
    });
  });
});