import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarClock, Video, AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GuardianPulse } from '@/components/parent/GuardianPulse';

export default function ParentMobileDashboard() {
    const { activeChild, profile } = useAuth();
    const childName = activeChild?.full_name || "Your Child";

    return (
        <div className="pb-24 pt-4 px-4 bg-muted/10 min-h-screen">
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-sm text-muted-foreground">Welcome back,</div>
                    <div className="font-bold text-xl">{profile?.full_name?.split(' ')[0]}</div>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {profile?.full_name?.[0]}
                </div>
            </div>

            {/* Child Selector (Simplified) */}
            <div className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm border mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {childName[0]}
                    </div>
                    <div>
                        <div className="font-bold text-sm">{childName}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">Level 2 • Surah Al-Baqarah</div>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">Switch</Button>
            </div>

            {/* Immediate Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Button className="h-24 rounded-2xl flex flex-col gap-2 shadow-lg shadow-primary/20" asChild>
                    <Link to="/virtual-class/demo">
                        <Video className="h-8 w-8" />
                        <span>Join Class</span>
                    </Link>
                </Button>
                <Button variant="outline" className="h-24 rounded-2xl flex flex-col gap-2 bg-background" asChild>
                    <Link to="/student/schedule">
                        <CalendarClock className="h-8 w-8 text-primary" />
                        <span>Schedule</span>
                    </Link>
                </Button>
            </div>

            {/* Guardian Pulse Feed */}
            <GuardianPulse studentName={childName} />
        </div>
    );
}
