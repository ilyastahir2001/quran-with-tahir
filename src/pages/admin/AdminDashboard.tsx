import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalMastery } from '@/components/admin/GlobalMastery';
import {
    Users,
    UserCheck,
    MonitorPlay,
    DollarSign,
    ArrowUpRight,
    Activity,
    Trophy
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { Payment } from '@/types/database';

const chartData = [
    { name: 'Mon', students: 400, revenue: 2400 },
    { name: 'Tue', students: 300, revenue: 1398 },
    { name: 'Wed', students: 200, revenue: 9800 },
    { name: 'Thu', students: 278, revenue: 3908 },
    { name: 'Fri', students: 189, revenue: 4800 },
    { name: 'Sat', students: 239, revenue: 3800 },
    { name: 'Sun', students: 349, revenue: 4300 },
];

interface DashboardStats {
    activeTeachers: number;
    activeStudents: number;
    liveClasses: number;
    recentPayments: Payment[];
}

export default function AdminDashboard() {
    const queryClient = useQueryClient();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-overview-stats'],
        queryFn: async () => {
            const [
                { count: teacherCount },
                { count: studentCount },
                { data: liveClasses },
                { data: recentPayments }
            ] = await Promise.all([
                supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
                supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('classes').select('*').eq('status', 'in_progress'),
                supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(5)
            ]);

            return {
                activeTeachers: teacherCount || 0,
                activeStudents: studentCount || 0,
                liveClasses: liveClasses?.length || 0,
                recentPayments: (recentPayments || []).map(p => ({
                    id: p.id,
                    student_id: p.student_id,
                    amount: p.amount,
                    currency: p.currency,
                    status: p.status,
                    payment_method: p.method,
                    metadata: p.metadata,
                    created_at: p.created_at,
                })) as Payment[]
            } as DashboardStats;
        },
    });

    // Real-time updates for dashboard metrics
    React.useEffect(() => {
        const channel = supabase
            .channel('admin-dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] }))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] }))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] }))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] }))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Command Center</h1>
                <p className="text-muted-foreground font-medium">Comprehensive overview of academy performance and operations.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 border border-border/50">
                    <TabsTrigger value="overview" className="rounded-xl font-bold px-6 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
                        <Activity className="h-4 w-4 mr-2" />
                        System Overview
                    </TabsTrigger>
                    <TabsTrigger value="mastery" className="rounded-xl font-bold px-6 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all text-primary data-[state=active]:text-primary">
                        <Trophy className="h-4 w-4 mr-2" />
                        Mastery Intelligence
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="rounded-xl font-bold px-6 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Teacher Quality
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 outline-none">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                                <Users className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{isLoading ? '...' : stats?.activeStudents}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600 inline-flex items-center">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        +4%
                                    </span> from last week
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
                                <UserCheck className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{isLoading ? '...' : stats?.activeTeachers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all departments
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
                                <MonitorPlay className="h-4 w-4 text-red-500 animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{isLoading ? '...' : stats?.liveClasses}</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently in classrooms
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$12,450</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600 inline-flex items-center">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        +18%
                                    </span> targets met
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Enrollment Growth</CardTitle>
                                <CardDescription>New students joining the platform daily.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] pl-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="students" stroke="#8884d8" fillOpacity={1} fill="url(#colorStudents)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest transactions and events.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.recentPayments.map((payment) => (
                                        <div key={payment.id} className="flex items-center gap-4">
                                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">Payment Received</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Transaction #{payment.id.split('-')[0]}
                                                </p>
                                            </div>
                                            <div className="font-medium text-green-600">+${payment.amount}</div>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Activity className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">New Teacher Applied</p>
                                            <p className="text-xs text-muted-foreground">
                                                Application awaiting review
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">2m ago</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="mastery" className="outline-none">
                    <GlobalMastery />
                </TabsContent>

                <TabsContent value="teachers" className="outline-none">
                    <Card className="border-none shadow-xl bg-muted/20">
                        <CardHeader>
                            <CardTitle>Teacher Performance Audit</CardTitle>
                            <CardDescription>Detailed metrics per instructor based on student retention and feedback.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground italic font-medium">
                            Detailed teacher audit module loading...
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
