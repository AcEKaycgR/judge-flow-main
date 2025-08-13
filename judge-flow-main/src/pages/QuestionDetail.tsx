import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  MessageCircle
} from 'lucide-react';
import { mockQuestions } from '@/data/mockData';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import CodeEditor from '@/components/common/CodeEditor';
import { Language } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function QuestionDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isConstraintsOpen, setIsConstraintsOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(true);

  const question = mockQuestions.find(q => q.id === id);

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
    toast({
      title: "Solution submitted",
      description: `Your ${language} solution has been submitted for evaluation.`,
    });
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
                      {question.examples.map((example, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">Example {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Input:</h4>
                              <code className="text-sm bg-muted/50 p-2 rounded block">
                                {example.input}
                              </code>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Output:</h4>
                              <code className="text-sm bg-muted/50 p-2 rounded block">
                                {example.output}
                              </code>
                            </div>
                            {example.explanation && (
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Explanation:</h4>
                                <p className="text-sm text-muted-foreground">
                                  {example.explanation}
                                </p>
                              </div>
                            )}
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
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="flex-1 mt-0">
                  <CodeEditor
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
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}