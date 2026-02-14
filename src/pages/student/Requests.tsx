import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useStudentConnection } from '@/hooks/useStudentConnection';
import { useAuth } from '@/hooks/useAuth';
import {
  FileQuestion,
  UserPlus,
  Clock,
  X,
  CalendarClock,
  MessageSquare,
  Check,
  Loader2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function Requests() {
  const {
    connectionRequests,
    rescheduleRequests,
    isLoading,
    cancelRequest,
    acceptInvitation,
    rejectInvitation
  } = useStudentConnection();
  const { student, isParent, activeChild } = useAuth();
  const displayStudent = isParent && activeChild ? activeChild : student;

  const getConnectionStatusBadge = (status: string) => {
    switch (status) {
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

  const getRescheduleStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const hasNoRequests = connectionRequests.length === 0 && rescheduleRequests.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Requests</h1>
        <p className="text-muted-foreground">Your connection and reschedule requests</p>
      </div>

      {
        displayStudent?.teacher_selection_mode === 'academy' && !displayStudent.teacher_id && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-primary/10 to-transparent overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24 text-primary animate-pulse" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <GraduationCap className="h-6 w-6" />
                Academy Matching Request
              </CardTitle>
              <CardDescription className="text-primary/70">
                Our experts are finding the perfect teacher for your learning path.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/10">
                <div>
                  <p className="text-sm font-bold text-slate-900">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-amber-500 hover:bg-amber-600 animate-pulse">Matching in Progress</Badge>
                    <span className="text-xs text-muted-foreground italic">Approx. 24-48 hours</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Selected Schedule</p>
                  <div className="flex flex-wrap justify-end gap-1 mt-1">
                    {displayStudent.schedule_days?.map((day: string) => (
                      <Badge key={day} variant="outline" className="text-[10px] bg-white">{day.slice(0, 3)}</Badge>
                    ))}
                    <Badge variant="outline" className="text-[10px] bg-white">{displayStudent.schedule_time}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      {
        hasNoRequests ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No Requests</h3>
              <p className="text-muted-foreground">
                Your requests will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Received Invitations Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Received Invitations
                </CardTitle>
                <CardDescription>
                  Teachers who want to connect with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionRequests.filter(r => r.initiated_by_role === 'teacher').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No invitations received
                  </p>
                ) : (
                  <div className="space-y-4">
                    {connectionRequests
                      .filter(r => r.initiated_by_role === 'teacher')
                      .map((request) => {
                        const teacher = request.teacher;
                        const profile = teacher?.profile;
                        const isPending = request.status === 'pending';

                        return (
                          <div
                            key={request.id}
                            className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Teacher Profile'} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {profile?.full_name?.charAt(0) || 'T'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {profile?.full_name || 'Teacher'}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    Received {format(new Date(request.created_at), 'MMM d, yyyy')}
                                  </div>
                                </div>
                                {getConnectionStatusBadge(request.status)}
                              </div>

                              {request.message && (
                                <div className="mt-2 p-2 bg-muted/50 rounded text-sm italic">
                                  "{request.message}"
                                </div>
                              )}

                              {isPending && (
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => acceptInvitation.mutate(request)}
                                    disabled={acceptInvitation.isPending}
                                  >
                                    {acceptInvitation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Check className="h-4 w-4 mr-1" />
                                    )}
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rejectInvitation.mutate(request.id)}
                                    disabled={rejectInvitation.isPending}
                                  >
                                    {rejectInvitation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <X className="h-4 w-4 mr-1" />
                                    )}
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connection Requests Section (Sent by Student) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5" />
                  Sent Requests
                </CardTitle>
                <CardDescription>
                  Track your teacher connection requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionRequests.filter(r => r.initiated_by_role === 'student' || !r.initiated_by_role).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sent requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {connectionRequests
                      .filter(r => r.initiated_by_role === 'student' || !r.initiated_by_role)
                      .map((request) => {
                        const teacher = request.teacher;
                        const profile = teacher?.profile;
                        const isPending = request.status === 'pending';

                        return (
                          <div
                            key={request.id}
                            className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Teacher Profile'} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {profile?.full_name?.charAt(0) || 'T'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {profile?.full_name || 'Teacher'}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    Sent {format(new Date(request.created_at), 'MMM d, yyyy')}
                                  </div>
                                </div>
                                {getConnectionStatusBadge(request.status)}
                              </div>

                              {request.message && (
                                <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Your message
                                  </div>
                                  {request.message}
                                </div>
                              )}

                              {isPending && (
                                <div className="mt-3">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={cancelRequest.isPending}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel Request
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Connection Request</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to cancel this connection request?
                                          You can always send a new request later.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => cancelRequest.mutate(request.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Cancel Request
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}

                              {request.responded_at && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Responded: {format(new Date(request.responded_at), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reschedule Requests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Reschedule Requests
                </CardTitle>
                <CardDescription>
                  Track your class reschedule requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rescheduleRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reschedule requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {rescheduleRequests.map((request) => {
                      const classInfo = request.class;

                      return (
                        <div
                          key={request.id}
                          className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card"
                        >
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-foreground">
                                  Class on {classInfo?.scheduled_date ?
                                    format(new Date(classInfo.scheduled_date), 'MMM d, yyyy') :
                                    'Unknown date'}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  Requested {format(new Date(request.created_at), 'MMM d, yyyy')}
                                </div>
                              </div>
                              {getRescheduleStatusBadge(request.status)}
                            </div>

                            {request.reason && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Reason: {request.reason}
                              </p>
                            )}

                            {Array.isArray(request.preferred_times) && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1">Preferred times:</p>
                                <div className="flex flex-wrap gap-1">
                                  {request.preferred_times.map((time, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {typeof time === 'string' ? time : JSON.stringify(time)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )
      }
    </div >
  );
}
