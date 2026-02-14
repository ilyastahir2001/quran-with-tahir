import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, AlertTriangle, Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const priorityConfig = {
  normal: { 
    label: 'Normal', 
    icon: Info,
    className: 'bg-secondary text-secondary-foreground',
    cardClassName: '',
  },
  high: { 
    label: 'High', 
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    cardClassName: 'border-orange-200 dark:border-orange-800',
  },
  urgent: { 
    label: 'Urgent', 
    icon: AlertTriangle,
    className: 'bg-destructive text-destructive-foreground',
    cardClassName: 'border-destructive/50 bg-destructive/5',
  },
};

export default function Announcements() {
  const { announcements, isLoading, unreadCount, markAsRead } = useAnnouncements();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Mark announcements as read when viewed
  useEffect(() => {
    const unread = announcements.filter(a => !a.is_read);
    unread.forEach(a => {
      markAsRead.mutate(a.id);
    });
  }, [announcements]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isLongContent = (content: string) => content.length > 200;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Important updates from administration</p>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="mt-2">
            {unreadCount} new
          </Badge>
        )}
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No announcements</h3>
          <p className="text-muted-foreground text-sm mt-1">
            There are no active announcements at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const priority = (announcement.priority as keyof typeof priorityConfig) || 'normal';
            const config = priorityConfig[priority];
            const PriorityIcon = config.icon;
            const isExpanded = expandedIds.has(announcement.id);
            const shouldTruncate = isLongContent(announcement.content);

            return (
              <Card key={announcement.id} className={config.cardClassName}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PriorityIcon className="h-4 w-4" />
                      <h3 className="font-semibold">{announcement.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {priority !== 'normal' && (
                        <Badge className={config.className}>{config.label}</Badge>
                      )}
                      {!announcement.is_read && (
                        <Badge variant="default">New</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(announcement.published_at || announcement.created_at), 'MMM d, yyyy')}
                    {announcement.expires_at && (
                      <span className="ml-2">
                        • Expires {formatDistanceToNow(new Date(announcement.expires_at), { addSuffix: true })}
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent>
                  {shouldTruncate ? (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(announcement.id)}>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {isExpanded ? announcement.content : `${announcement.content.slice(0, 200)}...`}
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                          {isExpanded ? (
                            <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                          ) : (
                            <>Read More <ChevronDown className="h-4 w-4 ml-1" /></>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
