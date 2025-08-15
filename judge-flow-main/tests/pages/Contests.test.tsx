import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '@/lib/api';

// Mock data that matches the backend API response
const mockContestsResponse = {
  contests: [
    {
      id: 1,
      name: 'Weekly Contest 387',
      start_time: '2024-01-20T14:00:00Z',
      end_time: '2024-01-20T15:30:00Z',
      problem_count: 3,
      is_active: false,
    },
    {
      id: 2,
      name: 'Algorithm Masters Challenge',
      start_time: '2024-01-18T10:00:00Z',
      end_time: '2024-01-18T13:00:00Z',
      problem_count: 5,
      is_active: false,
    },
  ]
};

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
    is_active: false,
  }
};

describe('Contest API', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  it('should fetch all contests', async () => {
    // Mock the fetch function
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContestsResponse,
    } as Response);

    const data = await api.getContests();
    expect(data.contests).toHaveLength(2);
    expect(data.contests[0].name).toBe('Weekly Contest 387');
    
    // Verify fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith('/api/contests/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
  });

  it('should fetch a specific contest', async () => {
    // Mock the fetch function
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContestResponse,
    } as Response);

    const data = await api.getContest(1);
    expect(data.contest.name).toBe('Weekly Contest 387');
    expect(data.contest.problems).toHaveLength(2);
    
    // Verify fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith('/api/contests/1/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });
  });

  it('should handle fetch errors', async () => {
    // Mock the fetch function to return an error
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(api.getContests()).rejects.toThrow('Failed to fetch contests');
  });
});