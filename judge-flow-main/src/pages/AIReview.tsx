import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Play, 
  BookOpen, 
  Youtube, 
  Target,
  RefreshCw,
  TrendingUp,
  Award,
  BarChart,
  AlertCircle
} from 'lucide-react';
import { getComprehensiveAIReview, getUserProgress } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FeedbackSection {
  title: string;
  content: string;
}

interface ProgressDataPoint {
  date: string;
  total_submissions: number;
  accepted_submissions: number;
  accuracy_rate: number;
}

export default function AIReview() {
  const { toast } = useToast();
  const [feedbackSections, setFeedbackSections] = useState<FeedbackSection[]>([]);
  const [stats, setStats] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['comprehensive-ai-review'],
    queryFn: getComprehensiveAIReview,
  });

  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['user-progress'],
    queryFn: getUserProgress,
  });

  const recommendations = data?.recommendations;

  useEffect(() => {
    if (data?.feedback) {
      const sections = parseFeedbackIntoSections(data.feedback);
      setFeedbackSections(sections);
      
      // Extract stats for visualization
      const statsSection = sections.find(s => s.title.includes('Statistics'));
      if (statsSection) {
        const lines = statsSection.content.split('\n');
        const totalSubmissions = parseInt(lines[0].split(': ')[1] || '0');
        const acceptedSolutions = parseInt(lines[1].split(': ')[1] || '0');
        const accuracyRate = parseFloat(lines[2].split(': ')[1]?.replace('%', '') || '0');
        setStats({
          totalSubmissions,
          acceptedSolutions,
          accuracyRate,
        });
      }
    }
  }, [data]);

  const parseFeedbackIntoSections = (feedback: string): FeedbackSection[] => {
    const sections: FeedbackSection[] = [];
    const lines = feedback.split('\n');
    
    let currentTitle = '';
    let currentContent = '';
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentTitle && currentContent) {
          sections.push({ title: currentTitle, content: currentContent.trim() });
        }
        currentTitle = line.replace('## ', '').trim();
        currentContent = '';
      } else if (line.startsWith('### ')) {
        if (currentTitle && currentContent) {
          sections.push({ title: currentTitle, content: currentContent.trim() });
        }
        currentTitle = line.replace('### ', '').trim();
        currentContent = '';
      } else {
        currentContent += '\n' + line;
      }
    }
    
    if (currentTitle && currentContent) {
      sections.push({ title: currentTitle, content: currentContent.trim() });
    }
    
    return sections;
  };

  const handleRefresh = () => {
    refetch();
  };

  // Prepare chart data from progress data
  const chartData = progressData?.progress_data?.map((point: ProgressDataPoint) => ({
    date: new Date(point.date).toLocaleDateString(),
    total: point.total_submissions,
    accepted: point.accepted_submissions,
    accuracy: point.accuracy_rate,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                Comprehensive AI Review
              </h1>
              <p className="text-muted-foreground">
                An overview of your coding performance and personalized recommendations.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || progressLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || progressLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {(isLoading || progressLoading) && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {(error || progressError) && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Brain className="h-5 w-5" />
                Error Loading AI Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">Failed to load AI review. Please try again later.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !progressLoading && !error && !progressError && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Stats and Assessment */}
            <div className="lg:col-span-1 space-y-6">
              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-blue-600" />
                      Your Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill="#8884d8" name="Total Submissions" />
                          <Bar dataKey="accepted" fill="#82ca9d" name="Accepted" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Accuracy</span>
                        <span className="text-sm font-medium">{stats.accuracyRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={stats.accuracyRate} />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Overall Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {data?.feedback ? 
                      data.feedback.split('\n').find(line => line.includes('Excellent progress') || line.includes('Continue practicing') || line.includes('Focus on understanding')) ||
                      'Keep up the good work and continue practicing regularly.' :
                      'Keep up the good work and continue practicing regularly.'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Common Patterns Identified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {data?.feedback ? 
                      data.feedback.split('\n')
                        .filter(line => line.startsWith('- ') && (line.includes('logic') || line.includes('efficiency') || line.includes('complexity')))
                        .slice(0, 5)
                        .map((line, i) => (
                          <li key={i}>{line.replace('- ', '')}</li>
                        )) : 
                      <li>Consistent practice patterns observed</li>
                    }
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Personalized Learning Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Play className="h-4 w-4 text-green-600" />
                        Focus Areas
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {data?.feedback ? 
                          data.feedback.split('\n')
                            .filter(line => line.startsWith('- ') && !line.includes('YouTube') && !line.includes('Courses') && !line.includes('Books'))
                            .slice(0, 3)
                            .map((line, i) => (
                              <li key={i}>{line.replace('- ', '')}</li>
                            )) : 
                          <>
                            <li>Focus on understanding problem requirements before coding</li>
                            <li>Practice more easy-level problems to build confidence</li>
                            <li>Review fundamental programming concepts</li>
                          </>
                        }
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Practice Problems
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {recommendations?.practice_problems?.slice(0, 5).map((problem, i) => (
                      <li key={i}>{problem}</li>
                    )) || (
                      data?.feedback ? 
                        data.feedback.split('\n')
                          .filter(line => line.startsWith('- ') && (line.includes('Array') || line.includes('String') || line.includes('Tree') || line.includes('Dynamic')))
                          .slice(0, 5)
                          .map((line, i) => (
                            <li key={i}>{line.replace('- ', '')}</li>
                          )) : 
                        <>
                          <li>Array Manipulation</li>
                          <li>String Processing</li>
                          <li>Dynamic Programming</li>
                          <li>Tree Traversal</li>
                          <li>Graph Algorithms</li>
                        </>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Recommended Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations?.courses?.slice(0, 3).map((course, i) => (
                      <a 
                        key={i} 
                        href={course.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <h3 className="font-medium text-foreground">{course.title}</h3>
                      </a>
                    )) || (
                      data?.feedback ? 
                        data.feedback.split('\n')
                          .filter(line => line.startsWith('- ') && (line.includes('Algorithms') || line.includes('Data Structures') || line.includes('Programming')))
                          .slice(0, 3)
                          .map((line, i) => {
                            const courseTitle = line.replace('- ', '');
                            return (
                              <div key={i} className="p-3 rounded-lg border">
                                <h3 className="font-medium text-foreground">{courseTitle}</h3>
                              </div>
                            );
                          }) : 
                        <>
                          <div className="p-3 rounded-lg border">
                            <h3 className="font-medium text-foreground">Data Structures and Algorithms</h3>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h3 className="font-medium text-foreground">System Design Fundamentals</h3>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h3 className="font-medium text-foreground">Advanced Python Programming</h3>
                          </div>
                        </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    Suggested Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations?.youtube_videos?.slice(0, 3).map((video, i) => (
                      <a 
                        key={i} 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <h3 className="font-medium text-foreground">{video.title}</h3>
                      </a>
                    )) || (
                      data?.feedback ? 
                        data.feedback.split('\n')
                          .filter(line => line.startsWith('- ') && (line.includes('Video') || line.includes('Tutorial') || line.includes('Explained')))
                          .slice(0, 3)
                          .map((line, i) => {
                            const videoTitle = line.replace('- ', '');
                            return (
                              <div key={i} className="p-3 rounded-lg border">
                                <h3 className="font-medium text-foreground">{videoTitle}</h3>
                              </div>
                            );
                          }) : 
                        <>
                          <div className="p-3 rounded-lg border">
                            <h3 className="font-medium text-foreground">Mastering Arrays and Strings</h3>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h3 className="font-medium text-foreground">Dynamic Programming Essentials</h3>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h3 className="font-medium text-foreground">Tree and Graph Algorithms</h3>
                          </div>
                        </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Common Mistakes to Avoid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {recommendations?.errors_to_avoid?.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    )) || (
                      data?.feedback ? 
                        data.feedback.split('\n')
                          .filter(line => line.startsWith('- ') && (line.includes('error') || line.includes('mistake') || line.includes('avoid')))
                          .slice(0, 5)
                          .map((line, i) => (
                            <li key={i}>{line.replace('- ', '')}</li>
                          )) : 
                        <>
                          <li>Not handling edge cases properly</li>
                          <li>Inefficient time complexity</li>
                          <li>Memory leaks in recursive solutions</li>
                          <li>Off-by-one errors in loops</li>
                        </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!isLoading && !progressLoading && !error && !progressError && feedbackSections.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Code Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No feedback available yet. Submit some solutions to get personalized AI recommendations.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}