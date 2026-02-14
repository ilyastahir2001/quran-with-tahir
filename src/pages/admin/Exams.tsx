import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ClipboardList,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    Video
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

type ScheduledExam = Database['public']['Tables']['exams']['Row'] & {
    students: { full_name: string | null } | null;
    exam_requests: { surah_name: string | null; type: string | null } | null;
};

export default function AdminExams() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requests');

    const { data: requests, refetch: refetchRequests } = useQuery({
        queryKey: ['admin-exam-requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('exam_requests')
                .select('*, students(full_name), teachers(full_name)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const { data: scheduledExams } = useQuery({
        queryKey: ['admin-scheduled-exams'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('exams')
                .select('*, students(full_name), exam_requests(surah_name, type)')
                .order('scheduled_at', { ascending: true });
            if (error) throw error;
            return data as unknown as ScheduledExam[];
        }
    });

    const handleApprove = async (id: string) => {
        try {
            const { error } = await supabase
                .from('exam_requests')
                .update({ status: 'approved' })
                .eq('id', id);
            if (error) throw error;
            toast.success('Exam request approved!');
            refetchRequests();
        } catch (error) {
            toast.error('Failed to approve request');
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    Examination Portal
                </h1>
                <p className="text-muted-foreground text-lg mt-1">Manage assessment requests, schedule examiners, and certify progress.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl">
                    <TabsTrigger value="requests" className="rounded-xl px-6 font-bold">Pending Requests</TabsTrigger>
                    <TabsTrigger value="scheduled" className="rounded-xl px-6 font-bold">Scheduled Sessions</TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-xl px-6 font-bold">Recent Results</TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-4">
                    {requests?.filter(r => (r.status as string) === 'pending').length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No pending exam requests at this time.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {requests?.filter(r => (r.status as string) === 'pending').map((req) => (
                                <Card key={req.id} className="border-none shadow-md hover:shadow-xl transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <UserCheck className="h-7 w-7 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black">{req.students?.full_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="font-bold border-primary/20 text-primary">{req.surah_name || `Juz ${req.juz_number}`}</Badge>
                                                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-60">• {req.type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">Requested On</p>
                                                    <p className="font-bold">{req.created_at ? format(new Date(req.created_at), 'MMM d, h:mm a') : 'N/A'}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="rounded-xl h-11 px-6 font-bold" onClick={() => handleApprove(req.id)}>Accept</Button>
                                                    <Button className="rounded-xl h-11 px-6 font-bold" onClick={() => toast.info('Exam scheduling feature coming soon!')}>Schedule</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="scheduled" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {scheduledExams?.map((exam) => (
                            <Card key={exam.id} className="border-none shadow-lg group overflow-hidden">
                                <div className="h-2 bg-primary/20 w-full group-hover:bg-primary transition-colors" />
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-blue-500 font-bold uppercase text-[10px]">SCHEDULED</Badge>
                                        <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(new Date(exam.scheduled_at), 'h:mm a')}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg font-bold mt-3">{exam.students?.full_name}</CardTitle>
                                    <CardDescription className="font-medium">Assessing: {exam.exam_requests?.surah_name || "Quranic Proficiency"}</CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-0 p-6 flex gap-2">
                                    <Button variant="outline" className="flex-1 rounded-xl h-10 font-bold" onClick={() => toast.info('Exam details view coming soon!')}>Details</Button>
                                    <Button className="flex-1 rounded-xl h-10 font-bold" onClick={() => navigate(`/virtual-class/${exam.id}?mode=observer`)}>
                                        <Video className="h-4 w-4 mr-2" />
                                        Enter Room
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
