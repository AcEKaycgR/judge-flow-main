import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Clock, 
  Target, 
  Calendar,
  Play,
  Code,
  Users,
  CheckCircle,
  XCircle,
  ClockIcon,
  Timer,
  Pause,
  RotateCw
} from 'lucide-react';
import { getContest, getContestSubmissions, submitContestSolution } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import CodeEditor from '@/components/common/CodeEditor';

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [timeSpent, setTimeSpent] = useState(0); // Time spent in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [countdownTime, setCountdownTime] = useState<number | null>(null); // Countdown in seconds

  // Fetch contest data using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['contest', id],
    queryFn: () => getContest(Number(id)),
    enabled: !!id,
  });
  
  // Fetch contest submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['contest-submissions', id],
    queryFn: () => getContestSubmissions(Number(id)),
    enabled: !!id,
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
        
        // Handle countdown if set
        if (countdownTime !== null && countdownTime > 0) {
          setCountdownTime(prev => prev! - 1);
        } else if (countdownTime === 0) {
          // Countdown finished
          setIsTimerRunning(false);
          toast({
            title: "Time's up!",
            description: "Your countdown timer has finished.",
          });
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, countdownTime, toast]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start/stop timer
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setTimeSpent(0);
    setCountdownTime(null);
    setIsTimerRunning(false);
  };

  // Set countdown
  const setCountdown = (minutes: number) => {
    setCountdownTime(minutes * 60);
    setIsTimerRunning(true);
  };

  const handleProblemSelect = (problemId: number) => {
    setSelectedProblem(problemId);
    setCode('');
  };

  // The submit functionality is now handled by the CodeEditor component

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data?.contest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contest Not Found</h1>
          <p className="text-muted-foreground mb-6">The contest you're looking for doesn't exist or an error occurred.</p>
          <Button asChild>
            <Link to="/contests">Back to Contests</Link>
          </Button>
        </div>
      </div>
    );
  }

  const contest = data.contest;
  const startTime = new Date(contest.start_time);
  const endTime = new Date(contest.end_time);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/contests">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Contests
                </Link>
              </Button>
              <div className="h-4 border-l border-border"></div>
              <h1 className="font-semibold text-lg">{contest.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {startTime.toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Contest Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{startTime.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>{contest.problems.length} problems</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Status: {contest.is_active ? 'Active' : 'Ended'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Problems List */}
            <Card>
              <CardHeader>
                <CardTitle>Problems</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contest.problems.map((problem) => (
                  <div 
                    key={problem.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProblem === problem.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleProblemSelect(problem.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{problem.title}</span>
                      </div>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : submissionsData?.submissions?.length > 0 ? (
                  <div className="space-y-3">
                    {submissionsData.submissions.map((submission: any) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {submission.status === 'accepted' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : submission.status === 'wrong_answer' ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-yellow-500" />
                            )}
                            <span className="font-medium">{submission.problem_title}</span>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {submission.language}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(submission.submitted_at).toLocaleTimeString()}</span>
                          {submission.runtime && (
                            <span>{submission.runtime}s</span>
                          )}
                          {submission.memory && (
                            <span>{submission.memory}MB</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No submissions yet. Submit a solution to see it here.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedProblem 
                      ? contest.problems.find(p => p.id === selectedProblem)?.title || 'Code Editor'
                      : 'Select a Problem'}
                  </CardTitle>
                  {selectedProblem && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {language.toUpperCase()}
                      </Badge>
                      {/* Timer Controls */}
                      <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {countdownTime !== null ? formatTime(countdownTime) : formatTime(timeSpent)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={toggleTimer}
                          className="h-6 w-6 p-0"
                        >
                          {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetTimer}
                          className="h-6 w-6 p-0"
                        >
                          <RotateCw className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCountdown(15)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            15
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCountdown(30)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            30
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCountdown(45)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            45
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedProblem ? (
                  <CodeEditor
                    problemId={selectedProblem}
                    initialCode={code}
                    language={language as any}
                    onLanguageChange={(lang) => setLanguage(lang)}
                    onRun={(code) => setCode(code)}
                    onSubmit={async (code, lang) => {
                      // Handle contest submission
                      try {
                        const result = await submitContestSolution({
                          contest_id: Number(id),
                          problem_id: selectedProblem,
                          code,
                          language: lang
                        });
                        
                        toast({
                          title: "Solution Submitted",
                          description: `Status: ${result.status}\nRuntime: ${result.runtime}s\nMemory: ${result.memory}MB`,
                        });
                        
                        // Reset code after successful submission
                        setCode('');
                      } catch (error) {
                        toast({
                          title: "Submission Failed",
                          description: "Failed to submit your solution. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    showSubmit={true}
                    className="h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Play className="h-12 w-12 mb-4" />
                    <p>Select a problem to start coding</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}