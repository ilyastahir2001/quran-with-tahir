import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Calendar, User, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Reminder = Tables<'reminders'> & {
  student?: Tables<'students'> | null;
};

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function ReminderCard({ reminder, onToggleComplete, onDelete, isUpdating }: ReminderCardProps) {
  const isCompleted = reminder.is_completed ?? false;
  const isOverdue = !isCompleted && isPast(new Date(reminder.remind_at));

  const studentInitials = reminder.student?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className={`transition-all ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''} ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-base ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {reminder.title}
              </h3>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          {isCompleted ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Done
            </Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminder.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reminder.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(reminder.remind_at), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{format(new Date(reminder.remind_at), 'h:mm a')}</span>
          </div>
          {!isCompleted && !isOverdue && (
            <span className="text-muted-foreground">
              ({formatDistanceToNow(new Date(reminder.remind_at), { addSuffix: true })})
            </span>
          )}
        </div>

        {/* Linked Student */}
        {reminder.student && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Avatar className="h-6 w-6">
              <AvatarImage src={reminder.student.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{studentInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{reminder.student.full_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          {isCompleted ? (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onToggleComplete(reminder.id, false)}
              disabled={isUpdating}
            >
              Reopen
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="default"
              onClick={() => onToggleComplete(reminder.id, true)}
              disabled={isUpdating}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Complete
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => onDelete(reminder.id)}
            disabled={isUpdating}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
