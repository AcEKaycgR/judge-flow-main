import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Clock, 
  MemoryStick, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Download,
  Copy
} from 'lucide-react';
import { getSubmission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/common/StatusBadge';
import CodeEditor from '@/components/common/CodeEditor';

interface TestCaseResult {
  test_case_id: number;
  passed: boolean;
  input: string;
  expected_output: string;
  actual_output: string;
  error: string | null;
}

interface Submission {
  id: number;
  problem_id: number;
  problem_title: string;
  code: string;
  language: string;
  status: string;
  runtime: number | null;
  memory: number | null;
  test_case_results: TestCaseResult[] | null;
  submitted_at: string;
}

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error('No submission ID provided');
        }
        
        const data = await getSubmission(parseInt(id));
        setSubmission(data.submission);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission. Please try again later.');
        console.error('Error fetching submission:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  const handleCopyCode = () => {
    if (submission) {
      navigator.clipboard.writeText(submission.code);
      toast({
        title: "Code copied",
        description: "Your code has been copied to the clipboard.",
      });
    }
  };

  const handleDownloadCode = () => {
    if (submission) {
      const blob = new Blob([submission.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission-${submission.id}-${submission.problem_title.replace(/\s+/g, '-')}.${getExtension(submission.language)}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Code downloaded",
        description: "Your code has been downloaded as a file.",
      });
    }
  };

  const getExtension = (language: string) => {
    const extensions: Record<string, string> = {
      'javascript': 'js',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rust': 'rs'
    };
    return extensions[language] || 'txt';
  };

  const getLanguageDisplay = (language: string) => {
    const languageMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust'
    };
    return languageMap[language] || language;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="Loading"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive mb-4">{error}</p>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Submission not found</h1>
          <Link to="/submissions">
            <Button variant="outline">Back to Submissions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/submissions">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Submission #{submission.id}
              </h1>
              <Link 
                to={`/questions/${submission.problem_id}`} 
                className="text-lg text-muted-foreground hover:underline"
              >
                {submission.problem_title}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadCode}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Code */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Submitted Code
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getLanguageDisplay(submission.language)}
                  </Badge>
                  <StatusBadge status={submission.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CodeEditor
                initialCode={submission.code}
                language={submission.language as any}
                readOnly={true}
                className="h-[500px]"
              />
              
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  {submission.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{submission.runtime.toFixed(3)}s</span>
                    </div>
                  )}
                  {submission.memory && (
                    <div className="flex items-center gap-1">
                      <MemoryStick className="h-4 w-4" />
                      <span>{submission.memory.toFixed(2)}MB</span>
                    </div>
                  )}
                </div>
                <span>
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Test Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.test_case_results && submission.test_case_results.length > 0 ? (
                <div className="space-y-4">
                  {submission.test_case_results.map((testCase, index) => (
                    <div 
                      key={testCase.test_case_id} 
                      className={`p-4 rounded-lg border ${
                        testCase.passed 
                          ? 'border-success/20 bg-success/5' 
                          : 'border-destructive/20 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">
                          Test Case {index + 1}
                        </h3>
                        <Badge 
                          variant={testCase.passed ? 'success' : 'destructive'}
                          className="flex items-center gap-1"
                        >
                          {testCase.passed ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Passed
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Failed
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Input:</h4>
                          <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap">
                            {testCase.input}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Expected Output:</h4>
                          <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap">
                            {testCase.expected_output}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Your Output:</h4>
                          <pre className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap">
                            {testCase.actual_output || 'No output'}
                          </pre>
                        </div>
                        
                        {testCase.error && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 text-destructive">Error:</h4>
                            <pre className="text-xs bg-destructive/10 p-2 rounded text-destructive whitespace-pre-wrap">
                              {testCase.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}