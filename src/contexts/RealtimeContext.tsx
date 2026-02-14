import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

interface RealtimeContextType {
    notificationsCount: number;
    isMaintenanceMode: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
    notificationsCount: 0,
    isMaintenanceMode: false,
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    useEffect(() => {
        if (!user) return;

        // 1. Initial Data Fetch for essential global state
        const fetchInitialState = async () => {
            try {
                // Get unread notifications count
                // Get unread notifications count
                const query = supabase
                    .from('notifications')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('read', false);

                const { count } = await query;

                setNotificationsCount(count || 0);

                // Get maintenance mode status
                const { data: configs, error } = await supabase
                    .from('system_configs')
                    .select('value')
                    .eq('key', 'maintenance_mode');

                if (!error && configs && configs.length > 0) {
                    setIsMaintenanceMode(configs[0].value === 'true');
                }
            } catch (err) {
                console.error('Error fetching initial realtime state:', err);
            }
        };

        fetchInitialState();

        // 2. Real-time Subscriptions

        // Notifications Channel
        const notificationsChannel = supabase
            .channel(`user-notifications-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload: RealtimePostgresChangesPayload<Tables<'notifications'>>) => {
                    const newData = payload.new as Tables<'notifications'>;
                    const oldData = payload.old as Tables<'notifications'>;

                    if (payload.eventType === 'INSERT') {
                        setNotificationsCount(prev => prev + 1);
                        toast.info(newData.title || 'New Notification', {
                            description: newData.message,
                        });
                    } else if (payload.eventType === 'UPDATE' && newData.read === true && oldData.read === false) {
                        setNotificationsCount(prev => Math.max(0, prev - 1));
                    }
                    // Invalidate notifications queries
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                }
            )
            .subscribe();

        // System Configs Channel
        const systemConfigsChannel = supabase
            .channel('system-configs-global')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'system_configs',
                },
                (payload: RealtimePostgresChangesPayload<Tables<'system_configs'>>) => {
                    const newData = payload.new as Tables<'system_configs'>;
                    if (newData && newData.key === 'maintenance_mode') {
                        setIsMaintenanceMode(newData.value === 'true');
                        if (newData.value === 'true') {
                            toast.warning('System entering maintenance mode soon.');
                        }
                    }
                    // Invalidate generic config queries
                    queryClient.invalidateQueries({ queryKey: ['admin-system-configs'] });
                }
            )
            .subscribe();

        // Cleanup
        return () => {
            supabase.removeChannel(notificationsChannel);
            supabase.removeChannel(systemConfigsChannel);
        };
    }, [user, queryClient]);

    return (
        <RealtimeContext.Provider value={{ notificationsCount, isMaintenanceMode }}>
            {children}
        </RealtimeContext.Provider>
    );
};
