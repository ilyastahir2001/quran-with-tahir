import React from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Flame,
    Footprints,
    GraduationCap,
    Star,
    Map,
    Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentAchievement } from '@/types/database';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideProps, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
    'footprints': Footprints,
    'flame': Flame,
    'graduation-cap': GraduationCap,
    'star': Star,
    'map': Map,
    'trophy': Trophy
};

interface TrophyCaseProps {
    achievements: StudentAchievement[];
}

export const TrophyCase: React.FC<TrophyCaseProps> = ({ achievements }) => {
    const earnedAchievementIds = achievements.map(a => a.achievement_id);

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    My Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    <TooltipProvider>
                        {achievements.length > 0 ? (
                            achievements.map((sa, idx) => {
                                const Icon = ICON_MAP[sa.achievement?.icon || 'trophy'] || Trophy;

                                const handleShare = (e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    const text = `I just earned the "${sa.achievement?.title}" achievement on Warm Web! 🏆`;
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Warm Web Achievement',
                                            text: text,
                                            url: window.location.origin
                                        }).catch(() => { });
                                    } else {
                                        navigator.clipboard.writeText(text);
                                        toast.success('Achievement text copied to clipboard!');
                                    }
                                };

                                return (
                                    <Tooltip key={sa.id}>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                initial={{ scale: 0, rotate: -20 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: idx * 0.1, type: 'spring' }}
                                                className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm relative group cursor-pointer"
                                            >
                                                <Icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />

                                                <div
                                                    onClick={handleShare}
                                                    className="absolute -bottom-2 -right-2 bg-background border border-primary/20 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                                >
                                                    <Share2 className="h-3 w-3" />
                                                </div>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-center p-1">
                                                <p className="font-bold">{sa.achievement?.title}</p>
                                                <p className="text-xs text-muted-foreground mb-2">{sa.achievement?.description}</p>
                                                <p className="text-[10px] text-primary font-medium animate-pulse">Click share to celebrate! 🚀</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 w-full text-muted-foreground">
                                <Lock className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">Keep learning to earn your first badge!</p>
                            </div>
                        )}
                        {/* Locked Placeholders */}
                        {[1, 2, 3].map((i) => (
                            <div key={`locked-${i}`} className="h-16 w-16 rounded-2xl bg-muted/50 border border-border border-dashed flex items-center justify-center opacity-40">
                                <Lock className="h-6 w-6" />
                            </div>
                        ))}
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};
