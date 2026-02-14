import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    Target,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Trophy,
    BookOpen,
    Users,
    Zap,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const masteryData = [
    { name: 'Juz 1-10', current: 85, target: 100 },
    { name: 'Juz 11-20', current: 65, target: 100 },
    { name: 'Juz 21-30', current: 40, target: 100 },
];

const mistakeHeatmap = [
    { surah: 'Al-Baqarah', errors: 145, difficulty: 'High' },
    { surah: 'Aali-Imran', errors: 98, difficulty: 'Medium' },
    { surah: 'An-Nisa', errors: 122, difficulty: 'High' },
    { surah: 'Al-Maidah', errors: 76, difficulty: 'Medium' },
    { surah: 'Al-Anam', errors: 54, difficulty: 'Low' },
    { surah: 'Al-Araf', errors: 89, difficulty: 'Medium' },
];

const teacherPerformance = [
    { name: 'Dr. Ahmad', score: 98, improvements: 45 },
    { name: 'Ust. Sarah', score: 94, improvements: 38 },
    { name: 'Ust. Omar', score: 88, improvements: 29 },
    { name: 'Dr. Fatima', score: 92, improvements: 41 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const GlobalMastery = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with quick stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Global Mastery Analytics</h2>
                    <p className="text-muted-foreground font-medium">Aggregate intelligence across the entire academy ecosystem.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl font-bold h-10 border-primary/20 text-primary">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button className="rounded-xl font-bold h-10 bg-primary shadow-lg shadow-primary/20">
                        Generate Insights
                    </Button>
                </div>
            </div>

            {/* Top Cards: Core KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-sm rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-primary/60">Global Accuracy</CardDescription>
                            <Target className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-4xl font-black">94.2%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" />
                            +2.1% this month
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-gradient-to-br from-amber-500/10 to-transparent backdrop-blur-sm rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-amber-600/60">Active Learner Velocity</CardDescription>
                            <Zap className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-4xl font-black">1.4k</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-bold text-muted-foreground">Ayahs mastered per day avg</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-blue-600/60">Teacher Efficiency</CardDescription>
                            <Trophy className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-4xl font-black">91.8</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            Based on diagnostic scaling
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-sm rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-emerald-600/60">Completion Rate</CardDescription>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-4xl font-black">78%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                            Target: 85% by end-of-year
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area: Charts & Lists */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Global Mastery Progress Chart */}
                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Macro Mastery Progression
                        </CardTitle>
                        <CardDescription>Aggregate completion progress across all Juz groupings.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={masteryData} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="current" fill="#10b981" radius={[0, 10, 10, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Common Mistakes / Challenge Areas */}
                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Critical Challenge Heatmap
                        </CardTitle>
                        <CardDescription>Surahs with the highest frequency of student errors identified by AI Tutor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mistakeHeatmap.map((item, idx) => (
                                <div key={item.surah} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center font-bold text-xs text-muted-foreground border shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{item.surah}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.errors} Errors Logged</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "rounded-lg font-black text-[10px]",
                                        item.difficulty === 'High' ? "bg-red-100 text-red-600 hover:bg-red-100" :
                                            item.difficulty === 'Medium' ? "bg-amber-100 text-amber-600 hover:bg-amber-100" :
                                                "bg-green-100 text-green-600 hover:bg-green-100"
                                    )}>
                                        {item.difficulty} CHALLENGE
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Teacher Influence Section */}
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Teacher Diagnostic Impact
                    </CardTitle>
                    <CardDescription>Correlation between teacher intervention and student accuracy improvement.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {teacherPerformance.map((teacher) => (
                            <div key={teacher.name} className="flex flex-col gap-4 p-6 bg-muted/30 rounded-3xl border border-transparent hover:border-primary/20 transition-all hover:bg-primary/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black">
                                        {teacher.name.split(' ')[1][0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{teacher.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground tracking-tight">Level 5 Expert Instructor</p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={`h-full bg-primary`} style={{ width: `${teacher.score}%` }} />
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Mastery Score</span>
                                    <span className="text-primary">{teacher.score}%</span>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                    {teacher.improvements} Fixes Logged
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
