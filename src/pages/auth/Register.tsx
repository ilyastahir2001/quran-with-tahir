import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { toast } from 'sonner';

type UserRole = 'teacher' | 'student' | 'parent';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Saudi Arabia", "UAE", "Egypt",
  "Pakistan", "India", "Indonesia", "Malaysia", "Turkey", "Other"
];

const LANGUAGES = [
  "English", "Arabic", "Urdu", "French", "German",
  "Spanish", "Indonesian", "Malay", "Turkish", "Other"
];

export default function Register() {
  const { user, isLoading, signUp, isTeacher, isStudent, isAdmin, roles } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('student');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  // Check for registration cooldown
  React.useEffect(() => {
    const checkCooldown = () => {
      const waitUntil = localStorage.getItem('register_cooldown_until');
      if (waitUntil) {
        const remaining = parseInt(waitUntil) - Date.now();
        if (remaining > 0) {
          setCooldown(Math.ceil(remaining / 1000));
        } else {
          localStorage.removeItem('register_cooldown_until');
          setCooldown(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if already logged in - wait for loading to complete AND roles to be determined
  React.useEffect(() => {
    if (!isLoading && user && (roles.length > 0 || user.user_metadata?.role)) {
      const metaRole = user.user_metadata?.role;
      console.log('Register: Redirecting with role metadata:', metaRole);

      if (isAdmin || metaRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (isTeacher && !isStudent && metaRole !== 'student' && metaRole !== 'parent') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (isStudent || metaRole === 'student' || metaRole === 'parent') {
        navigate('/student/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, isLoading, isTeacher, isStudent, isAdmin, roles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setError('');
    setSubmitting(true);

    try {
      const { error } = await signUp(email, password, name, role, country, language);
      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        // Set a 30s cooldown after successful signup attempt (preventing mass verification mail spam)
        const until = Date.now() + 30000;
        localStorage.setItem('register_cooldown_until', until.toString());
        setSuccess(true);
        toast.success('Please check your email to verify your account!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9] dark:bg-slate-950 p-4 font-outfit relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700" />

        <Card className="w-full max-w-md border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10 rounded-[32px]">
          <CardHeader className="space-y-4 pt-10 pb-2">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-3xl mb-4 group transition-all hover:scale-110 active:scale-95 cursor-pointer">
                <UserPlus className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Create Account
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium text-center mt-2">
                Join our community and start your journey today.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-500 font-medium text-center mt-2">
              We've sent a verification link to <strong>{email}</strong>. Please click the link to verify your account.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{' '}
              <Link to="/resend-verification" className="text-primary hover:underline font-medium">
                Resend it
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9] dark:bg-slate-950 p-4 font-outfit relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700" />

      <Card className="w-full max-w-md border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10 rounded-[32px]">
        <CardHeader className="space-y-4 pt-10 pb-2">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-3xl mb-4 group transition-all hover:scale-110 active:scale-95 cursor-pointer">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium text-center mt-2">
              Join our community and start your journey today.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/20">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage} required>
                  <SelectTrigger className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/20">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="student" id="student" className="peer sr-only" />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    Student
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                  <Label
                    htmlFor="parent"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    Parent
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                  <Label
                    htmlFor="teacher"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    Teacher
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={submitting || cooldown > 0}>
              {cooldown > 0 ? (
                `Wait ${cooldown}s`
              ) : submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
