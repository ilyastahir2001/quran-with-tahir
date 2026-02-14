import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import type { AvailabilityStatus } from '@/types/database';

const statusConfig: Record<AvailabilityStatus, { label: string; color: string; dotColor: string }> = {
    online: { label: 'Online', color: 'text-green-600', dotColor: 'bg-green-500' },
    busy: { label: 'Busy', color: 'text-red-600', dotColor: 'bg-red-500' },
    away: { label: 'Away', color: 'text-amber-600', dotColor: 'bg-amber-500' },
    offline: { label: 'Offline', color: 'text-muted-foreground', dotColor: 'bg-slate-400' },
};

export function TeacherStatusToggle() {
    const { teacher } = useAuth();
    const [updating, setUpdating] = useState(false);

    // Default to offline if not set
    const currentStatus: AvailabilityStatus = teacher?.availability_status || 'offline';
    const config = statusConfig[currentStatus];

    const handleStatusChange = async (newStatus: AvailabilityStatus) => {
        if (!teacher?.id || newStatus === currentStatus) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('teachers')
                .update({ availability_status: newStatus })
                .eq('id', teacher.id);

            if (error) throw error;
            toast.success(`Status updated to ${statusConfig[newStatus].label}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed" disabled={updating}>
                    {updating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                    )}
                    <span className="text-xs font-medium">{config.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {(Object.keys(statusConfig) as AvailabilityStatus[]).map((status) => (
                    <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="gap-2"
                    >
                        <div className={`h-2 w-2 rounded-full ${statusConfig[status].dotColor}`} />
                        <span>{statusConfig[status].label}</span>
                        {currentStatus === status && (
                            <span className="ml-auto text-xs text-muted-foreground">Current</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
