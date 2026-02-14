import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    BookOpen,
    RefreshCw,
    Clock,
    AlertTriangle,
    Sparkles,
    ChevronRight,
    Zap,
    Brain
} from 'lucide-react';
import { useRevisionAgenda, type RevisionItem } from '@/hooks/useRevisionAgenda';

interface ManzilWidgetProps {
    masteryRecords?: {
        surahId: number;
        lastExamDate: string | null;
        errorCount: number;
        passed: boolean;
    }[];
    currentSurahId?: number;
    currentJuz?: number;
}

export const ManzilWidget = ({
    masteryRecords = [],
    currentSurahId = 1,
    currentJuz = 30
}: ManzilWidgetProps) => {
    const { sabqi, sabqPara, manzil, overdueCount, averageStrength } = useRevisionAgenda(
        masteryRecords,
        currentSurahId,
        currentJuz
    );

    const renderRevisionItem = (item: RevisionItem) => (
        <div
            key={item.surahId}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center text-xs font-black",
                    item.memoryStrength > 70 ? "bg-green-500/10 text-green-600" :
                        item.memoryStrength > 40 ? "bg-yellow-500/10 text-yellow-600" :
                            "bg-red-500/10 text-red-600"
                )}>
                    {item.memoryStrength}%
                </div>
                <div>
                    <p className="font-bold text-sm">{item.surahTransliteration}</p>
                    <p className="text-[10px] text-muted-foreground">
                        {item.daysOverdue > 0 ? `${item.daysOverdue} days overdue` : 'On track'}
                    </p>
                </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );

    // Demo data for when no real records exist
    const hasDemoData = masteryRecords.length === 0;
    const demoManzil: RevisionItem[] = hasDemoData ? [
        { surahId: 112, surahName: 'Al-Ikhlas', surahTransliteration: 'Al-Ikhlas', type: 'manzil', priority: 25, memoryStrength: 75, daysOverdue: 0 },
        { surahId: 113, surahName: 'Al-Falaq', surahTransliteration: 'Al-Falaq', type: 'manzil', priority: 45, memoryStrength: 55, daysOverdue: 2 },
        { surahId: 114, surahName: 'An-Nas', surahTransliteration: 'An-Nas', type: 'manzil', priority: 65, memoryStrength: 35, daysOverdue: 5 },
    ] : manzil;

    return (
        <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight">Smart Revision (Manzil)</CardTitle>
                            <p className="text-xs text-muted-foreground">AI-powered spaced repetition for Hifz</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {overdueCount > 0 && (
                            <Badge variant="destructive" className="rounded-full font-bold text-[10px] px-2 h-5 gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {overdueCount} Overdue
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                {/* Memory Health Bar */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Memory Health</span>
                        <span className={cn(
                            "text-sm font-black",
                            averageStrength > 70 ? "text-green-500" : averageStrength > 40 ? "text-yellow-500" : "text-red-500"
                        )}>
                            {hasDemoData ? 55 : averageStrength}%
                        </span>
                    </div>
                    <Progress value={hasDemoData ? 55 : averageStrength} className="h-2" />
                </div>

                {/* Sabqi (Today's Lesson) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Sabqi (Today's Lesson)
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border-2 border-primary/20 border-dashed flex items-center justify-center gap-3 text-primary">
                        <BookOpen className="h-5 w-5" />
                        <span className="font-bold">Surah Al-Baqarah – Ayat 142-148</span>
                    </div>
                </div>

                {/* Sabq Para (Same Juz Revision) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-500">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sabq-Para (Juz Review)
                    </div>
                    <div className="text-center py-4 text-xs text-muted-foreground italic bg-muted/10 rounded-xl">
                        Revise yesterday's 2 pages before today's lesson.
                    </div>
                </div>

                {/* Manzil (Spaced Repetition Queue) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500">
                            <Zap className="h-3.5 w-3.5" />
                            Amokhta / Manzil Queue
                        </div>
                        <Button variant="link" size="sm" className="text-xs h-auto p-0 font-bold">View All</Button>
                    </div>
                    <div className="space-y-2">
                        {demoManzil.map(renderRevisionItem)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
