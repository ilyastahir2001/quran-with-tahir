import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, AlertTriangle } from 'lucide-react';
import { moderateMessage } from '@/lib/chatModeration';
import type { SessionChat } from '@/types/virtual';

interface ChatBoxProps {
    messages: SessionChat[];
    currentUserId: string | undefined;
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
}

const RATE_LIMIT_MS = 1500;

export function ChatBox({
    messages,
    currentUserId,
    onSend,
    disabled,
}: ChatBoxProps) {
    const [input, setInput] = useState('');
    const [warning, setWarning] = useState<string | null>(null);
    const [lastSentAt, setLastSentAt] = useState(0);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages.length]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || disabled || sending) return;

        // Rate limit
        const now = Date.now();
        if (now - lastSentAt < RATE_LIMIT_MS) {
            setWarning('Please wait before sending another message.');
            setTimeout(() => setWarning(null), 2000);
            return;
        }

        // Client-side moderation
        const result = moderateMessage(trimmed);
        if (result.blocked) {
            setWarning(result.reason ?? 'Message blocked.');
            setTimeout(() => setWarning(null), 3000);
            return;
        }

        setSending(true);
        setInput('');
        setLastSentAt(now);

        try {
            await onSend(trimmed);
        } catch {
            setWarning('Failed to send message. Please try again.');
            setTimeout(() => setWarning(null), 3000);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-2 p-3 min-h-0"
            >
                {messages.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">
                        No messages yet. Say hello!
                    </p>
                )}

                {messages.map((msg) => {
                    const isSelf = msg.sender_id === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isSelf
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted text-foreground rounded-bl-sm'
                                    } ${msg.is_blocked ? 'opacity-50 line-through' : ''}`}
                            >
                                <p className="break-words">{msg.message}</p>
                                <p
                                    className={`text-[10px] mt-1 ${isSelf ? 'text-primary-foreground/60' : 'text-muted-foreground'
                                        }`}
                                >
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Warning */}
            {warning && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{warning}</span>
                </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 p-3 border-t">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={disabled || sending}
                    className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={disabled || sending || !input.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
