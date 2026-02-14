import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CheckCircle2, Circle, Trophy } from 'lucide-react';
import { quranData, getJuzSurahs } from '@/constants/quranData';
import { cn } from '@/lib/utils';

interface QuranMasterProps {
    completedSurahs?: number[]; // Array of Surah IDs
    completedJuz?: number[]; // Array of Juz numbers
    currentSurahId?: number;
    currentJuzNumber?: number;
}

export const QuranMaster = ({
    completedSurahs = [],
    completedJuz = [],
    currentSurahId,
    currentJuzNumber
}: QuranMasterProps) => {
    const [activeTab, setActiveTab] = useState<'juz' | 'surah'>('juz');

    const totalQuranAyahs = 6236;
    const completedAyahs = quranData
        .filter(s => completedSurahs.includes(s.id))
        .reduce((acc, s) => acc + s.totalAyahs, 0);

    const overallProgress = Math.round((completedAyahs / totalQuranAyahs) * 100);

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Quranic Journey
                        </CardTitle>
                        <CardDescription>Track your progress across 114 Surahs and 30 Juz</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Overall Mastery</div>
                    </div>
                </div>
                <Progress value={overallProgress} className="h-2" />
            </CardHeader>

            <CardContent className="px-0 pb-0 mt-6">
                <Tabs defaultValue="juz" className="w-full" onValueChange={(v) => setActiveTab(v as 'juz' | 'surah')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="juz">30 Juz Map</TabsTrigger>
                        <TabsTrigger value="surah">114 Surahs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="juz" className="mt-0">
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                                <div
                                    key={juz}
                                    className={cn(
                                        "relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer group hover:scale-105",
                                        completedJuz.includes(juz)
                                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : juz === currentJuzNumber
                                                ? "bg-primary/10 border-primary text-primary animate-pulse"
                                                : "bg-card border-border hover:border-primary/50"
                                    )}
                                >
                                    <span className="text-xs font-bold leading-none">JUZ</span>
                                    <span className="text-lg font-black leading-none">{juz}</span>
                                    {completedJuz.includes(juz) && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                                            <CheckCircle2 className="h-3 w-3 text-primary fill-primary" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="surah" className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {quranData.map((surah) => (
                                <div
                                    key={surah.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                        completedSurahs.includes(surah.id)
                                            ? "bg-primary/5 border-primary/20"
                                            : surah.id === currentSurahId
                                                ? "bg-primary/10 border-primary ring-1 ring-primary"
                                                : "bg-card border-border hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold",
                                        completedSurahs.includes(surah.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                                    )}>
                                        {surah.id}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold truncate">{surah.transliteration}</h4>
                                            <span className="text-xs text-muted-foreground">{surah.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground">{surah.totalAyahs} Ayahs</span>
                                            {completedSurahs.includes(surah.id) && (
                                                <Badge variant="outline" className="h-4 py-0 text-[10px] border-primary text-primary bg-primary/10">Mastered</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xl font-arabic text-primary/40 group-hover:text-primary/100 transition-colors">
                                        {surah.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
