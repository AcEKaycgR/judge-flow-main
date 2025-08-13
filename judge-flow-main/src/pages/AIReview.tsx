import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Heart,
  Star,
  Share,
  Download,
  Copy
} from 'lucide-react';
import { mockSubmissions, mockAIReview } from '@/data/mockData';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AIReview() {
  const { submissionId } = useParams();
  const { toast } = useToast();
  const [isReadOnly] = useState(true);

  const submission = mockSubmissions.find(s => s.id === submissionId);
  const review = mockAIReview;

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

  const feedbackIcons = {
    tip: Lightbulb,
    warning: AlertTriangle,
    improvement: Star,
    compliment: Heart
  };

  const feedbackColors = {
    tip: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    improvement: 'text-purple-600 bg-purple-50 border-purple-200',
    compliment: 'text-green-600 bg-green-50 border-green-200'
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(submission.code);
    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Review link copied",
      description: "The AI review link has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Review downloaded",
      description: "The AI review has been downloaded as a PDF.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  <p className="text-sm text-muted-foreground">{submission.questionTitle}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Your Code
                    <Badge variant="outline" className="capitalize">
                      {submission.language}
                    </Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={submission.code}
                  readOnly={isReadOnly}
                  className="min-h-[400px] font-mono text-sm resize-none"
                />
              </CardContent>
            </Card>

            {/* Submission Details */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 ${
                        submission.status === 'accepted' 
                          ? 'bg-success-light text-success border-success/20' 
                          : 'bg-destructive-light text-destructive border-destructive/20'
                      }`}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {submission.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="font-medium capitalize">{submission.language}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Runtime</p>
                    <p className="font-medium">
                      {submission.runtime ? `${submission.runtime}ms` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className="font-medium">
                      {submission.memory ? `${submission.memory}MB` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">{submission.submittedAt.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Feedback */}
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Analysis Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {review.overallScore}/100
                    </div>
                    <p className="text-muted-foreground">Overall Code Quality</p>
                  </div>
                  <Progress value={review.overallScore} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-green-600">85</div>
                      <div className="text-muted-foreground">Efficiency</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600">90</div>
                      <div className="text-muted-foreground">Readability</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">80</div>
                      <div className="text-muted-foreground">Best Practices</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>AI Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.feedback.map((item, index) => {
                  const Icon = feedbackIcons[item.type];
                  const colorClass = feedbackColors[item.type];
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${colorClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium uppercase tracking-wide">
                              {item.type}
                            </span>
                            {item.lineNumber && (
                              <Badge variant="outline" className="text-xs">
                                Line {item.lineNumber}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{item.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Suggestions for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {review.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground">{suggestion}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={`/questions/${submission.questionId}`}>
                  <Button className="w-full" variant="hero">
                    Try Problem Again
                  </Button>
                </Link>
                <Link to="/questions">
                  <Button className="w-full" variant="outline">
                    Browse Similar Problems
                  </Button>
                </Link>
                <Link to="/playground">
                  <Button className="w-full" variant="outline">
                    Experiment in Playground
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}