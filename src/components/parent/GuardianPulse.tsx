import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Heart,
    Zap,
    Calendar,
    Share2,
    Sparkles,
    CheckCircle2,
    Clock,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PulseEvent {
    id: string;
    type: 'lesson' | 'achievement' | 'milestone' | 'prediction';
    title: string;
    description: string;
    timestamp: string;
    value?: string;
    icon: React.ReactNode;
    color: string;
}

export const GuardianPulse = ({ studentName = 'Your Child' }) => {
    const events: PulseEvent[] = [
        {
            id: '1',
            type: 'prediction',
            title: 'Excellence Predicted',
            description: `At this pace, ${studentName} will master Surah Al-Kahf by next Thursday!`,
            timestamp: 'Just now',
            icon: <Zap className="h-4 w-4" />,
            color: 'text-yellow-500 bg-yellow-500/10'
        },
        {
            id: '2',
            type: 'milestone',
            title: 'Juz 30 Complete!',
            description: `${studentName} has successfully completed all surahs in the 30th Juz. Time to celebrate!`,
            timestamp: '2 hours ago',
            icon: <Sparkles className="h-4 w-4" />,
            color: 'text-primary bg-primary/10'
        },
        {
            id: '3',
            type: 'lesson',
            title: 'Class Completed',
            description: 'Focused on articulating Huroof Al-Halq in Surah Al-Alaq.',
            timestamp: 'Today, 4:30 PM',
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: 'text-green-500 bg-green-500/10'
        },
        {
            id: '4',
            type: 'achievement',
            title: '7-Day Streak!',
            description: 'Consistency is key. 10 extra XP awarded for daily recitation.',
            timestamp: 'Yesterday',
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-purple-500 bg-purple-500/10'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                    Guardian Pulse
                </h2>
                <Badge variant="outline" className="rounded-full border-primary/20 text-primary bg-primary/5 uppercase font-black text-[10px] tracking-tighter">
                    Real-time
                </Badge>
            </div>

            <div className="space-y-4">
                {events.map((event, idx) => (
                    <Card key={event.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-card/60 backdrop-blur-sm group">
                        <CardContent className="p-0">
                            <div className="flex gap-4 p-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110",
                                    event.color
                                )}>
                                    {event.icon}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-sm leading-none">{event.title}</p>
                                        <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {event.timestamp}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {event.description}
                                    </p>

                                    {event.type === 'milestone' && (
                                        <div className="pt-2 flex gap-2">
                                            <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] font-bold border-primary/20 hover:bg-primary/5 gap-1.5 shadow-sm">
                                                <Share2 className="h-3 w-3" />
                                                Share Card
                                            </Button>
                                            <Button size="sm" className="h-8 rounded-full text-[10px] font-bold gap-1.5 shadow-md shadow-primary/20">
                                                <Sparkles className="h-3 w-3" />
                                                Send Reward
                                            </Button>
                                        </div>
                                    )}

                                    {event.type === 'prediction' && (
                                        <div className="mt-2 text-[10px] font-bold text-primary flex items-center gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10">
                                            <Zap className="h-3 w-3" />
                                            Confidence Score: 94%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visual connector between events */}
                            {idx < events.length - 1 && (
                                <div className="absolute left-9 top-14 w-0.5 h-10 bg-gradient-to-b from-border/50 to-transparent -z-10" />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-gradient-to-br from-primary to-primary/80 border-none text-white overflow-hidden relative">
                <CardContent className="p-6">
                    <div className="relative z-10">
                        <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                            <Zap className="fill-white h-5 w-5" />
                            Mastery Prediction
                        </h3>
                        <p className="text-sm opacity-90 mb-4 leading-relaxed">
                            Based on current performance and teacher feedback, {studentName} is on track to graduate Juz 30 in approximately <span className="underline decoration-yellow-400 decoration-2 underline-offset-4 font-black">18 days</span>.
                        </p>
                        <Button className="w-full bg-white/20 hover:bg-white/30 border-none font-bold rounded-xl space-x-2">
                            <span>View Full Insights</span>
                            <TrendingUp className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* Decorative blurred circles */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </CardContent>
            </Card>
        </div>
    );
};
