import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Brain, 
  Play, 
  BookOpen, 
  Youtube, 
  Target,
  RefreshCw
} from 'lucide-react';
import { getComprehensiveAIReview } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface FeedbackSection {
  title: string;
  content: string;
}

export default function AIReview() {
  const { submissionId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [feedbackSections, setFeedbackSections] = useState<FeedbackSection[]>([]);

  // Check if feedback is passed via location state
  const locationState = location.state as { feedback?: string } | null;
  const hasLocationFeedback = !!locationState?.feedback;

  // Fetch comprehensive AI review only if no location feedback
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['comprehensive-ai-review'],
    queryFn: getComprehensiveAIReview,
    enabled: !hasLocationFeedback,
  });

  // Parse feedback into sections
  useEffect(() => {
    if (locationState?.feedback) {
      const sections = parseFeedbackIntoSections(locationState.feedback);
      setFeedbackSections(sections);
    } else if (data?.feedback) {
      const sections = parseFeedbackIntoSections(data.feedback);
      setFeedbackSections(sections);
    }
  }, [data, locationState]);

  const parseFeedbackIntoSections = (feedback: string): FeedbackSection[] => {
    const sections: FeedbackSection[] = [];
    const lines = feedback.split('\n');
    
    let currentTitle = '';
    let currentContent = '';
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentTitle && currentContent) {
          sections.push({
            title: currentTitle,
            content: currentContent.trim()
          });
        }
        
        // Start new section
        currentTitle = line.replace('## ', '').trim();
        currentContent = '';
      } else if (line.startsWith('### ')) {
        // Save previous section
        if (currentTitle && currentContent) {
          sections.push({
            title: currentTitle,
            content: currentContent.trim()
          });
        }
        
        // Start new section
        currentTitle = line.replace('### ', '').trim();
        currentContent = '';
      } else {
        if (currentContent) {
          currentContent += '\n' + line;
        } else {
          currentContent = line;
        }
      }
    }
    
    // Save last section
    if (currentTitle && currentContent) {
      sections.push({
        title: currentTitle,
        content: currentContent.trim()
      });
    }
    
    return sections;
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/submissions">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Submissions
                </Button>
              </Link>
              <div className="h-4 border-l border-border"></div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-semibold">AI Code Review</h1>
                  <p className="text-sm text-muted-foreground">Comprehensive analysis of your coding patterns</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Brain className="h-5 w-5" />
                Error Loading AI Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                Failed to load AI review. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && feedbackSections.length > 0 && (
          <div className="space-y-6">
            {feedbackSections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.title.includes('Code Review') && <Brain className="h-5 w-5 text-purple-600" />}
                    {section.title.includes('Statistics') && <Target className="h-5 w-5 text-blue-600" />}
                    {section.title.includes('Languages') && <Play className="h-5 w-5 text-green-600" />}
                    {section.title.includes('Issues') && <Play className="h-5 w-5 text-yellow-600" />}
                    {section.title.includes('Recommendations') && <BookOpen className="h-5 w-5 text-indigo-600" />}
                    {section.title.includes('Resources') && <Youtube className="h-5 w-5 text-red-600" />}
                    {section.title.includes('Problems') && <Target className="h-5 w-5 text-orange-600" />}
                    {section.title.includes('Assessment') && <Brain className="h-5 w-5 text-purple-600" />}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.title === 'Learning Resources' ? (
                    <div className="space-y-3">
                      {section.content.split('\n').map((line, i) => {
                        if (line.includes('YouTube')) {
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-200 rounded-lg">
                              <Youtube className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{line.split(':')[0]}</p>
                                <a 
                                  href={line.includes('http') ? line.match(/https?:\/\/[^\s]+/)?.[0] || '#' : '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-red-600 hover:underline"
                                >
                                  {line.includes('http') ? 'Watch on YouTube' : 'View Resource'}
                                </a>
                              </div>
                            </div>
                          );
                        } else if (line.includes('Course')) {
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg">
                              <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{line.split(':')[0]}</p>
                                <p className="text-sm text-muted-foreground">{line.split(':')[1]?.trim() || 'View Course'}</p>
                              </div>
                            </div>
                          );
                        } else if (line.includes('Book')) {
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
                              <BookOpen className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{line.split(':')[0]}</p>
                                <p className="text-sm text-muted-foreground">{line.split(':')[1]?.trim() || 'View Book'}</p>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <p key={i} className="text-muted-foreground">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  ) : section.title === 'Practice Problems' ? (
                    <div className="space-y-3">
                      <p className="text-muted-foreground mb-3">
                        Practice these problems to improve your skills:
                      </p>
                      {section.content.split('\n').map((line, i) => {
                        if (line.trim() && line.includes('-')) {
                          const problem = line.replace('-', '').trim();
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
                              <Target className="h-5 w-5 text-orange-600 flex-shrink-0" />
                              <p className="font-medium">{problem}</p>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {section.content.split('\n').map((line, i) => {
                        if (line.startsWith('- ')) {
                          return (
                            <li key={i} className="ml-4">
                              {line.replace('- ', '')}
                            </li>
                          );
                        } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                          return (
                            <li key={i} className="ml-4">
                              {line.replace(/^\d+\.\s/, '')}
                            </li>
                          );
                        } else if (line.trim()) {
                          return (
                            <p key={i} className="text-muted-foreground">
                              {line}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && feedbackSections.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Code Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No feedback available yet. Submit some solutions to get personalized AI recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}