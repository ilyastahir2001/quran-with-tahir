import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Trash2, Clock, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/contexts/RealtimeContext';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'system';
    read: boolean;
    created_at: string;
}

export const NotificationDrawer = ({ children }: { children?: React.ReactNode }) => {
    const { user } = useAuth();
    const { notificationsCount } = useRealtime();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setNotifications(data as Notification[]);
        }
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
            case 'success': return <CheckCircle2 className="h-4 w-4 text-success" />;
            default: return <Info className="h-4 w-4 text-info" />;
        }
    };

    return (
        <Sheet onOpenChange={(open) => open && fetchNotifications()}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notificationsCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in zoom-in bg-destructive">
                                {notificationsCount > 9 ? '9+' : notificationsCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-6 border-b flex flex-row items-center justify-between space-y-0">
                    <SheetTitle className="flex items-center gap-2">
                        Notifications
                        {notificationsCount > 0 && (
                            <Badge variant="secondary" className="font-normal">
                                {notificationsCount} New
                            </Badge>
                        )}
                    </SheetTitle>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs gap-1.5 focus:ring-0">
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </Button>
                    )}
                </SheetHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="flex flex-col">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground animate-pulse">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center space-y-3 mt-20">
                                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <Bell className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">No notifications yet</p>
                                    <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                                        We'll let you know when something important happens!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "relative group p-4 border-b transition-colors hover:bg-muted/50 flex gap-4",
                                        !n.read && "bg-primary/5 border-l-4 border-l-primary"
                                    )}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn("text-sm font-medium leading-none", !n.read && "text-primary")}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed pr-6">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-3 pt-1">
                                            {!n.read && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-[10px] font-semibold text-primary hover:underline"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(n.id)}
                                                className="text-[10px] font-semibold text-destructive hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/30">
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium">
                        Real-time System Monitoring Active
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
};
