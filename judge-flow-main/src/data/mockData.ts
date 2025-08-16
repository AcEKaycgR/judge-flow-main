import { User, Question, Submission, Contest, AIReview } from '@/types';

export const mockUser: User = {
  id: 1,
  username: 'coder_alex',
  email: 'alex@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  stats: {
    solved: 127,
    attempted: 189,
    accuracy: 67
  }
};

export const mockQuestions: Question[] = [
  {
    id: 1,
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table'],
    constraints: '2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹'
  },
  {
    id: 2,
    title: 'Longest Common Subsequence',
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence.',
    difficulty: 'medium',
    tags: ['Dynamic Programming', 'String'],
    constraints: '1 ≤ text1.length, text2.length ≤ 1000'
  },
  {
    id: 3,
    title: 'Merge k Sorted Lists',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.',
    difficulty: 'hard',
    tags: ['Linked List', 'Divide and Conquer', 'Heap'],
    constraints: 'k == lists.length\n0 ≤ k ≤ 10⁴'
  },
  {
    id: 4,
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'easy',
    tags: ['String', 'Stack'],
    constraints: '1 ≤ s.length ≤ 10⁴'
  },
  {
    id: 5,
    title: 'Binary Tree Maximum Path Sum',
    description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them.',
    difficulty: 'hard',
    tags: ['Binary Tree', 'Dynamic Programming', 'Tree'],
    constraints: 'The number of nodes in the tree is in the range [1, 3 * 10⁴]'
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: 1,
    problem_id: 1,
    problem_title: 'Two Sum',
    status: 'accepted',
    language: 'javascript',
    runtime: 68,
    memory: 42.1,
    submitted_at: '2024-01-15T10:30:00Z',
    code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}'
  },
  {
    id: 2,
    problem_id: 2,
    problem_title: 'Longest Common Subsequence',
    status: 'wrong_answer',
    language: 'python',
    submitted_at: '2024-01-14T15:45:00Z',
    code: 'def longestCommonSubsequence(text1, text2):\n    # incomplete solution\n    return 0'
  },
  {
    id: 3,
    problem_id: 4,
    problem_title: 'Valid Parentheses',
    status: 'accepted',
    language: 'java',
    runtime: 1,
    memory: 40.2,
    submitted_at: '2024-01-13T09:20:00Z',
    code: 'public boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    // implementation\n}'
  }
];

export const mockContests: Contest[] = [
  {
    id: 1,
    name: 'Weekly Contest 387',
    start_time: '2024-01-20T14:00:00Z',
    end_time: '2024-01-20T15:30:00Z',
    problem_count: 3,
    is_active: false
  },
  {
    id: 2,
    name: 'Algorithm Masters Challenge',
    start_time: '2024-01-18T10:00:00Z',
    end_time: '2024-01-18T13:00:00Z',
    problem_count: 3,
    is_active: false
  }
];

export const mockAIReview: AIReview = {
  id: 1,
  submissionId: 1,
  feedback: [
    {
      type: 'compliment',
      message: 'Great use of HashMap for O(1) lookup time!'
    },
    {
      type: 'tip',
      message: 'Consider adding input validation for edge cases.',
      lineNumber: 2
    },
    {
      type: 'improvement',
      message: 'You could optimize memory usage by checking if the array length is less than 2.',
      lineNumber: 1
    }
  ],
  overallScore: 85,
  suggestions: [
    'Add comments explaining the algorithm approach',
    'Consider handling edge cases explicitly',
    'Great time complexity optimization!'
  ]
};

export const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' }
];

export const questionTags = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
  'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Tree',
  'Breadth-First Search', 'Design', 'Two Pointers', 'Bit Manipulation',
  'Stack', 'Heap', 'Graph', 'Backtracking', 'Simulation', 'Counting'
];