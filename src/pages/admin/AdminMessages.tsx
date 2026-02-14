import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Send, Paperclip, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { usePresence } from '@/hooks/usePresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { Check, CheckCheck } from 'lucide-react';

interface ChatPartner {
    id: string;
    full_name: string;
    avatar_url: string | null;
    last_message?: string;
    last_message_at?: string;
}

interface ChatMessage {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    attachment_url: string | null;
    is_read: boolean | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}


export default function AdminMessages() {
    const { profile, user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const partnerIdParam = searchParams.get('partnerId');
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { isUserOnline } = usePresence();

    // Generate a unique channel ID for typing indicators (sorted IDs to ensure consistency)
    const typingChannelId = user?.id && selectedPartnerId
        ? [user.id, selectedPartnerId].sort().join('-')
        : '';

    const { isTyping, sendTyping } = useTypingIndicator(typingChannelId);

    // Initial partner selection from URL
    useEffect(() => {
        if (partnerIdParam && !selectedPartnerId) {
            setSelectedPartnerId(partnerIdParam);
        }
    }, [partnerIdParam, selectedPartnerId]);

    // 1. Fetch Chat Partners (Users we have chatted with)
    const { data: partners, isLoading: isLoadingPartners } = useQuery({
        queryKey: ['admin-chat-partners', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // Step 1: Fetch messages without joins (messages table has no FK relationships)
            const { data: messages, error } = await supabase
                .from('messages')
                .select('id, content, created_at, sender_id, recipient_id')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!messages || messages.length === 0) return [];

            // Step 2: Extract unique partner IDs
            const partnerIds = new Set<string>();
            messages.forEach((msg) => {
                if (msg.sender_id !== user.id) partnerIds.add(msg.sender_id);
                if (msg.recipient_id !== user.id) partnerIds.add(msg.recipient_id);
            });

            if (partnerIds.size === 0) return [];

            // Step 3: Fetch profiles for all partners using RPC (bypasses RLS and handles ID mapping)
            const { data: profiles, error: profilesError } = await supabase
                .rpc('get_chat_users_details', { target_ids: Array.from(partnerIds) });

            if (profilesError) throw profilesError;

            // Step 4: Create a map of profiles for quick lookup
            const profileMap = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();
            profiles?.forEach((p) => profileMap.set(p.id, p));

            // Step 5: Build the partners list with last message info
            const headerMap = new Map<string, ChatPartner>();

            messages.forEach((msg) => {
                const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
                const partnerProfile = profileMap.get(partnerId);

                if (partnerProfile && !headerMap.has(partnerId)) {
                    headerMap.set(partnerId, {
                        id: partnerId,
                        full_name: partnerProfile.full_name || 'Unknown User',
                        avatar_url: partnerProfile.avatar_url,
                        last_message: msg.content,
                        last_message_at: msg.created_at
                    });
                }
            });

            return Array.from(headerMap.values());
        },
        enabled: !!user?.id
    });

    // 2. Fetch Selected Partner Profile (if not in partners list)
    const { data: selectedPartnerProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['admin-partner-profile', selectedPartnerId],
        queryFn: async () => {
            if (!selectedPartnerId) return null;

            // Use the secure RPC function to fetch user details (bypassing RLS)
            const { data, error } = await supabase
                .rpc('get_chat_user_details', { target_id: selectedPartnerId });

            if (error) {
                console.warn('AdminMessages: Partner profile not found via RPC', error);
                return null;
            }

            // RPC with RETURNS TABLE returns an array
            return data && data.length > 0 ? data[0] : null;
        },
        enabled: !!selectedPartnerId
    });

    // 3. Fetch Messages for Selected Partner
    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: ['admin-messages', selectedPartnerId],
        queryFn: async () => {
            if (!selectedPartnerId || !user?.id) return [];

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .or(`sender_id.eq.${selectedPartnerId},recipient_id.eq.${selectedPartnerId}`)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Post-filter to ensure it's specifically between these two users
            // (Supabase '.or' with AND-like conditions can be tricky, so we filter in JS as a safety net)
            return (data as ChatMessage[]).filter(m =>
                (m.sender_id === user.id && m.recipient_id === selectedPartnerId) ||
                (m.sender_id === selectedPartnerId && m.recipient_id === user.id)
            );
        },
        enabled: !!selectedPartnerId
    });

    // 3. Subscribe to Realtime Messages
    useEffect(() => {
        const channel = supabase
            .channel('admin-chat-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${user?.id}`
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ['admin-chat-partners'] });

                    if (selectedPartnerId === payload.new.sender_id) {
                        queryClient.invalidateQueries({ queryKey: ['admin-messages', selectedPartnerId] });
                    } else {
                        toast.info('New message received');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, selectedPartnerId, queryClient]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // 4. Send Message Mutation
    const sendMessage = useMutation({
        mutationFn: async () => {
            if (!selectedPartnerId || !newMessage.trim() || !user?.id) return;

            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    recipient_id: selectedPartnerId,
                    content: newMessage,
                    is_read: false
                });

            if (error) throw error;
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['admin-messages', selectedPartnerId] });
            queryClient.invalidateQueries({ queryKey: ['admin-chat-partners'] });
        },
        onError: () => {
            toast.error('Failed to send message');
        }
    });

    // 5. Mark messages as read
    useEffect(() => {
        if (!selectedPartnerId || !messages) return;

        const unreadMessages = messages.filter(
            m => m.sender_id === selectedPartnerId && !m.is_read
        );

        if (unreadMessages.length > 0) {
            const markAsRead = async () => {
                const { error } = await supabase
                    .from('messages')
                    .update({ is_read: true, read_at: new Date().toISOString() })
                    .in('id', unreadMessages.map(m => m.id));

                if (!error) {
                    // Update cache optimistically or invalidate
                    queryClient.invalidateQueries({ queryKey: ['admin-messages', selectedPartnerId] });
                    queryClient.invalidateQueries({ queryKey: ['admin-chat-partners'] });
                }
            };

            markAsRead();
        }
    }, [messages, selectedPartnerId, queryClient]);

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">Real-time communication with teachers and students.</p>
            </div>

            <Card className="flex-1 flex overflow-hidden border-0 shadow-none ring-1 ring-border/50 bg-background/50 backdrop-blur-sm">
                {/* Sidebar - Partners List */}
                <div className="w-80 border-r bg-muted/10 flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search conversations..." className="pl-9" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-1 p-2">
                            {isLoadingPartners ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                            ) : partners?.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet.</div>
                            ) : (
                                partners?.map(partner => (
                                    <button
                                        key={partner.id}
                                        onClick={() => setSelectedPartnerId(partner.id)}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${selectedPartnerId === partner.id
                                            ? 'bg-primary/10 hover:bg-primary/15'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <Avatar className="h-10 w-10 border bg-background">
                                            <AvatarImage src={partner.avatar_url || ''} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm truncate">{partner.full_name}</span>
                                                {partner.last_message_at && (
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {format(new Date(partner.last_message_at), 'MMM d')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate font-medium">
                                                {partner.last_message || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-background">
                    {selectedPartnerId ? (
                        <>
                            {/* Header */}
                            <div className="h-16 border-b flex items-center px-6 justify-between bg-card/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={selectedPartnerProfile?.avatar_url || partners?.find(p => p.id === selectedPartnerId)?.avatar_url || ''} />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-sm">
                                            {partners?.find(p => p.id === selectedPartnerId)?.full_name ||
                                                selectedPartnerProfile?.full_name ||
                                                (isLoadingProfile ? 'Loading...' : 'User not found')}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            {isTyping ? (
                                                <span className="text-xs text-primary animate-pulse font-medium">typing...</span>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`relative flex h-2 w-2`}>
                                                        {isUserOnline(selectedPartnerId) && (
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        )}
                                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isUserOnline(selectedPartnerId) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {isUserOnline(selectedPartnerId) ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 p-6">
                                <div className="flex flex-col gap-4">
                                    {isLoadingMessages ? (
                                        <div className="text-center text-sm text-muted-foreground py-10">Loading messages...</div>
                                    ) : messages?.length === 0 ? (
                                        <div className="text-center text-sm text-muted-foreground py-10">
                                            No messages yet. Say hello!
                                        </div>
                                    ) : (
                                        messages?.map((msg) => {
                                            const isMe = msg.sender_id === user?.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                                            : 'bg-muted/50 border rounded-bl-none'
                                                            }`}
                                                    >
                                                        <p>{msg.content}</p>
                                                        <span className={`text-[10px] block mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                            {format(new Date(msg.created_at), 'h:mm a')}
                                                            {isMe && (
                                                                msg.is_read ? (
                                                                    <CheckCheck className="h-3 w-3 text-blue-100" />
                                                                ) : (
                                                                    <Check className="h-3 w-3" />
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                    {isTyping && (
                                        <div className="flex items-center gap-1 px-4 py-2">
                                            <div className="bg-muted/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 border-t bg-card/50">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        sendMessage.mutate();
                                    }}
                                    className="flex gap-2"
                                >
                                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            sendTyping();
                                        }}
                                        placeholder="Type your message..."
                                        className="flex-1"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim() || sendMessage.isPending}
                                        size="icon"
                                        className="shrink-0"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                            <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Select a conversation</h3>
                            <p className="text-sm max-w-sm">
                                Choose a teacher or student from the sidebar to start chatting or view message history.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
