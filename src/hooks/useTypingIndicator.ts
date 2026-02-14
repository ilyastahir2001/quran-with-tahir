import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTypingIndicator = (channelId: string) => {
    const { user } = useAuth();
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSentRef = useRef<number>(0);

    useEffect(() => {
        if (!channelId || !user) return;

        const channel = supabase.channel(`typing:${channelId}`)
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.user_id !== user.id) {
                    setIsTyping(true);
                    
                    // Clear previous timeout
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }
                    
                    // Set new timeout to clear typing status
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(false);
                    }, 3000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelId, user]);

    const sendTyping = async () => {
        if (!channelId || !user) return;

        const now = Date.now();
        if (now - lastSentRef.current > 2000) { // Throttle to every 2 seconds
            lastSentRef.current = now;
            await supabase.channel(`typing:${channelId}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: user.id }
            });
        }
    };

    return { isTyping, sendTyping };
};
