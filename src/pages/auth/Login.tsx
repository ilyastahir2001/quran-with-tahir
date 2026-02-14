import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { user, isLoading, signIn, isTeacher, isStudent, isAdmin, roles } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [lockoutTime, setLockoutTime] = React.useState<number>(0);

  // Check for lockout on mount and every second
  React.useEffect(() => {
    const checkLockout = () => {
      const lockedUntil = localStorage.getItem('login_lockout_until');
      if (lockedUntil) {
        const remaining = parseInt(lockedUntil) - Date.now();
        if (remaining > 0) {
          setLockoutTime(Math.ceil(remaining / 1000));
        } else {
          localStorage.removeItem('login_lockout_until');
          setLockoutTime(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if already logged in - wait for loading to complete AND roles to be determined
  React.useEffect(() => {
    if (!isLoading && user && (roles.length > 0 || user.user_metadata?.role)) {
      const metaRole = user.user_metadata?.role;
      console.log('Login: Redirecting with role metadata:', metaRole);

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


  if (isLoading || (user && roles.length === 0 && !user.user_metadata?.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Preparing your dashboard...</h2>
          <p className="text-muted-foreground">
            {user ? "We're almost there! Just fetching your account settings." : "Connecting to server..."}
          </p>

          {user && roles.length === 0 && (
            <div className="mt-4 flex flex-col gap-2 w-full">
              <Button
                onClick={() => {
                  window.location.reload();
                }}
                variant="outline"
                className="w-full"
              >
                Retry Loading
              </Button>
              <Button
                onClick={async () => {
                  // Direct bypass for stuck users - sign out and clear
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/login';
                }}
                variant="ghost"
                className="w-full text-xs"
              >
                Stuck? Reset Session
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    setError('');
    setSubmitting(true);

    try {
      const { error, mfaRequired, factorId } = await signIn(email, password);

      if (error) {
        const attempts = parseInt(localStorage.getItem('login_attempts') || '0') + 1;
        if (attempts >= 5) {
          const until = Date.now() + 60000; // 1 minute lockout
          localStorage.setItem('login_lockout_until', until.toString());
          localStorage.setItem('login_attempts', '0');
          toast.error('Too many failed attempts. Please wait 1 minute.');
        } else {
          localStorage.setItem('login_attempts', attempts.toString());
          setError(error.message);
          toast.error(`${error.message} (${5 - attempts} attempts remaining)`);
        }
      } else if (mfaRequired && factorId) {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lockout_until');
        toast.info('Security code required');
        navigate('/verify-mfa', { state: { factorId } });
      } else {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lockout_until');
        toast.success('Signed in successfully!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9] dark:bg-slate-950 p-4 font-outfit relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse delay-700" />

      <Card className="w-full max-w-md border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10 rounded-[32px]">
        <CardHeader className="space-y-4 pt-10 pb-2">
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-3xl mb-4 group transition-all hover:scale-110 active:scale-95 cursor-pointer flex flex-col items-center space-y-3 text-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-24 w-auto object-contain animate-in fade-in zoom-in slide-in-from-top-4 duration-1000" 
              />
              <div className="flex flex-col items-center -space-y-0.5">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Quran with Tahir
                </span>
                <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mt-1">
                  Online Academy
                </span>
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium text-center max-w-[280px] mt-2">
              Continue your journey of mastering the Holy Quran.
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              disabled={submitting || lockoutTime > 0}
            >
              {lockoutTime > 0 ? (
                `Locked (${lockoutTime}s)`
              ) : submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
