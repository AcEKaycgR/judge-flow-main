import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  PlayCircle, 
  Share, 
  Bookmark,
  ThumbsUp,
  MessageCircle,
  AlertCircle,
  Target,
  BookOpen,
  Youtube
} from 'lucide-react';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import CodeEditor from '@/components/common/CodeEditor';
import { Language } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getProblem } from '@/lib/api';

interface Question {
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

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isConstraintsOpen, setIsConstraintsOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error('No question ID provided');
        }
        const data = await getProblem(Number(id));
        // Transform the API response to match our interface
        setQuestion({
          id: data.problem.id,
          title: data.problem.title,
          description: data.problem.description,
          difficulty: data.problem.difficulty,
          tags: data.problem.tags,
          constraints: data.problem.constraints,
          test_cases: data.problem.test_cases
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch question. Please try again later.');
        console.error('Error fetching question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

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
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive mb-4">{error}</p>
          <Button 
            onClick={() => navigate('/questions')} 
            variant="outline"
          >
            Back to Questions
          </Button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Question not found</h1>
          <Link to="/questions">
            <Button variant="outline">Back to Questions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRun = (code: string, language: Language) => {
    toast({
      title: "Code executed",
      description: `Your ${language} code ran successfully!`,
    });
  };

  const handleSubmit = (code: string, language: Language) => {
    // The actual submit logic is handled by the CodeEditor component
    // This function is called after successful submission
    // We don't need to show a generic toast here since the CodeEditor shows detailed results
  };

  const handleAIReview = async () => {
    if (!question || !id) return;
    
    setIsAILoading(true);
    try {
      const data = await getProblemAIReview(Number(id), code);
      setAiFeedback(data.feedback);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/questions">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-4 border-l border-border"></div>
              <h1 className="font-semibold truncate">{question.title}</h1>
              <DifficultyBadge difficulty={question.difficulty} />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ai" className="gap-2">
                <Brain className="h-4 w-4" />
                AI Review
              </Button>
              <Button variant="ghost" size="icon">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-8rem)]">
          {/* Left Panel - Problem Description */}
          <div className="border-r border-border bg-background">
            <div className="p-6 space-y-6 h-full overflow-y-auto">
              {/* Problem Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {question.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>1.2k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>234</span>
                  </div>
                  <span>Acceptance Rate: 67.3%</span>
                </div>
              </div>

              {/* Problem Content */}
              <div className="space-y-4">
                {/* Description */}
                <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                    <h2 className="text-lg font-semibold">Problem Description</h2>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-foreground leading-relaxed">
                          {question.description}
                        </p>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                {/* Examples */}
                <Collapsible open={isExamplesOpen} onOpenChange={setIsExamplesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                    <h2 className="text-lg font-semibold">Examples</h2>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isExamplesOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-4">
                      {question.test_cases.map((test_case, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">Example {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Input:</h4>
                              <code className="text-sm bg-muted/50 p-2 rounded block">
                                {test_case.input_data}
                              </code>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Output:</h4>
                              <code className="text-sm bg-muted/50 p-2 rounded block">
                                {test_case.expected_output}
                              </code>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Constraints */}
                <Collapsible open={isConstraintsOpen} onOpenChange={setIsConstraintsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                    <h2 className="text-lg font-semibold">Constraints</h2>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isConstraintsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <Card>
                      <CardContent className="p-6">
                        <pre className="text-sm text-muted-foreground whitespace-pre-line">
                          {question.constraints}
                        </pre>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="bg-background">
            <div className="p-6 h-full">
              <Tabs defaultValue="code" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                  <TabsTrigger value="ai-review">AI Review</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="flex-1 mt-0">
                  <CodeEditor
                    problemId={question.id}
                    code={code}
                    onCodeChange={setCode}
                    initialInput={question.test_cases.length > 0 ? question.test_cases[0].input_data : ''}
                    language={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                    showSubmit={true}
                    className="h-full"
                  />
                </TabsContent>
                
                <TabsContent value="submissions" className="flex-1 mt-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Your Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No submissions yet</p>
                        <p className="text-sm">Submit your solution to see it here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ai-review" className="flex-1 mt-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        AI Code Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isAILoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                          <p className="text-muted-foreground">Analyzing your code...</p>
                        </div>
                      ) : aiFeedback ? (
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{aiFeedback}</pre>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center py-8">
                            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">Get AI-powered feedback on your code</p>
                            <Button 
                              onClick={handleAIReview} 
                              disabled={!code.trim()}
                              className="gap-2"
                            >
                              <Brain className="h-4 w-4" />
                              Analyze My Code
                            </Button>
                          </div>
                          
                          <div className="border-t border-border pt-6">
                            <h3 className="font-medium mb-3">What the AI Review provides:</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <Target className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                                <span>Code quality analysis</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <BookOpen className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>Personalized learning recommendations</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Youtube className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                                <span>YouTube video suggestions</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Target className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                                <span>Practice problem recommendations</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}