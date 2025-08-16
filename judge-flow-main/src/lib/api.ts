// API client for connecting frontend to Django backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

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
  };
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
export const login = async (data: LoginData) => {
  const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  return response.json();
};

export const signup = async (data: SignupData) => {
  const response = await fetch(`${API_BASE_URL}/accounts/signup/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Signup failed');
  }
  
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/accounts/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  return response.json();
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE_URL}/accounts/dashboard/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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
  
  const response = await fetch(`${API_BASE_URL}/problems/?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch problems');
  }
  
  return response.json();
};

export const getProblem = async (id: number): Promise<{ problem: Problem }> => {
  const response = await fetch(`${API_BASE_URL}/problems/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch problem');
  }
  
  return response.json();
};

export const submitSolution = async (data: SubmitSolutionData) => {
  const response = await fetch(`${API_BASE_URL}/compiler/submit-solution/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit solution');
  }
  
  return response.json();
};

export const getUserSubmissions = async (): Promise<{ submissions: SubmissionResponse[] }> => {
  const response = await fetch(`${API_BASE_URL}/problems/submissions/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  
  return response.json();
};

export const getSubmission = async (submissionId: number) => {
  const response = await fetch(`${API_BASE_URL}/problems/submissions/${submissionId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }
  
  return response.json();
};

// Contests APIs
export const getContests = async (): Promise<{ contests: ContestResponse[] }> => {
  const response = await fetch(`${API_BASE_URL}/contests/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contests');
  }
  
  return response.json();
};

export const getContest = async (id: number): Promise<{ contest: ContestResponse }> => {
  const response = await fetch(`${API_BASE_URL}/contests/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contest');
  }
  
  return response.json();
};

export const getContestSubmissions = async (contestId: number) => {
  const response = await fetch(`${API_BASE_URL}/contests/${contestId}/submissions/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contest submissions');
  }
  
  return response.json();
};

export const createContest = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/contests/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to create contest');
  }
  
  return response.json();
};

export const submitContestSolution = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/contests/submit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit contest solution');
  }
  
  return response.json();
};

// Compiler APIs
export const runCode = async (data: RunCodeData) => {
  const response = await fetch(`${API_BASE_URL}/compiler/run-code/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to run code');
  }
  
  return response.json();
};

export const getAIReview = async (data: AIReviewData) => {
  const response = await fetch(`${API_BASE_URL}/compiler/ai-review/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get AI review');
  }
  
  return response.json();
};

export const getComprehensiveAIReview = async (): Promise<ComprehensiveAIReviewResponse> => {
  const response = await fetch(`${API_BASE_URL}/ai-review/comprehensive-ai-review/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get comprehensive AI review');
  }
  
  return response.json();
};

export const getProblemAIReview = async (problemId: number, code: string): Promise<ProblemAIReviewResponse> => {
  const response = await fetch(`${API_BASE_URL}/ai-review/problems/${problemId}/ai-review/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get problem AI review');
  }
  
  return response.json();
};

export const getUserProgress = async (): Promise<UserProgressResponse> => {
  const response = await fetch(`${API_BASE_URL}/ai-review/user-progress/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user progress');
  }
  
  return response.json();
};