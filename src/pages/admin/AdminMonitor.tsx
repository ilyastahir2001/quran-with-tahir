import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Video,
    Mic,
    Wifi,
    Eye,
    MessageSquare,
    AlertCircle,
    Clock
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MonitorClass = {
    id: string;
    status: string | null;
    teacher: { profile: { full_name: string | null } | null } | null;
    student: { full_name: string | null } | null;
};

export default function AdminMonitor() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Real-time subscription
    React.useEffect(() => {
        const channel = supabase
            .channel('admin-monitor-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'classes'
                },
                (payload) => {
                    // Invalidate query to refetch fresh data on any class change
                    queryClient.invalidateQueries({ queryKey: ['admin-live-monitor'] });
                    toast.info('Live Activity Updated');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const { data: activeClasses, isLoading } = useQuery({
        queryKey: ['admin-live-monitor'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('classes')
                .select(`
                  id,
                  status,
                  teacher:teachers(profile:profiles(full_name)),
                  student:students(full_name)
                `)
                .eq('status', 'in_progress');

            if (error) throw error;
            return data as unknown as MonitorClass[];
        },
        // Keep polling as backup, but reduce frequency if realtime is active
        refetchInterval: 10000
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary animate-pulse" />
                        AMC Pulsar - Live Console
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">Real-time health monitoring of all active Quranic sessions.</p>
                </div>
                <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                    <span className="font-bold text-primary tabular-nums">{activeClasses?.length || 0} Dynamic Streams</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse h-[300px] border-none shadow-lg bg-muted/20" />
                    ))
                ) : activeClasses?.length === 0 ? (
                    <div className="lg:col-span-3 text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
                        <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-muted-foreground/50">Pulse Flatlined - No Active Classes</h3>
                        <p className="text-muted-foreground mt-2">Check the schedule for upcoming sessions.</p>
                    </div>
                ) : (
                    activeClasses?.map((cls) => (
                        <Card key={cls.id} className="border-none shadow-xl bg-card border border-border/50 group overflow-hidden">
                            <CardHeader className="relative p-0 h-[160px] bg-muted/50 overflow-hidden flex items-center justify-center">
                                <div className="absolute top-4 left-4 z-10">
                                    <Badge className="bg-primary/90 backdrop-blur-md uppercase font-black text-[10px] py-1 border-none shadow-lg">LIVE</Badge>
                                </div>
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors">
                                        <Wifi className="h-4 w-4" />
                                    </div>
                                </div>

                                {/* Visual Audio/Video Representation */}
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-bounce">
                                        <Video className="h-6 w-6" />
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 animate-pulse delay-75">
                                        <Mic className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white z-10">
                                    <p className="text-xs uppercase font-black tracking-widest opacity-70">Room ID</p>
                                    <p className="font-bold tabular-nums">{cls.id.split('-')[0].toUpperCase()}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{cls.teacher?.profile?.full_name || 'Unknown Teacher'}</h3>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Teacher</p>
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-bold text-lg leading-tight">{cls.student?.full_name || 'Unknown Student'}</h3>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Student</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-border/50" />

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 font-bold text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="tabular-nums">Started 12m ago</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                            <span className="font-bold text-green-600">Stable</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 bg-muted/30 border-t flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-xl h-10 font-bold bg-background/50" onClick={() => navigate(`/virtual-class/${cls.id}?mode=observer`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Observe
                                </Button>
                                <Button className="flex-1 rounded-xl h-10 font-bold" onClick={() => toast.info('Support injection feature coming soon!')}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Inject Support
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            <Card className="border-none shadow-lg bg-amber-50 border border-amber-200">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-amber-900">Quality Assurance Notice</h3>
                        <p className="text-amber-800/80 text-sm mt-1">
                            Live monitoring is intended for technical support and pedagogical auditing only.
                            All observation sessions are logged in the <strong>Admin Audit Trail</strong> for security and privacy compliance.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

