import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PresenceState {
    [key: string]: Presence[];
}

interface Presence {
    user_id: string;
    online_at: string;
    [key: string]: any;
}

export const usePresence = () => {
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel('global_presence')
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState<Presence>();
                const users = new Set<string>();
                
                Object.values(newState).forEach((presences) => {
                    presences.forEach((p) => {
                        if (p.user_id) users.add(p.user_id);
                    });
                });
                
                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: Presence[] }) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newPresences.forEach((p) => {
                        if (p.user_id) newSet.add(p.user_id);
                    });
                    return newSet;
                });
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: Presence[] }) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    leftPresences.forEach((p) => {
                        if (p.user_id) newSet.delete(p.user_id);
                    });
                    return newSet;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return { 
        onlineUsers, 
        isUserOnline: (userId: string) => onlineUsers.has(userId) 
    };
};
