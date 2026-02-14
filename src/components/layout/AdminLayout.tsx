import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSidebar } from './DashboardSidebar';
import { AdminSidebar } from './AdminSidebar';
import { DashboardHeader } from './DashboardHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SkipLink } from '@/components/ui/skip-link';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Loader2 } from 'lucide-react';


export function AdminLayout() {
    const { user, isLoading, isAdmin, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate('/login', { replace: true });
            } else if (!isAdmin) {
                // Redirect unauthorized users
                navigate('/', { replace: true });
            }
        }
    }, [user, isLoading, isAdmin, navigate]);

    if ((isLoading && !user) || !isAdmin) {
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
        
        // If not loading but also not admin (and user exists), should have been redirected by useEffect
        // but as a fallback show a restricted states
        if (!isAdmin && user) {
            return null; // Or unauthorized UI
        }
    }

    return (
        <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SkipLink />
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar /> {/* Reuse or create AdminSidebar later */}
                <div className="flex-1 flex flex-col min-w-0">
                    <DashboardHeader />
                    <main
                        id="main-content"
                        className="flex-1 overflow-auto p-4 md:p-6 pb-safe-content"
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
