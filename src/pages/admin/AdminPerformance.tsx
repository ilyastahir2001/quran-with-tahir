import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    TrendingUp,
    Clock,
    Star,
    Award,
    AlertTriangle,
    ChevronRight,
    Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Teacher, Profile } from '@/types/database';

interface TeacherPerformance extends Omit<Teacher, 'profile'> {
    profile: Pick<Profile, 'full_name'>;
    lessons: { count: number }[];
    feedback: { rating: number }[];
    students: { count: number }[];
}

export default function AdminPerformance() {
    const { data: teachers, isLoading } = useQuery({
        queryKey: ['admin-teacher-performance'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('teachers')
                .select(`
                  *,
                  profile:profiles(full_name),
                  lessons(count),
                  feedback(rating),
                  students(count)
                `)
                .eq('status', 'active');

            if (error) throw error;
            return data as unknown as TeacherPerformance[];
        }
    });

    // Derived KPI logic
    const calculateSuccessAchievement = (teacher: TeacherPerformance) => {
        // Mock logic: For production this would compare student milestones vs time
        return Math.floor(Math.random() * (95 - 75 + 1) + 75);
    };

    const calculatePunctuality = (teacher: TeacherPerformance) => {
        // Mock logic: Derived from call_logs
        return Math.floor(Math.random() * (100 - 85 + 1) + 85);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Award className="h-8 w-8 text-primary" />
                        Performance Scorecard
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">International standards for Quranic academic excellence.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl font-bold">Export PDF</Button>
                    <Button className="rounded-xl font-bold">Review Cycle</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Avg Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">88.4%</div>
                        <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-bold">+2.1% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Punctuality Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">96.2%</div>
                        <p className="text-xs font-bold opacity-80 mt-2">98.1% connection success</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black truncate">Sheikh Ahmed</div>
                        <p className="text-xs font-bold opacity-80 mt-2">99% Student Satisfaction</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Improvement Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">12:1</div>
                        <p className="text-xs font-bold opacity-80 mt-2">Remarks to Action ratio</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <CardTitle className="text-xl font-bold">Teacher KPI Rankings</CardTitle>
                    <CardDescription>Teachers sorted by Student Success Achievement (SSA)</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/10 text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4">Teacher</th>
                                    <th className="px-6 py-4">Student Success</th>
                                    <th className="px-6 py-4">Punctuality</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Activity</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {teachers?.map((teacher) => {
                                    const ssa = calculateSuccessAchievement(teacher);
                                    const punctuality = calculatePunctuality(teacher);
                                    return (
                                        <tr key={teacher.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                        {teacher.profile.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{teacher.profile.full_name || 'Unnamed Teacher'}</p>
                                                        <p className="text-xs text-muted-foreground">ID: {teacher.id.split('-')[0]}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-[120px] space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-primary">{ssa}%</span>
                                                    </div>
                                                    <Progress value={ssa} className="h-1.5" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn(
                                                    "rounded-full px-3 py-0 h-6 font-bold border-2",
                                                    punctuality > 90 ? "border-green-200 text-green-700 bg-green-50" : "border-yellow-200 text-yellow-700 bg-yellow-50"
                                                )}>
                                                    {punctuality}%
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold">4.9</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium">{teacher.lessons?.[0]?.count || 0} Sessions</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Underperforming Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 animate-pulse">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                            <div>
                                <p className="font-bold text-destructive">Sheikh Khalid - SSA Drop</p>
                                <p className="text-xs text-muted-foreground">Success Achievement dropped below 70% in 5 students.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground italic">
                            [Success Journey Chart Placeholder]
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
