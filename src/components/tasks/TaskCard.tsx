import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Play, 
  CheckCircle2, 
  User, 
  AlertTriangle,
  Trash2 
} from 'lucide-react';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import type { Task } from '@/types/database';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: 'pending' | 'in_progress' | 'completed') => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  completed: {
    label: 'Completed',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
};

export function TaskCard({ task, onStatusChange, onDelete, isUpdating }: TaskCardProps) {
  const status = task.status ?? 'pending';
  const config = statusConfig[status];
  const isOverdue = task.due_date && status !== 'completed' && isPast(new Date(task.due_date));
  const isCompleted = status === 'completed';

  return (
    <Card className={`transition-all ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''} ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-base ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {task.is_personal && (
                <Badge variant="outline" className="text-xs shrink-0">Personal</Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <Badge className={config.className}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
              {!isCompleted && !isOverdue && (
                <span className="text-muted-foreground">
                  ({formatDistanceToNow(new Date(task.due_date), { addSuffix: true })})
                </span>
              )}
            </div>
          )}
          {task.completed_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Completed: {format(new Date(task.completed_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          {task.assigned_by && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>Assigned by Admin</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          {status === 'pending' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(task.id, 'in_progress')}
              disabled={isUpdating}
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Start
            </Button>
          )}
          {status === 'in_progress' && (
            <Button 
              size="sm" 
              variant="default"
              onClick={() => onStatusChange(task.id, 'completed')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Complete
            </Button>
          )}
          {status === 'completed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(task.id, 'pending')}
              disabled={isUpdating}
            >
              Reopen
            </Button>
          )}
          {task.is_personal && onDelete && (
            <Button 
              size="sm" 
              variant="ghost"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={() => onDelete(task.id)}
              disabled={isUpdating}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
