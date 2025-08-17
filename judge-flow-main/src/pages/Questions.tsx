import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Search, Filter, Code, Clock, Users, AlertCircle, Plus } from 'lucide-react';
import { getProblems, submitPendingQuestion } from '@/lib/api';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  is_pending?: boolean;
}

export default function Questions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('title');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    constraints: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getProblems();
        // Transform the API response to match our interface
        const transformedQuestions = data.problems.map((problem: any) => ({
          id: problem.id,
          title: problem.title,
          description: '', // Description is not in the API response
          difficulty: problem.difficulty,
          tags: problem.tags,
          is_pending: problem.is_pending || false
        }));
        setQuestions(transformedQuestions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch problems. Please try again later.');
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    
    // Listen for question approval events
    const handleQuestionApproved = () => {
      fetchQuestions();
    };
    
    window.addEventListener('questionApproved', handleQuestionApproved);
    
    return () => {
      window.removeEventListener('questionApproved', handleQuestionApproved);
    };
  }, []);

  useEffect(() => {
    const filtered = questions.filter(question => {
      const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => question.tags.includes(tag));
      
      return matchesSearch && matchesDifficulty && matchesTags;
    });

    // Sort questions
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'tags':
          return a.tags.length - b.tags.length;
        default:
          return 0;
      }
    });

    setFilteredQuestions(sorted);
  }, [questions, searchQuery, selectedDifficulty, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleNewQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const tags = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await submitPendingQuestion({
        title: newQuestion.title,
        description: newQuestion.description,
        difficulty: newQuestion.difficulty,
        constraints: newQuestion.constraints,
        tags: tags
      });
      
      toast.success('Question submitted successfully! It will appear once approved.');
      setShowSubmitForm(false);
      setNewQuestion({
        title: '',
        description: '',
        difficulty: 'easy',
        constraints: '',
        tags: ''
      });
    } catch (err) {
      toast.error('Failed to submit question. Please try again.');
      console.error('Error submitting question:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Extract unique tags from all questions
  const allTags = Array.from(new Set(questions.flatMap(question => question.tags)));

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Coding Problems
            </h1>
            <p className="text-muted-foreground">
              Sharpen your programming skills with our curated collection of problems.
            </p>
          </div>
          {user && (
            <Button onClick={() => setShowSubmitForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Question
            </Button>
          )}
        </div>
      </div>

      {/* Submit Question Form */}
      {showSubmitForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submit a New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNewQuestionSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  name="title"
                  value={newQuestion.title}
                  onChange={handleNewQuestionChange}
                  placeholder="Enter question title"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  name="description"
                  value={newQuestion.description}
                  onChange={handleNewQuestionChange}
                  placeholder="Enter question description"
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Difficulty</label>
                  <select
                    name="difficulty"
                    value={newQuestion.difficulty}
                    onChange={handleNewQuestionChange}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
                  <Input
                    name="tags"
                    value={newQuestion.tags}
                    onChange={handleNewQuestionChange}
                    placeholder="e.g., array, string, sorting"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Constraints (optional)</label>
                <textarea
                  name="constraints"
                  value={newQuestion.constraints}
                  onChange={handleNewQuestionChange}
                  placeholder="Enter constraints (e.g., time complexity, space complexity)"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmitForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filters */}
          <div>
            <h4 className="text-sm font-medium mb-3">Filter by Tags</h4>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 12).map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-smooth ${
                    selectedTags.includes(tag) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedTags([])}
                className="mt-2"
              >
                Clear Tags ({selectedTags.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          Found {filteredQuestions.length} problem{filteredQuestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuestions.map(question => (
          <Card key={question.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 leading-tight">
                    {question.title}
                    {question.is_pending && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Pending Approval
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>1.2k solved</span>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Code className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {question.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {question.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {question.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{question.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>15-30 min</span>
                    </div>
                  </div>
                  
                  <Link to={`/questions/${question.id}`}>
                    <Button variant="hero" size="sm">
                      Solve Problem
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No problems found</h3>
              <p>Try adjusting your search criteria or filters.</p>
              {user && (
                <p className="mt-4 text-sm">
                  Have a question you'd like to add? <Button variant="link" onClick={() => setShowSubmitForm(true)} className="p-0 h-auto">Submit it for review</Button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}