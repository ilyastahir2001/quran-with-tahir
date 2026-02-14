import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MonitorPlay, Calendar, History, Video, AlertCircle } from 'lucide-react';
import { format, isWithinInterval, parseISO, addMinutes } from 'date-fns';
import { Class, Teacher, Profile, Student } from '@/types/database';

interface ClassWithParticipants extends Omit<Class, 'teacher' | 'student'> {
    teacher: (Partial<Teacher> & { profile: { full_name: string | null; email: string | null } | null }) | null;
    student: (Partial<Student> & { full_name: string | null; email: string | null }) | null;
}

export default function AdminClasses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('live');

    const { data: classes, isLoading } = useQuery({
        queryKey: ['admin-classes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('classes')
                .select(`
                  *,
                  teacher:teachers(id, profile:profile_id(full_name, email)),
                  student:students(full_name, email)
                `)
                .order('scheduled_date', { ascending: false });

            if (error) throw error;
            return data as unknown as ClassWithParticipants[];
        },
        refetchInterval: 30000, // Refresh every 30s for live status
    });

    const now = new Date();

    // Helper to determine if a class is currently "Live" (based on time or status)
    const isLive = (cls: ClassWithParticipants) => {
        if (cls.status === 'in_progress') return true;

        // Or if time is right now within 10 min buffer
        const start = parseISO(`${cls.scheduled_date}T${cls.start_time}`);
        const end = addMinutes(start, cls.duration_minutes || 60);
        return isWithinInterval(now, { start, end });
    };

    const filteredClasses = classes?.filter(cls => {
        // Search
        const teacherName = cls.teacher?.profile?.full_name || '';
        const studentName = cls.student?.full_name || '';
        const matchesSearch =
            teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            studentName.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Tab Filter
        if (activeTab === 'live') return isLive(cls);
        if (activeTab === 'upcoming') {
            const start = parseISO(`${cls.scheduled_date}T${cls.start_time}`);
            return start > now && cls.status !== 'completed' && cls.status !== 'cancelled';
        }
        if (activeTab === 'history') {
            const start = parseISO(`${cls.scheduled_date}T${cls.start_time}`);
            return start < now || cls.status === 'completed' || cls.status === 'cancelled';
        }
        return true;
    }) || [];

    const getStatusBadge = (status: string, isLiveNow: boolean) => {
        if (status === 'in_progress' || isLiveNow) {
            return <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">LIVE</Badge>;
        }
        switch (status) {
            case 'completed': return <Badge variant="secondary" className="bg-green-100 text-green-800">Done</Badge>;
            case 'scheduled': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
            case 'missed': return <Badge variant="destructive">Missed</Badge>;
            case 'cancelled': return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Class Monitoring</h1>
                    <p className="text-muted-foreground">Real-time oversight of classroom sessions.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Future: Add 'Schedule Class' button */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Now</CardTitle>
                        <MonitorPlay className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classes?.filter(c => isLive(c)).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Active sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Today</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classes?.filter(c => {
                                const start = parseISO(`${c.scheduled_date}T${c.start_time}`);
                                return start > now && c.scheduled_date === format(now, 'yyyy-MM-dd');
                            }).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Remaining sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {classes?.filter(c => {
                                return c.status === 'completed' && c.scheduled_date === format(now, 'yyyy-MM-dd');
                            }).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="live" className="gap-2">
                                    <MonitorPlay className="h-4 w-4" />
                                    Live
                                </TabsTrigger>
                                <TabsTrigger value="upcoming" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Upcoming
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-2">
                                    <History className="h-4 w-4" />
                                    History
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search class..."
                                    className="pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Status</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        Loading classes...
                                    </TableCell>
                                </TableRow>
                            ) : filteredClasses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        {activeTab === 'live' ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <MonitorPlay className="h-8 w-8 text-muted-foreground/50" />
                                                <p>No classes are currently live.</p>
                                            </div>
                                        ) : 'No classes found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClasses.map((cls) => {
                                    const isLiveStatus = isLive(cls);
                                    const teacherName = cls.teacher?.profile?.full_name || 'Unknown';
                                    const studentName = cls.student?.full_name || 'Unknown';

                                    return (
                                        <TableRow key={cls.id}>
                                            <TableCell className="pl-6">
                                                {getStatusBadge(cls.status, isLiveStatus)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {teacherName}
                                            </TableCell>
                                            <TableCell>
                                                {studentName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {format(parseISO(cls.scheduled_date), 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {cls.start_time} - {cls.end_time || '?'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {(cls.duration_minutes || 0)} min
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {isLiveStatus && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 shadow-sm hover:shadow-md transition-all active:scale-95"
                                                        onClick={() => window.location.href = `/virtual-class/${cls.id}?mode=observer`}
                                                    >
                                                        <Video className="mr-2 h-3 w-3" />
                                                        Silent Join
                                                    </Button>
                                                )}
                                                {!isLiveStatus && (
                                                    <Button size="sm" variant="ghost" className="h-8 hover:bg-slate-100">
                                                        Details
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
