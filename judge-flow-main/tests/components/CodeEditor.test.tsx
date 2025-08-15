import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CodeEditor from '@/components/common/CodeEditor';
import * as api from '@/lib/api';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the runCode API function
vi.mock('@/lib/api', () => ({
  runCode: vi.fn(),
  submitSolution: vi.fn(),
}));

describe('CodeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the code editor with default values', () => {
    render(<CodeEditor />);
    
    // Get the code editor by role and name
    const codeEditors = screen.getAllByRole('textbox');
    expect(codeEditors).toHaveLength(2); // code editor and input editor
    
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('allows typing in the code editor', () => {
    render(<CodeEditor />);
    
    // Get the first textbox which is the code editor
    const codeEditors = screen.getAllByRole('textbox');
    const codeEditor = codeEditors[0];
    fireEvent.change(codeEditor, { target: { value: 'console.log("Hello World");' } });
    
    expect(codeEditor).toHaveValue('console.log("Hello World");');
  });

  it('allows changing the language', () => {
    render(<CodeEditor />);
    
    const languageSelect = screen.getByText('JavaScript');
    fireEvent.click(languageSelect);
    
    const pythonOption = screen.getByText('Python');
    fireEvent.click(pythonOption);
    
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('calls runCode API when Run button is clicked', async () => {
    const mockRunCode = vi.fn().mockResolvedValue({ output: 'Hello World\n', error: false });
    (api.runCode as vi.Mock).mockImplementation(mockRunCode);
    
    render(<CodeEditor />);
    
    // Get the first textbox which is the code editor
    const codeEditors = screen.getAllByRole('textbox');
    const codeEditor = codeEditors[0];
    fireEvent.change(codeEditor, { target: { value: 'print("Hello World")' } });
    
    const runButton = screen.getByText('Run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(mockRunCode).toHaveBeenCalledWith({
        code: 'print("Hello World")',
        language: 'javascript',
        input: '',
      });
    });
  });

  it('displays output when code is executed successfully', async () => {
    const mockRunCode = vi.fn().mockResolvedValue({ output: 'Hello World\n', error: false });
    (api.runCode as vi.Mock).mockImplementation(mockRunCode);
    
    render(<CodeEditor />);
    
    const runButton = screen.getByText('Run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText('Output')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('displays error message when code execution fails', async () => {
    const mockRunCode = vi.fn().mockRejectedValue(new Error('API Error'));
    (api.runCode as vi.Mock).mockImplementation(mockRunCode);
    
    render(<CodeEditor />);
    
    const runButton = screen.getByText('Run');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByText('Output')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to execute code. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows loading state while code is executing', async () => {
    (api.runCode as vi.Mock).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ output: 'Done', error: false }), 100);
    }));
    
    render(<CodeEditor />);
    
    const runButton = screen.getByText('Run');
    fireEvent.click(runButton);
    
    expect(screen.getByText('Running...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Run')).toBeInTheDocument(); // Button text changes back
    });
  });

  it('allows entering input data', () => {
    render(<CodeEditor />);
    
    // Get the second textbox which is the input editor
    const codeEditors = screen.getAllByRole('textbox');
    const inputEditor = codeEditors[1];
    fireEvent.change(inputEditor, { target: { value: 'Test input data' } });
    
    expect(inputEditor).toHaveValue('Test input data');
  });

  it('calls onSubmit when Submit button is clicked', () => {
    const mockOnSubmit = vi.fn();
    render(<CodeEditor showSubmit={true} problemId={1} onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});