// API client for connecting frontend to Django backend
const API_BASE_URL = '/api';

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

interface AIReviewData {
  submission_id?: number;
  code?: string;
  problem_text?: string;
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
    credentials: 'same-origin',
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
    credentials: 'same-origin',
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
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  return response.json();
};

export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
};

export const getDashboardData = async () => {
  const response = await fetch(`${API_BASE_URL}/accounts/dashboard/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
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
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch problems');
  }
  
  return response.json();
};

export const getProblem = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/problems/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
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
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit solution');
  }
  
  return response.json();
};

export const getUserSubmissions = async () => {
  const response = await fetch(`${API_BASE_URL}/problems/submissions/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
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
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }
  
  return response.json();
};

// Contests APIs
export const getContests = async () => {
  const response = await fetch(`${API_BASE_URL}/contests/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch contests');
  }
  
  return response.json();
};

export const getContest = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/contests/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
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
    credentials: 'same-origin',
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
    credentials: 'same-origin',
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
    credentials: 'same-origin',
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
    credentials: 'same-origin',
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
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get AI review');
  }
  
  return response.json();
};

export const getComprehensiveAIReview = async () => {
  const response = await fetch(`${API_BASE_URL}/ai-review/comprehensive-ai-review/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get comprehensive AI review');
  }
  
  return response.json();
};

export const getProblemAIReview = async (problemId: number, code: string) => {
  const response = await fetch(`${API_BASE_URL}/ai-review/problem-ai-review/${problemId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken() || '',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get problem AI review');
  }
  
  return response.json();
};