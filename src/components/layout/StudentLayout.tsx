import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { StudentSidebar } from './StudentSidebar';
import { DashboardHeader } from './DashboardHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SkipLink } from '@/components/ui/skip-link';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { IncomingCallProvider } from '@/contexts/IncomingCallContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useClassReminders } from '@/hooks/useClassReminders';

export function StudentLayout() {
  const { user, isLoading, isStudent, isTeacher, isAdmin, hasStudentRecord, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Enable class reminders and lifecycle notifications
  useClassReminders();

  useEffect(() => {
    // Only make redirect decisions after loading is complete
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      const path = window.location.pathname;

      if (isAdmin) {
        // Admins can be here but usually prefer admin dashboard
        // Optionally redirect: navigate('/admin/dashboard', { replace: true });
        return;
      }

      if (isTeacher && !isStudent) {
        // User is strictly a teacher, redirect to teacher dashboard
        console.log('StudentLayout: Redirecting teacher to teacher dashboard');
        navigate('/teacher/dashboard', { replace: true });
      } else if (!isStudent) {
        // No valid student role found
        console.warn('StudentLayout: Unauthorized access attempt');
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, isStudent, isTeacher, isAdmin, navigate]);


  // Show loading while auth is checking ONLY if we don't have a user yet
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

  // Show loading while redirecting (no user or not a student)
  if (!user || !isStudent) {
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
    <IncomingCallProvider>
      <SidebarProvider defaultOpen={!isMobile} onOpenChange={setSidebarOpen}>
        <SkipLink />
        <InstallPrompt />
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <StudentSidebar />}
          <div className="flex-1 flex flex-col min-w-0">
            {!isMobile && <DashboardHeader />}
            <main
              id="main-content"
              className={`flex-1 overflow-auto ${isMobile ? 'pb-[calc(4rem+env(safe-area-inset-bottom))]' : 'p-4 md:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]'}`}
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
          </div>
        </div>
        {isMobile && <BottomNav />}
      </SidebarProvider>
    </IncomingCallProvider>
  );
}
