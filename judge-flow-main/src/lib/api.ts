// Utility function to get access token from sessionStorage
function getAccessToken(): string | null {
  const token = sessionStorage.getItem('accessToken');
  console.log('Getting access token from sessionStorage:', !!token);
  return token;
}

// Utility function to refresh access token
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = sessionStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem('accessToken', data.access);
      return data.access;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  // If refresh failed, clear tokens
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  return null;
}

// Utility function to make authenticated requests with automatic token refresh
async function authenticatedRequest(url: string, options: RequestInit = {}) {
  // Add authorization header
  const accessToken = getAccessToken();
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Debug logging
  console.log('Making authenticated request to:', url);
  console.log('Access token available:', !!accessToken);
  if (accessToken) {
    console.log('Authorization header set');
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Debug logging
  console.log('Response status:', response.status);
  console.log('Response headers:', [...response.headers.entries()]);

  // If unauthorized, try to refresh token and retry
  if (response.status === 401 && accessToken) {
    console.log('Received 401, trying to refresh token');
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log('Token refreshed successfully');
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
      console.log('Retry response status:', response.status);
    } else {
      console.log('Token refresh failed');
    }
  }

  return response;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface RunCodeData {
  code: string;
  language: string;
  input?: string;
}

interface SubmitSolutionData {
  problem_id: number;
  code: string;
  language: string;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  constraints: string;
  test_cases: {
    input_data: string;
    expected_output: string;
  }[];
}

interface SubmissionResponse {
  id: number;
  problem_id: number;
  problem_title: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'pending';
  language: string;
  runtime?: number;
  memory?: number;
  submitted_at: string;
  code: string;
  test_results?: any[];
}

interface ContestResponse {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  problem_count: number;
  is_active: boolean;
  problems?: Problem[];
}

interface DashboardData {
  stats: {
    total_submissions: number;
    accepted_submissions: number;
    accuracy: number;
    total_problems: number;
    solved_problems: number;
  };
  upcoming_contests: {
    id: number;
    name: string;
    start_time: string;
  }[];
}

interface UserProfile {
  user: {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
  };
}

interface AuthResponse {
  success: boolean;
  tokens?: {
    access: string;
    refresh: string;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
  };
  error?: string;
}

interface AIReviewData {
  submission_id?: number;
  code?: string;
  problem_text?: string;
}

interface ComprehensiveAIReviewResponse {
  feedback: string;
  overall_score: number;
  category_scores: Record<string, { total: number; solved: number }>;
  total_submissions: number;
  accepted_submissions: number;
  accuracy_rate: number;
  recommendations?: {
    practice_problems?: string[];
    courses?: { title: string; url: string }[];
    youtube_videos?: { title: string; url: string }[];
    errors_to_avoid?: string[];
  };
}

interface ProblemAIReviewResponse {
  feedback: string;
  overall_score: number;
  summary: string;
  hint: string;
  snippet: string;
}

interface ProgressDataPoint {
  date: string;
  total_submissions: number;
  accepted_submissions: number;
  accuracy_rate: number;
}

interface UserProgressResponse {
  progress_data: ProgressDataPoint[];
  category_breakdown: Record<string, { total: number; solved: number }>;
}

// Auth APIs
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const result = await response.json();
  
  // Store tokens if login was successful
  if (result.success && result.tokens) {
    console.log('Storing tokens in sessionStorage');
    sessionStorage.setItem('accessToken', result.tokens.access);
    sessionStorage.setItem('refreshToken', result.tokens.refresh);
    console.log('Access token stored:', !!sessionStorage.getItem('accessToken'));
    console.log('Refresh token stored:', !!sessionStorage.getItem('refreshToken'));
  }
  
  return result;
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/accounts/signup/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Signup failed');
  }
  
  const result = await response.json();
  
  // Store tokens if signup was successful
  if (result.success && result.tokens) {
    sessionStorage.setItem('accessToken', result.tokens.access);
    sessionStorage.setItem('refreshToken', result.tokens.refresh);
  }
  
  return result;
};

export const logout = async () => {
  // For JWT, logout is handled client-side by deleting the token
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  
  const response = await fetch(`${API_BASE_URL}/accounts/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/accounts/profile/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/accounts/dashboard/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  return response.json();
};

// Problems APIs
export const getProblems = async (params?: { search?: string; tags?: string; difficulty?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.tags) queryParams.append('tags', params.tags);
  if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
  
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/?${queryParams}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch problems');
  }
  
  return response.json();
};

export const getProblem = async (id: number): Promise<{ problem: Problem }> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/${id}/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch problem');
  }
  
  return response.json();
};

export const getPendingQuestions = async (params?: { approved?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.approved) queryParams.append('approved', params.approved);
  
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/pending-questions/?${queryParams}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending questions');
  }
  
  return response.json();
};

export const approvePendingQuestion = async (questionId: number) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/approve-pending-question/${questionId}/`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to approve question');
  }
  
  return response.json();
};

export const rejectPendingQuestion = async (questionId: number) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/reject-pending-question/${questionId}/`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to reject question');
  }
  
  return response.json();
};

export const submitSolution = async (data: SubmitSolutionData) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/compiler/submit-solution/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit solution');
  }
  
  return response.json();
};

export const getUserSubmissions = async (): Promise<{ submissions: SubmissionResponse[] }> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/submissions/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  
  return response.json();
};

export const getSubmission = async (submissionId: number) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/problems/submissions/${submissionId}/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }
  
  return response.json();
};

// Contests APIs
export const getContests = async (): Promise<{ contests: ContestResponse[] }> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/contests/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contests');
  }
  
  return response.json();
};

export const getContest = async (id: number): Promise<{ contest: ContestResponse }> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/contests/${id}/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contest');
  }
  
  return response.json();
};

export const getContestSubmissions = async (contestId: number) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/contests/${contestId}/submissions/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contest submissions');
  }
  
  return response.json();
};

export const createContest = async (data: any) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/contests/create/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create contest');
  }
  
  return response.json();
};

export const submitContestSolution = async (data: any) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/contests/submit/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit contest solution');
  }
  
  return response.json();
};

// Compiler APIs
export const runCode = async (data: RunCodeData) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/compiler/run-code/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to run code');
  }
  
  return response.json();
};

export const getAIReview = async (data: AIReviewData) => {
  const response = await authenticatedRequest(`${API_BASE_URL}/compiler/ai-review/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get AI review');
  }
  
  return response.json();
};

export const getComprehensiveAIReview = async (): Promise<ComprehensiveAIReviewResponse> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/ai-review/comprehensive-ai-review/`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get comprehensive AI review');
  }
  
  return response.json();
};

export const getProblemAIReview = async (problemId: number, code: string): Promise<ProblemAIReviewResponse> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/ai-review/problems/${problemId}/ai-review/`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get problem AI review');
  }
  
  return response.json();
};

export const getUserProgress = async (): Promise<UserProgressResponse> => {
  const response = await authenticatedRequest(`${API_BASE_URL}/ai-review/user-progress/`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user progress');
  }
  
  return response.json();
};