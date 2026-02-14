import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SkipLink } from '@/components/ui/skip-link';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function DashboardLayout() {
  const { user, profile, teacher, isTeacher, isStudent, isAdmin, hasTeacherRecord, refreshProfile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Only make redirect decisions after loading is complete
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      // Check current path to avoid infinite loops
      const path = location.pathname;
      const isTeacherRoute = path.startsWith('/teacher');

      // PRIVATE: Teacher dashboard is currently restricted to admins only
      if (isTeacherRoute && !isAdmin) {
        console.warn('DashboardLayout: Teacher dashboard is private. Redirecting non-admin.');
        if (isStudent) {
          navigate('/student/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      if (isAdmin) {
        // Admins can stay here or be redirected to admin
        if (path === '/teacher' || path === '/teacher/') {
          navigate('/teacher/dashboard', { replace: true });
        }
        return;
      }

      if (isStudent && !isTeacher) {
        // User is strictly a student, MUST go to student dashboard
        console.log('DashboardLayout: Redirecting student to student dashboard');
        navigate('/student/dashboard', { replace: true });
      } else if (!isTeacher) {
        // No valid role found for this layout
        console.warn('DashboardLayout: Unauthorized access attempt');
        navigate('/login', { replace: true });
      } else if (path === '/teacher' || path === '/teacher/') {
        // Base path redirect
        navigate('/teacher/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, isTeacher, isStudent, isAdmin, navigate, location.pathname]);


  // Show loading while auth is checking ONLY if we don't have a user yet
  // This prevents full-page blinks during background refreshes or window focus events
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user || !isTeacher) {
    // If user is logged in but role data is missing, don't spin forever.
    if (user && !isTeacher && !isStudent) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Finishing account setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We couldn’t confirm your account role yet. Click retry to finish setup.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => refreshProfile()}>
                  Retry
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    navigate('/login', { replace: true });
                  }}
                >
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SkipLink />
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main
            id="main-content"
            className="flex-1 overflow-auto p-4 md:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
