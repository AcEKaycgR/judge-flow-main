import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { getProblems } from '@/lib/api';

interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminManageProblems() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchProblems();
  }, [user]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await getProblems();
      // Transform the API response to match our interface
      const transformedProblems = data.problems.map((problem: any) => ({
        id: problem.id,
        title: problem.title,
        description: '', // Description is not in the API response
        difficulty: problem.difficulty,
        tags: problem.tags
      }));
      setProblems(transformedProblems);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problems. Please try again later.');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/problems/delete-problem/${problemId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete problem');
      }
      
      toast.success('Problem deleted successfully!');
      
      // Refresh the list
      fetchProblems();
    } catch (err) {
      toast.error('Failed to delete problem. Please try again.');
      console.error('Error deleting problem:', err);
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
          Manage Problems
        </h1>
        <p className="text-muted-foreground">
          Delete existing problems from the system.
        </p>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {problems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No problems found</h3>
                <p>There are no problems in the system.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          problems.map(problem => (
            <Card key={problem.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {problem.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(problem.id)}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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