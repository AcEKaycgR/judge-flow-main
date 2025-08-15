import { useState, useEffect } from 'react';
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
import { getProfile, getDashboardData, getUserSubmissions } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import CountdownTimer from '@/components/common/CountdownTimer';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Stats {
  total_submissions: number;
  accepted_submissions: number;
  accuracy: number;
  total_problems: number;
  solved_problems: number;
}

interface Contest {
  id: string;
  name: string;
  start_time: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileResponse, dashboardResponse, submissionsResponse] = await Promise.all([
          getProfile(),
          getDashboardData(),
          getUserSubmissions(),
        ]);
        
        setUser(profileResponse.user);
        setStats(dashboardResponse.stats);
        setUpcomingContests(dashboardResponse.upcoming_contests);
        
        // Get recent submissions (last 3)
        const recent = submissionsResponse.submissions.slice(0, 3);
        setRecentSubmissions(recent);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Show dashboard content
  const upcomingContest = upcomingContests.length > 0 ? upcomingContests[0] : null;
  const accuracy = stats ? stats.accuracy : 0;
  
  const quickActions = [
    {
      title: 'Browse Questions',
      description: 'Solve coding problems',
      icon: FileText,
      href: '/questions',
      color: 'bg-blue-50 text-blue-600',
      count: stats ? `${stats.total_problems}+ problems` : '500+ problems'
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
      count: upcomingContest ? `Next in ${Math.ceil((new Date(upcomingContest.start_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'No upcoming'
    },
    {
      title: 'Submissions',
      description: 'Review your code',
      icon: Send,
      href: '/submissions',
      color: 'bg-purple-50 text-purple-600',
      count: stats ? `${stats.total_submissions} recent` : '12 recent'
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
          Welcome back, {user?.username}! 👋
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
              {recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          submission.status === 'accepted' ? 'bg-success' :
                          submission.status === 'wrong_answer' ? 'bg-destructive' :
                          'bg-warning'
                        }`}></div>
                        <div>
                          <p className="font-medium">Solved "{submission.problem_title}"</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.language.charAt(0).toUpperCase() + submission.language.slice(1)} • {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          submission.status === 'accepted' ? 'bg-success-light text-success' :
                          submission.status === 'wrong_answer' ? 'bg-destructive-light text-destructive' :
                          'bg-warning-light text-warning'
                        }
                      >
                        {submission.status === 'accepted' ? 'Accepted' :
                         submission.status === 'wrong_answer' ? 'Wrong Answer' :
                         'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start solving problems to see your activity here</p>
                </div>
              )}
              
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
                    {stats ? `${stats.solved_problems}/${stats.total_problems}` : '0/0'}
                  </span>
                </div>
                <Progress 
                  value={stats && stats.total_problems > 0 ? (stats.solved_problems / stats.total_problems) * 100 : 0} 
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
                  <div className="text-2xl font-bold text-success">{stats?.solved_problems || 0}</div>
                  <div className="text-xs text-muted-foreground">Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {stats ? stats.total_problems - stats.solved_problems : 0}
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
                  <h3 className="font-semibold">{upcomingContest.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Test your skills in this upcoming competition
                  </p>
                  <CountdownTimer 
                    targetDate={new Date(upcomingContest.start_time)}
                    className="text-primary"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>90 minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <span>1,284</span>
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