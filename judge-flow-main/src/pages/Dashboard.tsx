import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Play, 
  Trophy, 
  Send, 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { mockUser, mockContests } from '@/data/mockData';
import CountdownTimer from '@/components/common/CountdownTimer';

export default function Dashboard() {
  const upcomingContest = mockContests.find(contest => contest.status === 'upcoming');
  const accuracy = mockUser.stats.accuracy;
  
  const quickActions = [
    {
      title: 'Browse Questions',
      description: 'Solve coding problems',
      icon: FileText,
      href: '/questions',
      color: 'bg-blue-50 text-blue-600',
      count: '500+ problems'
    },
    {
      title: 'Playground',
      description: 'Test your code',
      icon: Play,
      href: '/playground',
      color: 'bg-green-50 text-green-600',
      count: 'Multiple languages'
    },
    {
      title: 'Contests',
      description: 'Join competitions',
      icon: Trophy,
      href: '/contests',
      color: 'bg-yellow-50 text-yellow-600',
      count: upcomingContest ? 'Next in 2 days' : 'No upcoming'
    },
    {
      title: 'Submissions',
      description: 'Review your code',
      icon: Send,
      href: '/submissions',
      color: 'bg-purple-50 text-purple-600',
      count: '12 recent'
    },
    {
      title: 'AI Review',
      description: 'Get AI feedback',
      icon: Brain,
      href: '/ai-review',
      color: 'bg-pink-50 text-pink-600',
      count: 'Smart insights'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {mockUser.username}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to tackle some coding challenges? Let's continue your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} to={action.href}>
                    <Card className="card-hover cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${action.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {action.description}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {action.count}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <p className="font-medium">Solved "Two Sum"</p>
                      <p className="text-sm text-muted-foreground">JavaScript • 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success-light text-success">
                    Accepted
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <div>
                      <p className="font-medium">Attempted "Binary Tree Path"</p>
                      <p className="text-sm text-muted-foreground">Python • 5 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-destructive-light text-destructive">
                    Wrong Answer
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <p className="font-medium">Completed "Valid Parentheses"</p>
                      <p className="text-sm text-muted-foreground">Java • 1 day ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success-light text-success">
                    Accepted
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <Link to="/submissions">
                  <Button variant="outline" className="w-full">
                    View All Submissions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Problems Solved</span>
                  <span className="text-sm text-muted-foreground">
                    {mockUser.stats.solved}/{mockUser.stats.attempted}
                  </span>
                </div>
                <Progress 
                  value={(mockUser.stats.solved / mockUser.stats.attempted) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm text-muted-foreground">{accuracy}%</span>
                </div>
                <Progress value={accuracy} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{mockUser.stats.solved}</div>
                  <div className="text-xs text-muted-foreground">Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {mockUser.stats.attempted - mockUser.stats.solved}
                  </div>
                  <div className="text-xs text-muted-foreground">Attempted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Contest */}
          {upcomingContest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Contest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-semibold">{upcomingContest.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {upcomingContest.description}
                  </p>
                  <CountdownTimer 
                    targetDate={upcomingContest.startTime}
                    className="text-primary"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{upcomingContest.duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <span>{upcomingContest.participants.toLocaleString()}</span>
                  </div>
                  <Link to="/contests">
                    <Button variant="hero" className="w-full mt-4">
                      Join Contest
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Tip */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">AI Tip of the Day</h3>
                  <p className="text-sm text-purple-700 mb-3">
                    Try solving problems in multiple languages to improve your algorithmic thinking!
                  </p>
                  <Link to="/ai-review">
                    <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      Get AI Review
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}