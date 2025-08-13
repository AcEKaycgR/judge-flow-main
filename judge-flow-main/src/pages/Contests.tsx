import { useState } from 'react';
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
import { mockContests, mockQuestions } from '@/data/mockData';
import CountdownTimer from '@/components/common/CountdownTimer';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { useToast } from '@/hooks/use-toast';

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

  const handleCreateContest = () => {
    if (!formData.title || !formData.startDate || !formData.startTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Contest Created",
      description: `"${formData.title}" has been created successfully!`,
    });
    setIsCreateDialogOpen(false);
    setFormData({ title: '', description: '', duration: '90', startDate: '', startTime: '' });
    setSelectedQuestions([]);
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
    if (contest.startTime > now) return 'upcoming';
    if (contest.endTime > now) return 'active';
    return 'ended';
  };

  const upcomingContests = mockContests.filter(c => getContestStatus(c) === 'upcoming');
  const activeContests = mockContests.filter(c => getContestStatus(c) === 'active');
  const endedContests = mockContests.filter(c => getContestStatus(c) === 'ended');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    {mockQuestions.map(question => (
                      <div key={question.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                        <Checkbox 
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleQuestionToggle(question.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{question.title}</p>
                            <DifficultyBadge difficulty={question.difficulty} />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
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
                        <CardTitle className="text-lg">{contest.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contest.description}
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
                        <span>{contest.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{contest.participants} joined</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{contest.questions.length} problems</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <CountdownTimer targetDate={contest.endTime} />
                      </div>
                    </div>
                    <Button variant="hero" className="w-full">
                      Join Contest
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
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contest.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      Upcoming
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CountdownTimer 
                    targetDate={contest.startTime}
                    className="text-blue-600 justify-center"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{contest.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{contest.participants} registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{contest.questions.length} problems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{contest.startTime.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="hero" className="flex-1">
                      Register
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
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
                      <CardTitle className="text-lg">{contest.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contest.description}
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
                      <span>{contest.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{contest.participants} participated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{contest.questions.length} problems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{contest.startTime.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View Results
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}