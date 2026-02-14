import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { quranData } from '@/constants/quranData';
import { cn } from '@/lib/utils';
import { Check, Lock, Sparkles, Map as MapIcon } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface HafizPathMapProps {
    completedSurahIds?: number[];
    currentSurahId?: number;
}

export const HafizPathMap = ({
    completedSurahIds = [],
    currentSurahId = 1
}: HafizPathMapProps) => {

    // Group surahs into paths/rows of 5 for a winding effect
    const surahNodeGroups = useMemo(() => {
        const groups = [];
        for (let i = 0; i < quranData.length; i += 7) {
            groups.push(quranData.slice(i, i + 7));
        }
        return groups;
    }, []);

    return (
        <div className="relative w-full overflow-x-auto pb-8 pt-4 scrollbar-hide">
            <div className="min-w-[1200px] px-8 flex flex-col gap-12">
                {surahNodeGroups.map((group, groupIdx) => (
                    <div
                        key={groupIdx}
                        className={cn(
                            "flex items-center gap-12",
                            groupIdx % 2 === 0 ? "flex-row" : "flex-row-reverse"
                        )}
                    >
                        {group.map((surah, idx) => {
                            const isCompleted = completedSurahIds.includes(surah.id);
                            const isActive = surah.id === currentSurahId;
                            const isLocked = !isCompleted && !isActive && surah.id > currentSurahId;

                            return (
                                <div key={surah.id} className="relative flex-shrink-0">
                                    <TooltipProvider>
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    className={cn(
                                                        "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative group",
                                                        isCompleted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" :
                                                            isActive ? "bg-yellow-500 text-white shadow-xl shadow-yellow-500/30 scale-110 animate-bounce" :
                                                                "bg-muted/50 border-2 border-dashed border-border text-muted-foreground hover:border-primary/50"
                                                    )}
                                                >
                                                    {isCompleted ? <Check className="h-6 w-6" /> :
                                                        isActive ? <Sparkles className="h-6 w-6" /> :
                                                            isLocked ? <Lock className="h-4 w-4 opacity-30" /> :
                                                                <span className="text-xs font-black">{surah.id}</span>
                                                    }

                                                    {/* Orbiting effect for active */}
                                                    {isActive && (
                                                        <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 animate-ping opacity-20" />
                                                    )}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="p-3 bg-card border-2 shadow-2xl">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-black text-sm">{surah.transliteration}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                                                        {surah.totalAyahs} Ayahs • {surah.type}
                                                    </p>
                                                    {isCompleted && <Badge className="mt-2 bg-green-500 text-[8px] h-4">MASTERED</Badge>}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Connectivity path */}
                                    {idx < group.length - 1 && (
                                        <div className={cn(
                                            "absolute top-1/2 -translate-y-1/2 w-12 h-1 bg-border/20 -z-10",
                                            groupIdx % 2 === 0 ? "left-full" : "right-full"
                                        )}>
                                            <div className={cn(
                                                "h-full bg-primary/40 transition-all duration-1000",
                                                isCompleted ? "w-full" : "w-0"
                                            )} />
                                        </div>
                                    )}

                                    {/* Vertical connector to next row */}
                                    {(idx === (groupIdx % 2 === 0 ? group.length - 1 : 0)) && groupIdx < surahNodeGroups.length - 1 && (
                                        <div className={cn(
                                            "absolute -bottom-12 left-1/2 -translate-x-1/2 w-1 h-12 bg-border/20 -z-10",
                                        )}>
                                            <div className={cn(
                                                "h-full w-full bg-primary/40 transition-all duration-1000",
                                                isCompleted ? "h-full" : "h-0"
                                            )} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
