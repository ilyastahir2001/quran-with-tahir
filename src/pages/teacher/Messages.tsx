import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, ShieldCheck } from 'lucide-react';
import { useTeacherMessaging, type StudentContact, type Message } from '@/hooks/useTeacherMessaging';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/usePresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function ContactItem({
    contact,
    isSelected,
    onClick
}: {
    contact: StudentContact;
    isSelected: boolean;
    onClick: () => void;
}) {
    const initials = contact.full_name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left mb-1',
                isSelected
                    ? 'bg-primary/10 border border-primary/20 shadow-sm'
                    : 'hover:bg-muted/50 border border-transparent'
            )}
        >
            <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={contact.avatar_url || undefined} />
                    <AvatarFallback className={cn("font-bold text-xs", contact.type === 'admin' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400")}>{initials}</AvatarFallback>
                </Avatar>
                {contact.type === 'admin' && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white">
                        <ShieldCheck className="h-2 w-2 text-white" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className={cn("font-bold text-sm truncate", contact.type === 'admin' ? "text-amber-700" : "text-slate-700")}>{contact.full_name}</p>
                    {contact.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center bg-primary text-white text-[10px]">
                            {contact.unreadCount}
                        </Badge>
                    )}
                </div>
                {contact.lastMessage && (
                    <p className="text-[11px] text-muted-foreground truncate opacity-70">
                        {'sender_type' in contact.lastMessage && contact.lastMessage.sender_type === 'teacher' ? 'You: ' : ''}
                        {'message' in contact.lastMessage ? contact.lastMessage.message : contact.lastMessage.content}
                    </p>
                )}
            </div>
        </button>
    );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
    const isTeacherStudentMessage = 'message' in message;
    const content = isTeacherStudentMessage ? message.message : message.content;
    return (
        <div className={cn('flex mb-4 px-2', isOwn ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                    isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                <p className={cn(
                    'text-[9px] mt-1 font-bold opacity-60 flex items-center gap-1',
                    isOwn ? 'text-primary-foreground/80 justify-end' : 'text-slate-400'
                )}>
                    {format(new Date(message.created_at), 'h:mm a')}
                    {isOwn && (
                        message.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                    )}
                </p>
            </div>
        </div>
    );
}

export default function TeacherMessages() {
    const { teacher } = useAuth();
    const { contacts, contactsLoading, useMessages, sendMessage, markAsRead } = useTeacherMessaging();
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isUserOnline } = usePresence();

    // Use teacher ID and selected contact ID for channel naming
    const channelId = teacher?.id && selectedContactId
        ? [teacher.id, selectedContactId].sort().join('-')
        : '';

    const { isTyping, sendTyping } = useTypingIndicator(channelId);

    const selectedContact = contacts.find(c => c.id === selectedContactId);
    const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedContactId, selectedContact?.type || 'student');

    // Auto-select first contact
    useEffect(() => {
        if (contacts.length > 0 && !selectedContactId) {
            setSelectedContactId(contacts[0].id);
        }
    }, [contacts, selectedContactId]);

    // Mark messages as read
    useEffect(() => {
        if (selectedContactId && selectedContact) {
            if (selectedContact.unreadCount > 0) {
                markAsRead.mutate({ contactId: selectedContactId, type: selectedContact.type });
            }
        }
    }, [selectedContactId, selectedContact, markAsRead]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContactId || !selectedContact) return;

        sendMessage.mutate(
            { contactId: selectedContactId, message: newMessage.trim(), type: selectedContact.type },
            { onSuccess: () => setNewMessage('') }
        );
    };

    if (contactsLoading) {
        return (
            <div className="flex h-[calc(100vh-140px)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Messages</h1>
                    <p className="text-muted-foreground font-medium">Chat with your students and academy support</p>
                </div>
            </div>

            <Card className="h-full border-none shadow-2xl overflow-hidden bg-slate-50/50">
                <div className="flex h-full">
                    {/* Contacts sidebar */}
                    <div className="w-80 border-r border-border flex flex-col bg-white">
                        <CardHeader className="py-4 px-6 border-b border-border bg-slate-50/50">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Conversations
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            {contacts.length === 0 ? (
                                <div className="p-8 text-center space-y-4">
                                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                        <User className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">No conversations yet</p>
                                </div>
                            ) : (
                                <div className="p-3">
                                    {contacts.map(contact => (
                                        <ContactItem
                                            key={contact.id}
                                            contact={contact}
                                            isSelected={selectedContactId === contact.id}
                                            onClick={() => setSelectedContactId(contact.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 flex flex-col bg-slate-50/30">
                        {selectedContact ? (
                            <>
                                {/* Chat header */}
                                <div className="p-4 border-b border-border bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-primary/5">
                                            <AvatarImage src={selectedContact.avatar_url || undefined} />
                                            <AvatarFallback className="font-bold">
                                                {selectedContact.full_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-slate-900 leading-none mb-1">{selectedContact.full_name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                                    {selectedContact.type === 'admin' ? 'Academy Support Personnel' : 'Student'}
                                                </p>
                                                {isTyping ? (
                                                    <span className="text-[10px] text-primary animate-pulse font-bold">typing...</span>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <span className={`relative flex h-1.5 w-1.5`}>
                                                            {isUserOnline(selectedContact.id) && (
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            )}
                                                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isUserOnline(selectedContact.id) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {isUserOnline(selectedContact.id) ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <ScrollArea className="flex-1 p-6">
                                    {messagesLoading ? (
                                        <div className="flex h-full items-center justify-center py-12">
                                            <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-20 space-y-4 flex flex-col items-center group">
                                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <MessageCircle className="h-8 w-8 text-primary/20" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-400">No messages yet</p>
                                                <p className="text-xs text-slate-300">Start the conversation with {selectedContact.full_name.split(' ')[0]}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto">
                                            {(messages as Message[]).map((message: Message) => (
                                                <MessageBubble
                                                    key={message.id}
                                                    message={message}
                                                    isOwn={
                                                        'sender_type' in message
                                                            ? message.sender_type === 'teacher'
                                                            : message.sender_id !== selectedContactId
                                                    }
                                                />
                                            ))}
                                            <div ref={messagesEndRef} />
                                            {isTyping && (
                                                <div className="flex items-center gap-1 px-4 py-2">
                                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1 shadow-sm">
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Message input */}
                                <div className="p-6 bg-white border-t border-border">
                                    <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3 p-1 pl-4 bg-slate-50 border border-slate-200 shadow-inner rounded-2xl focus-within:ring-2 ring-primary/10 transition-all">
                                        <input
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                sendTyping();
                                            }}
                                            placeholder={selectedContact.type === 'admin' ? "Message academy support..." : "Send a message to your student..."}
                                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-3"
                                        />
                                        <Button
                                            type="submit"
                                            className="rounded-xl h-auto px-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                            disabled={!newMessage.trim() || sendMessage.isPending}
                                        >
                                            {sendMessage.isPending ? (
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </form>
                                    <p className="text-center text-[10px] text-muted-foreground mt-3 italic opacity-60">
                                        Messages are shared only with the selected participant.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-bounce">
                                    <MessageCircle className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Select a Conversation</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto">Choose a student or contact Academy Support to view and send messages.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
