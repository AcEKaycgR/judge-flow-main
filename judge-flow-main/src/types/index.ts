// Core types for the JudgeFlow platform
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  stats: {
    solved: number;
    attempted: number;
    accuracy: number;
  };
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  constraints: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases?: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface Submission {
  id: string;
  questionId: string;
  questionTitle: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'pending';
  language: string;
  runtime?: number;
  memory?: number;
  submittedAt: Date;
  code: string;
}

export interface Contest {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  problem_count: number;
  is_active: boolean;
  // These fields are computed on the frontend
  duration?: number;
  status?: 'upcoming' | 'active' | 'ended';
}

export interface AIReview {
  id: string;
  submissionId: string;
  feedback: {
    type: 'tip' | 'warning' | 'improvement' | 'compliment';
    message: string;
    lineNumber?: number;
  }[];
  overallScore: number;
  suggestions: string[];
}

export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'go' | 'rust';