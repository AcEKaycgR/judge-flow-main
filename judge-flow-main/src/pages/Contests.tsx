import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Settings,
  Target,
  Award,
  Timer
} from 'lucide-react';
import CountdownTimer from '@/components/common/CountdownTimer';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { useToast } from '@/hooks/use-toast';
import { getContests, createContest, getProblems } from '@/lib/api';

export default function Contests() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '90',
    startDate: '',
    startTime: ''
  });

  // Fetch contests data using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['contests'],
    queryFn: getContests,
  });
  
  // Fetch problems data for the create contest dialog
  const { data: problemsData, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
  });

  const handleCreateContest = async () => {
    if (!formData.title || !formData.startDate || !formData.startTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare contest data
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);
      
      // Get selected problem IDs
      const problemIds = selectedQuestions.map(id => parseInt(id));
      
      // Call API to create contest
      await createContest({
        name: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        problem_ids: problemIds
      });
      
      toast({
        title: "Contest Created",
        description: `"${formData.title}" has been created successfully!`,
      });
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      setFormData({ title: '', description: '', duration: '90', startDate: '', startTime: '' });
      setSelectedQuestions([]);
      
      // Refresh contests list
      // The TanStack Query will automatically refetch the data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contest. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getContestStatus = (contest: any) => {
    const now = new Date();
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);
    
    if (startTime > now) return 'upcoming';
    if (endTime > now) return 'active';
    return 'ended';
  };

  // Use real data from API or fallback to mock data while loading
  const contests = data?.contests || [];
  const upcomingContests = contests.filter(c => getContestStatus(c) === 'upcoming');
  const activeContests = contests.filter(c => getContestStatus(c) === 'active');
  const endedContests = contests.filter(c => getContestStatus(c) === 'ended');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive font-medium">Failed to load contests. Please try again later.</p>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Coding Contests
            </h1>
            <p className="text-muted-foreground">
              Challenge yourself and compete with fellow developers.
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Contest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Contest</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Contest Title *</Label>
                    <Input 
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter contest title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your contest"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                          <SelectItem value="180">180 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input 
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input 
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Select Questions ({selectedQuestions.length} selected)</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {problemsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      problemsData?.problems?.map((problem: any) => (
                        <div key={problem.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                          <Checkbox 
                            checked={selectedQuestions.includes(problem.id.toString())}
                            onCheckedChange={() => handleQuestionToggle(problem.id.toString())}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{problem.title}</p>
                              <DifficultyBadge difficulty={problem.difficulty} />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {problem.tags.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="hero"
                    onClick={handleCreateContest}
                    className="flex-1"
                  >
                    Create Contest
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Only render contests when we have data and no errors */}
      {!isLoading && !error && (
        <div className="space-y-8">
          {/* Active Contests */}
          {activeContests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Live Contests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeContests.map(contest => (
                  <Card key={contest.id} className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{contest.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Test your skills in this live coding contest
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          Live
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{Math.floor((new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime()) / 60000)} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{contest.problem_count} problems</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <CountdownTimer targetDate={new Date(contest.end_time)} />
                        </div>
                      </div>
                      <Button variant="hero" className="w-full" asChild>
                        <Link to={`/contests/${contest.id}`}>
                          Join Contest
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Contests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingContests.map(contest => (
                <Card key={contest.id} className="card-hover border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{contest.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Get ready for this upcoming challenge
                        </p>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        Upcoming
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CountdownTimer 
                      targetDate={new Date(contest.start_time)}
                      className="text-blue-600 justify-center"
                    />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{Math.floor((new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime()) / 60000)} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{contest.problem_count} problems</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="hero" className="flex-1" asChild>
                        <Link to={`/contests/${contest.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Past Contests */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              Past Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {endedContests.map(contest => (
                <Card key={contest.id} className="opacity-75 hover:opacity-100 transition-smooth">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{contest.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          This contest has ended
                        </p>
                      </div>
                      <Badge variant="outline" className="text-muted-foreground">
                        Ended
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor((new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime()) / 60000)} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{contest.problem_count} problems</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/contests/${contest.id}`}>
                        View Results
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}