import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Clock, HardDrive, Calendar } from 'lucide-react';
import { mockSubmissions } from '@/data/mockData';
import StatusBadge from '@/components/common/StatusBadge';
import { useState } from 'react';

export default function Submissions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const filteredSubmissions = mockSubmissions.filter(submission => {
    const matchesSearch = submission.questionTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesLanguage = languageFilter === 'all' || submission.language === languageFilter;
    
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getLanguageDisplay = (language: string) => {
    const languageMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust'
    };
    return languageMap[language] || language;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Submissions
        </h1>
        <p className="text-muted-foreground">
          Track your progress and review your submitted solutions.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
                <SelectItem value="time_limit">Time Limit</SelectItem>
                <SelectItem value="runtime_error">Runtime Error</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success-light text-success">
            {mockSubmissions.filter(s => s.status === 'accepted').length} Accepted
          </Badge>
          <Badge variant="outline" className="bg-destructive-light text-destructive">
            {mockSubmissions.filter(s => s.status === 'wrong_answer').length} Wrong Answer
          </Badge>
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link 
                      to={`/questions/${submission.questionId}`}
                      className="font-medium text-primary hover:text-primary-hover transition-smooth"
                    >
                      {submission.questionTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {getLanguageDisplay(submission.language)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.runtime ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{submission.runtime}ms</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.memory ? (
                      <div className="flex items-center gap-1 text-sm">
                        <HardDrive className="h-3 w-3 text-muted-foreground" />
                        <span>{submission.memory}MB</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{submission.submittedAt.toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link to={`/ai-review/${submission.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredSubmissions.length === 0 && (
        <Card className="text-center py-12 mt-6">
          <CardContent>
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No submissions found</h3>
              <p>Try adjusting your search criteria or start solving problems!</p>
              <Link to="/questions" className="mt-4 inline-block">
                <Button variant="hero">Browse Questions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}