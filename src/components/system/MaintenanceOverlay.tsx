import React from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const MaintenanceOverlay = () => {
    const { isMaintenanceMode } = useRealtime();
    const { isAdmin, signOut } = useAuth();
    const navigate = useNavigate();

    // If not in maintenance mode, or if the user is an admin, don't show the overlay
    if (!isMaintenanceMode || isAdmin) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="bg-amber-100 dark:bg-amber-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">System Maintenance</h1>
                    <p className="text-muted-foreground text-lg">
                        We're currently performing some scheduled upgrades to make your experience better.
                        We'll be back online shortly!
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                            await signOut();
                            navigate('/login');
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Thank you for your patience.
                    </p>
                </div>
            </div>
        </div>
    );
};
