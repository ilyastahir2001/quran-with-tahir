import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ClipboardCheck,
    History,
    Clock,
    Trophy,
    Plus,
    FileText,
    Award,
    ChevronRight,
    Calendar,
    BookOpen
} from 'lucide-react';
import { CertificateGallery } from '@/components/exams/CertificateGallery';
import { ExamRequestForm } from '@/components/exams/ExamRequestForm';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function StudentExams() {
    const { student } = useAuth();

    const { data: exams, isLoading } = useQuery({
        queryKey: ['student-exams', student?.id],
        queryFn: async () => {
            if (!student?.id) return [];
            // Join with exam_requests to get surah_name and type
            const { data, error } = await supabase
                .from('exams')
                .select(`
                    *,
                    exam_requests (
                        surah_name,
                        juz_number,
                        type
                    ),
                    exam_grading (*)
                `)
                .eq('student_id', student.id)
                .order('scheduled_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!student?.id
    });

    const { data: requests } = useQuery({
        queryKey: ['student-exam-requests', student?.id],
        queryFn: async () => {
            if (!student?.id) return [];
            const { data, error } = await supabase
                .from('exam_requests')
                .select('*')
                .eq('student_id', student.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!student?.id
    });

    const { data: certificates } = useQuery({
        queryKey: ['student-certificates', student?.id],
        queryFn: async () => {
            if (!student?.id) return [];
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('student_id', student.id);
            if (error) throw error;
            return data;
        },
        enabled: !!student?.id
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <ClipboardCheck className="h-8 w-8 text-primary" />
                        Examinations & Progress
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">Request assessments and view your academic achievements.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Requests and Active */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="requests" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 rounded-2xl p-1 bg-muted/50">
                            <TabsTrigger value="requests" className="rounded-xl font-bold">New Request</TabsTrigger>
                            <TabsTrigger value="history" className="rounded-xl font-bold">Exam History</TabsTrigger>
                            <TabsTrigger value="certificates" className="rounded-xl font-bold">My Certificates</TabsTrigger>
                        </TabsList>

                        <TabsContent value="requests" className="space-y-6">
                            <ExamRequestForm />

                            <Card className="border-none shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-orange-500" />
                                        Pending Requests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {requests?.filter(r => (r.status as unknown as string) === 'pending').length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground italic">No current pending requests</div>
                                        ) : (
                                            requests?.filter(r => (r.status as unknown as string) === 'pending').map(req => (
                                                <div key={req.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                                            <BookOpen className="h-6 w-6 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{req.surah_name || `Juz ${req.juz_number}`}</p>
                                                            <p className="text-sm text-muted-foreground uppercase tracking-widest font-black opacity-50">{req.type}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="h-7 px-3 rounded-full border-orange-200 text-orange-600 bg-orange-50 font-bold uppercase text-[10px]">Awaiting Admin</Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-6">
                            {exams?.filter(e => e.status === 'completed').length === 0 ? (
                                <Card className="border-none shadow-lg p-20 text-center">
                                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                        <History className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">No Exam History Yet</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">Complete your first examination to see your detailed results and certificates here.</p>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {exams?.filter(e => e.status === 'completed').map(exam => {
                                        const reqData = exam.exam_requests as unknown as { surah_name?: string; juz_number?: number; type?: string } | null;
                                        return (
                                            <Card key={exam.id} className="border-none shadow-md hover:shadow-xl transition-all cursor-pointer group">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-5">
                                                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                                <Trophy className="h-8 w-8 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-black text-xl">{reqData?.surah_name || (reqData?.juz_number ? `Juz ${reqData.juz_number}` : "Assessment")}</h3>
                                                                    <Badge className="bg-green-500 font-bold">PASSED</Badge>
                                                                </div>
                                                                <p className="text-muted-foreground flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4" />
                                                                    {format(new Date(exam.scheduled_at), 'MMMM d, yyyy')}
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                                                                    <span className="font-bold text-primary">{exam.exam_grading?.[0]?.total_score}% Score</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" className="rounded-full h-12 px-6 font-bold group">
                                                            View Report
                                                            <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="certificates" className="space-y-6">
                            <CertificateGallery studentId={student?.id || ''} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Key Metrics & Certificates */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary-foreground text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Award className="h-32 w-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Trophy className="h-5 w-5" />
                                Certificates Earned
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 text-center py-6">
                            <div className="text-6xl font-black mb-2">{certificates?.length || 0}</div>
                            <p className="font-bold uppercase tracking-widest opacity-80">Verified Credentials</p>
                            <Button
                                variant="secondary"
                                className="w-full mt-8 rounded-xl font-bold"
                                onClick={() => {
                                    const tabs = document.querySelector('[role="tablist"]');
                                    const certTab = tabs?.querySelector('[value="certificates"]') as HTMLElement;
                                    certTab?.click();
                                }}
                            >
                                View Achievement Gallery
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Preparation Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                "Ensure your wudu is fresh before assessment",
                                "Review the last 5 pages of the Juzz daily",
                                "Practice reciting with a loud, clear voice",
                                "Focus on Ghunna and Madd during recitation",
                                "Sleep early the night before your exam"
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                                    <p className="text-sm font-medium leading-tight">{tip}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
