import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudentLessons } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, Star, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Lessons() {
  const { student, profile, isParent, activeChild } = useAuth();
  const displayStudent = isParent && activeChild ? activeChild : student;

  const { data: lessons, isLoading } = useStudentLessons(displayStudent?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lesson History</h1>
          <p className="text-muted-foreground">Track your Quranic journey and teacher feedback.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lessons && lessons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {lessons.map((lesson: any) => (
            <Card key={lesson.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border border-slate-100/50">
              <CardHeader className="pb-3 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {lesson.surah ? `Surah ${lesson.surah}` : 'Lesson Session'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(lesson.created_at), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none shadow-none uppercase tracking-wider text-[10px] font-bold">
                    {lesson.quran_subject || 'General'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {lesson.page_from ? `Page ${lesson.page_from} - ${lesson.page_to}` : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      {lesson.rating_concentration ? `${lesson.rating_concentration}/5` : 'N/A'}
                    </div>
                  </div>
                </div>

                {lesson.comments && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Teacher Feedback</div>
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      "{lesson.comments}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-md">
          <CardContent className="py-20 text-center">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-black text-2xl mb-2 tracking-tight">No Lessons Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your Quranic journey is just beginning. Your lesson history will appear here after your first completed session.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
