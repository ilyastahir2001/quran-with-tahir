import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { quranData } from '@/constants/quranData';
import { Flame, TrendingDown, HelpCircle, Target } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SurahHeatmapProps {
    // In production, this would come from aggregated exam results
    errorDensityMap?: Record<number, number>; // surahId -> average error count
}

export const SurahHeatmap = ({ errorDensityMap = {} }: SurahHeatmapProps) => {
    // Generate demo data if none provided
    const getDensity = (surahId: number): number => {
        if (errorDensityMap[surahId] !== undefined) {
            return errorDensityMap[surahId];
        }
        // Demo: Simulate some surahs having higher error rates
        // Longer surahs and those with complex Tajweed tend to have more errors
        const surah = quranData.find(s => s.id === surahId);
        if (!surah) return 0;

        // Simulate: Surahs with > 50 ayahs tend to have more issues
        const baseDensity = Math.random() * 10;
        const lengthModifier = surah.totalAyahs > 50 ? 5 : 0;
        return Math.min(10, baseDensity + lengthModifier);
    };

    const getHeatColor = (density: number): string => {
        if (density >= 7) return 'bg-red-500 hover:bg-red-600';
        if (density >= 4) return 'bg-yellow-500 hover:bg-yellow-600';
        if (density >= 1) return 'bg-green-400 hover:bg-green-500';
        return 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600';
    };

    const sortedSurahs = [...quranData].sort((a, b) => getDensity(b.id) - getDensity(a.id));
    const topDifficult = sortedSurahs.slice(0, 5);

    return (
        <Card className="border-none shadow-xl">
            <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Surah Difficulty Heatmap
                        </CardTitle>
                        <CardDescription>Aggregated error density across all student exams.</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-400" /> Low</div>
                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-yellow-500" /> Medium</div>
                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-red-500" /> High</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Heatmap Grid */}
                <div className="grid grid-cols-12 sm:grid-cols-14 md:grid-cols-19 gap-1.5">
                    <TooltipProvider delayDuration={0}>
                        {quranData.map(surah => {
                            const density = getDensity(surah.id);
                            return (
                                <Tooltip key={surah.id}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className={cn(
                                                "aspect-square rounded-md text-[8px] font-bold transition-all duration-200 shadow-sm hover:scale-125 hover:z-10",
                                                getHeatColor(density)
                                            )}
                                        >
                                            {surah.id}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="p-3">
                                        <p className="font-black">{surah.transliteration}</p>
                                        <p className="text-[10px] text-muted-foreground">{surah.totalAyahs} Ayahs • {surah.type}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge variant={density >= 7 ? 'destructive' : density >= 4 ? 'outline' : 'default'} className="text-[10px] h-5 px-2 font-bold">
                                                Errors: {density.toFixed(1)} avg
                                            </Badge>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>

                {/* Top Difficult Surahs */}
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-destructive">
                        <TrendingDown className="h-4 w-4" />
                        Attention Required: Top 5 Most Challenging
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {topDifficult.map(surah => (
                            <div key={surah.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs",
                                    getHeatColor(getDensity(surah.id))
                                )}>
                                    {surah.id}
                                </div>
                                <div>
                                    <p className="text-xs font-bold leading-none">{surah.transliteration}</p>
                                    <p className="text-[10px] text-muted-foreground">{getDensity(surah.id).toFixed(1)} errors</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
