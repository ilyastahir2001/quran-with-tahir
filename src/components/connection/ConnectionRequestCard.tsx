import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Check, X, Clock, MessageSquare } from 'lucide-react';
import type { ConnectionRequest } from '@/types/database';

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  onAccept?: (requestId: string, studentId: string) => void;
  onReject?: (requestId: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export function ConnectionRequestCard({
  request,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: ConnectionRequestCardProps) {
  const student = request.student;
  const isPending = request.status === 'pending';

  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student?.avatar_url || ''} alt={student?.full_name || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {student?.full_name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-foreground">{student?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{student?.email}</p>
              </div>
              {getStatusBadge()}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {student?.course_level && (
                <Badge variant="secondary" className="text-xs">
                  {student.course_level}
                </Badge>
              )}
              {student?.country && (
                <Badge variant="outline" className="text-xs">
                  {student.country}
                </Badge>
              )}
            </div>

            {request.message && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MessageSquare className="h-3 w-3" />
                  Message
                </div>
                <p className="text-sm text-foreground">{request.message}</p>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(request.created_at), 'MMM d, yyyy • h:mm a')}
              </div>

              {isPending && onAccept && onReject && (
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRejecting}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Connection Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this connection request from {student?.full_name}?
                          They will be notified of your decision.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onReject(request.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Reject Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    size="sm"
                    onClick={() => onAccept(request.id, request.student_id)}
                    disabled={isAccepting}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isAccepting ? 'Accepting...' : 'Accept'}
                  </Button>
                </div>
              )}

              {!isPending && request.responded_at && (
                <span className="text-xs text-muted-foreground">
                  Responded: {format(new Date(request.responded_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
