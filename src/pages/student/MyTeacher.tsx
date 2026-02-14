import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStudentConnection } from '@/hooks/useStudentConnection';
import {
  UserCheck,
  Search,
  Calendar,
  BookOpen,
} from 'lucide-react';

export default function MyTeacher() {
  const { connectedTeacher, hasConnectedTeacher, isLoading, refreshProfile } = useStudentConnection();
  const queryClient = useQueryClient();

  // Real-time updates for teacher status
  React.useEffect(() => {
    const channel = supabase
      .channel('my-teacher-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teachers' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connected-teacher'] });
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, refreshProfile]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!hasConnectedTeacher) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Teacher</h1>
          <p className="text-muted-foreground">Your connected Quran teacher</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Teacher Connected</h3>
            <p className="text-muted-foreground mb-4">
              You haven't connected with a teacher yet. Browse our qualified teachers and send a connection request.
            </p>
            <Button asChild>
              <Link to="/student/find-tutors">
                <Search className="h-4 w-4 mr-2" />
                Find a Tutor
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teacher = connectedTeacher;
  const profile = teacher?.profile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Teacher</h1>
        <p className="text-muted-foreground">Your connected Quran teacher</p>
      </div>

      <Card className="max-w-md mx-auto overflow-hidden border-none shadow-2xl bg-gradient-to-br from-white to-slate-50">
        <CardContent className="p-12 text-center">
          <div className="relative inline-block mb-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                {profile?.full_name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 h-6 w-6 rounded-full border-4 border-white" />
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            {profile?.full_name || 'My Teacher'}
          </h2>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            {teacher?.status === 'approved' ? 'Assigned Teacher' : 'Academy Scholar'}
          </Badge>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        <Card className="hover:bg-muted/50 transition-all cursor-pointer border-none shadow-md group">
          <CardContent className="p-6">
            <Link to="/student/schedule" className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">View Schedule</h3>
                <p className="text-sm text-muted-foreground">See your upcoming classes</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-all cursor-pointer border-none shadow-md group">
          <CardContent className="p-6">
            <Link to="/student/lessons" className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Lesson History</h3>
                <p className="text-sm text-muted-foreground">Review past lessons</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
