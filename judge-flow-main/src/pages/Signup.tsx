import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Code2, Eye, EyeOff, Github, Chrome, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-destructive';
    if (strength < 50) return 'bg-warning';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-success';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Account created!",
      description: "Welcome to JudgeFlow! You can now start solving problems.",
    });
    navigate('/');
  };

  const handleSocialSignup = (provider: string) => {
    toast({
      title: `${provider} Signup`,
      description: `Redirecting to ${provider} authentication...`,
    });
  };

  const currentStrength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="gradient-hero p-3 rounded-xl">
              <Code2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">JudgeFlow</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Start your
              <span className="block gradient-text bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                coding adventure
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto lg:mx-0">
              Join thousands of developers practicing algorithms, competing in contests, and growing their skills.
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
              <div className="bg-success p-2 rounded-lg">
                <Check className="h-4 w-4 text-success-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium">500+ Practice Problems</div>
                <div className="text-sm text-muted-foreground">From easy to advanced</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
              <div className="bg-primary p-2 rounded-lg">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium">Weekly Contests</div>
                <div className="text-sm text-muted-foreground">Compete and rank up</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">AI Code Review</div>
                <div className="text-sm text-muted-foreground">Get instant feedback</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-lg border-border/50">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Create account</CardTitle>
              <p className="text-muted-foreground">
                Enter your information to get started
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength</span>
                        <span className={`font-medium ${
                          currentStrength >= 75 ? 'text-success' : 
                          currentStrength >= 50 ? 'text-yellow-600' :
                          currentStrength >= 25 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {getStrengthText(currentStrength)}
                        </span>
                      </div>
                      <Progress 
                        value={currentStrength} 
                        className={`h-2 ${getStrengthColor(currentStrength)}`}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary-hover">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-hover">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button type="submit" variant="hero" className="w-full h-11">
                  Create account
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup('GitHub')}
                  className="h-11"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup('Google')}
                  className="h-11"
                >
                  <Chrome className="h-4 w-4 mr-2" />
                  Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-hover font-medium transition-smooth"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}