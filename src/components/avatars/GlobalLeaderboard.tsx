import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, BookOpen, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StudentAvatar, type AvatarConfig } from './StudentAvatar';

import type { Json } from '@/types/database';

interface LeaderboardEntry {
    id: string;
    full_name: string;
    metric: number;
    avatar_config?: AvatarConfig;
}

interface StudentQueryResult {
    id: string;
    full_name: string;
    current_streak: number;
    user_id: string;
}

interface ProfileQueryResult {
    user_id: string;
    metadata: Json;
}

interface LessonQueryResult {
    student_id: string | null;
    students: {
        id: string;
        full_name: string;
        user_id: string;
    } | null;
}

export function GlobalLeaderboard() {
    const [streakLeaders, setStreakLeaders] = useState<LeaderboardEntry[]>([]);
    const [lessonLeaders, setLessonLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const abortController = new AbortController();

        async function fetchLeaders() {
            setLoading(true);
            try {
                // Fetch Top Streaks
                const { data: streaks } = await supabase
                    .from('students')
                    .select('id, full_name, current_streak, user_id')
                    .order('current_streak', { ascending: false })
                    .limit(10)
                    .abortSignal(abortController.signal);

                const typedStreaks = (streaks || []) as unknown as StudentQueryResult[];

                // Fetch profiles for avatar metadata
                if (typedStreaks.length > 0 && !abortController.signal.aborted) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('user_id, metadata')
                        .in('user_id', typedStreaks.map(s => s.user_id).filter(Boolean))
                        .abortSignal(abortController.signal);

                    const typedProfiles = (profiles || []) as unknown as ProfileQueryResult[];

                    setStreakLeaders(typedStreaks.map(s => {
                        const profile = typedProfiles.find(p => p.user_id === s.user_id);
                        const metadata = profile?.metadata as Record<string, unknown> | null;
                        return {
                            id: s.id,
                            full_name: s.full_name,
                            metric: s.current_streak,
                            avatar_config: (metadata?.avatar_config as unknown as AvatarConfig) || undefined
                        };
                    }));
                }

                // Fetch Top Lessons - Real data from lessons table
                if (!abortController.signal.aborted) {
                    const { data: lessonCounts } = await supabase
                        .from('lessons')
                        .select('student_id, students(id, full_name, user_id)')
                        .abortSignal(abortController.signal);

                    const typedLessonCounts = (lessonCounts || []) as unknown as LessonQueryResult[];

                    if (typedLessonCounts.length > 0 && !abortController.signal.aborted) {
                        // Group lessons by student and count
                        const studentLessonMap = new Map<string, { count: number; full_name: string; user_id: string }>();
                        typedLessonCounts.forEach(lesson => {
                            if (lesson.students) {
                                const studentId = lesson.students.id;
                                const existing = studentLessonMap.get(studentId);
                                if (existing) {
                                    existing.count++;
                                } else {
                                    studentLessonMap.set(studentId, {
                                        count: 1,
                                        full_name: lesson.students.full_name,
                                        user_id: lesson.students.user_id
                                    });
                                }
                            }
                        });

                        // Convert to sorted array and take top 10
                        const sortedLessons = Array.from(studentLessonMap.entries())
                            .map(([id, data]) => ({
                                id,
                                full_name: data.full_name,
                                metric: data.count,
                                user_id: data.user_id
                            }))
                            .sort((a, b) => b.metric - a.metric)
                            .slice(0, 10);

                        // Get avatar configs for lesson leaders
                        const { data: lessonProfiles } = await supabase
                            .from('profiles')
                            .select('user_id, metadata')
                            .in('user_id', sortedLessons.map(s => s.user_id).filter(Boolean))
                            .abortSignal(abortController.signal);

                        const typedLessonProfiles = (lessonProfiles || []) as unknown as ProfileQueryResult[];

                        if (!abortController.signal.aborted) {
                            setLessonLeaders(sortedLessons.map(s => {
                                const profile = typedLessonProfiles.find(p => p.user_id === s.user_id);
                                const metadata = profile?.metadata as Record<string, unknown> | null;
                                return {
                                    id: s.id,
                                    full_name: s.full_name,
                                    metric: s.metric,
                                    avatar_config: (metadata?.avatar_config as unknown as AvatarConfig) || undefined
                                };
                            }));
                        }
                    }
                }

            } catch (err: unknown) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error fetching leaderboard:', err);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchLeaders();

        return () => abortController.abort();
    }, []);

    const LeaderList = ({ items, icon: Icon, unit }: { items: LeaderboardEntry[], icon: React.ElementType, unit: string }) => (
        <div className="space-y-4 pt-4">
            {items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-background/40 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : index === 2 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {index + 1}
                            </div>
                            {index < 3 && <Crown className="absolute -top-3 -right-3 h-4 w-4 text-yellow-500 rotate-12" />}
                        </div>

                        <div className="h-10 w-10">
                            <StudentAvatar config={item.avatar_config} size={40} />
                        </div>

                        <div>
                            <p className="font-bold text-sm">{item.full_name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Level {Math.floor(item.metric / 5) + 1} Hafiz</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-black text-primary">{item.metric}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{unit}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Global High Scores
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="streaks" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="streaks" className="gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            Daily Streaks
                        </TabsTrigger>
                        <TabsTrigger value="lessons" className="gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            Lessons Read
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="streaks">
                        <LeaderList items={streakLeaders} icon={Flame} unit="days" />
                    </TabsContent>

                    <TabsContent value="lessons">
                        <LeaderList items={lessonLeaders} icon={BookOpen} unit="lessons" />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
