import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    History,
    MessageSquare,
    Star,
    BookOpen,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    LayoutDashboard
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ClassAuditLogs() {
    const { student, activeChild, isParent } = useAuth();
    const [searchParams] = useSearchParams();
    const childIdParam = searchParams.get('childId');

    // Use either the childId from URL or the globally active child, or the student themselves
    const targetId = childIdParam || activeChild?.id || student?.id;

    const { data: lessons, isLoading } = useQuery({
        queryKey: ['class-audit-logs', targetId],
        queryFn: async () => {
            if (!targetId) return [];
            const { data, error } = await supabase
                .from('lessons')
                .select(`
          *,
          teacher:teachers(id, bio, profile:profiles(full_name, avatar_url)),
          attendance:attendance(status, recorded_at)
        `)
                .eq('student_id', targetId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!targetId
    });

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-green-500';
        if (rating >= 3) return 'text-amber-500';
        return 'text-red-500';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>;
            case 'absent': return <Badge variant="destructive">Absent</Badge>;
            case 'late': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Late</Badge>;
            default: return <Badge variant="outline">Unrecorded</Badge>;
        }
    };

    if (!targetId) return <div className="p-8 text-center">No child selected for auditing.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Class Audit Logs <History className="h-8 w-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">Detailed transparency into every session and teacher evaluation.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/student/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse h-40" />
                    ))}
                </div>
            ) : lessons?.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/10 py-20">
                    <CardContent className="flex flex-col items-center">
                        <History className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-bold">No Records Found</h3>
                        <p className="text-muted-foreground">Once classes are completed, detailed logs will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {lessons?.map((lesson: any) => (
                        <Card key={lesson.id} className="border-none shadow-md overflow-hidden bg-card hover:shadow-lg transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                {/* Visual Status Sidebar on Desktop */}
                                <div className={`w-2 md:w-4 ${lesson.rating_progress >= 4 ? 'bg-green-500' : 'bg-primary/30'}`} />

                                <div className="flex-1 p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg">
                                                    Teacher: {lesson.teacher?.profile?.full_name || 'Assigned Instructor'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(lesson.created_at), 'PPPPp')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(lesson.attendance?.[0]?.status)}
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-muted/20 p-4 rounded-2xl border mb-4">
                                        <div className="space-y-2">
                                            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Lesson Focus</p>
                                            <div className="flex items-center gap-2 font-bold">
                                                <BookOpen className="h-4 w-4 text-primary" />
                                                {lesson.surah || 'General Study'} (Verse {lesson.ayah_from || 0} - {lesson.ayah_to || 0})
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Quality Indicators</p>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span>Focus</span>
                                                    <span className={getRatingColor(lesson.rating_concentration)}>{lesson.rating_concentration}/5</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span>Revision</span>
                                                    <span className={getRatingColor(lesson.rating_revision)}>{lesson.rating_revision}/5</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Teacher Insights</p>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-bold">Progress: {lesson.rating_progress}/5</span>
                                            </div>
                                        </div>
                                    </div>

                                    {lesson.comments && (
                                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 relative">
                                            <MessageSquare className="absolute -top-3 -left-3 h-6 w-6 text-primary fill-background p-1" />
                                            <p className="text-foreground font-medium leading-relaxed italic">
                                                "{lesson.comments}"
                                            </p>
                                            {lesson.ethics && (
                                                <div className="mt-2 text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-tighter">
                                                    <CheckCircle2 className="h-3 w-3" /> Behavior: {lesson.ethics}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
