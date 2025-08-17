import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DifficultyBadge from '@/components/common/DifficultyBadge';

interface PendingQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  constraints: string;
  tags: string[];
  created_by: string;
  created_at: string;
  is_approved: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Add this at the top with other interfaces
interface ApprovedQuestionEvent {
  questionId: number;
}

export default function AdminPendingQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    if (!user?.is_staff) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchPendingQuestions();
  }, [user, filter]);

  const fetchPendingQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filter === 'pending') queryParams.append('approved', 'false');
      if (filter === 'approved') queryParams.append('approved', 'true');
      
      const response = await fetch(`${API_BASE_URL}/problems/pending-questions/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending questions');
      }
      
      const data = await response.json();
      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending questions. Please try again later.');
      console.error('Error fetching pending questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (questionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/problems/approve-pending-question/${questionId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve question');
      }
      
      toast.success('Question approved successfully!');
      
      // Emit a custom event to notify other components
      window.dispatchEvent(new CustomEvent('questionApproved', { detail: { questionId } }));
      
      // Refresh the list
      fetchPendingQuestions();
    } catch (err) {
      toast.error('Failed to approve question. Please try again.');
      console.error('Error approving question:', err);
    }
  };

  const handleReject = async (questionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/problems/reject-pending-question/${questionId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject question');
      }
      
      toast.success('Question rejected successfully!');
      
      // Refresh the list
      fetchPendingQuestions();
    } catch (err) {
      toast.error('Failed to reject question. Please try again.');
      console.error('Error rejecting question:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-label="Loading"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!user?.is_staff) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Access Denied</h2>
          <p className="text-destructive">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pending Questions
        </h1>
        <p className="text-muted-foreground">
          Review and approve user-submitted questions.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending Approval
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approved
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No questions found</h3>
                <p>
                  {filter === 'pending' 
                    ? 'There are no pending questions for approval.' 
                    : filter === 'approved' 
                      ? 'There are no approved questions.' 
                      : 'There are no questions in the system.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          questions.map(question => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {question.title}
                      {question.is_approved && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Approved
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={question.difficulty} />
                      <span className="text-sm text-muted-foreground">
                        Submitted by {question.created_by}
                      </span>
                    </div>
                  </div>
                  {!question.is_approved && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(question.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(question.id)}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-muted-foreground">{question.description}</p>
                  </div>
                  
                  {question.constraints && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Constraints</h4>
                      <p className="text-muted-foreground">{question.constraints}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Submitted on {new Date(question.created_at).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}