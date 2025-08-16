// Core types for the JudgeFlow platform
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  stats?: {
    solved: number;
    attempted: number;
    accuracy: number;
  };
}

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  constraints: string;
  examples?: {
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
  id: number;
  problem_id: number;
  problem_title: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'pending';
  language: string;
  runtime?: number;
  memory?: number;
  submitted_at: string; // ISO string format
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
  problems?: Problem[];
}

export interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIReview {
  id: number;
  submissionId: number;
  feedback: {
    type: 'tip' | 'warning' | 'improvement' | 'compliment';
    message: string;
    lineNumber?: number;
  }[];
  overallScore: number;
  suggestions: string[];
}

export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'go' | 'rust';