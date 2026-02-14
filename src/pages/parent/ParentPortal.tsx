import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    ArrowRight,
    BookOpen,
    ClipboardCheck,
    TrendingUp,
    ChevronRight,
    ShieldCheck,
    Calendar
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ParentPortal() {
    const { linkedChildren, setActiveChild, profile } = useAuth();
    const navigate = useNavigate();

    const handleSelectChild = (child: any) => {
        setActiveChild(child);
        navigate('/student/dashboard');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Parental Oversight <ShieldCheck className="h-8 w-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Welcome, {profile?.full_name}. Here is an overview of your children's progress.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-card p-3 rounded-2xl border shadow-sm">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Linked Children</p>
                        <p className="text-xl font-black">{linkedChildren.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {linkedChildren.map((child) => (
                    <Card key={child.id} className="border-none shadow-xl overflow-hidden group hover:ring-2 ring-primary/20 transition-all">
                        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent pb-6">
                            <div className="flex justify-between items-start">
                                <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                                    <AvatarImage src={child.avatar_url || ''} />
                                    <AvatarFallback className="text-lg font-bold">
                                        {child.full_name?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <Badge variant="outline" className="bg-background/50 backdrop-blur-md">
                                    Active Student
                                </Badge>
                            </div>
                            <div className="mt-4">
                                <CardTitle className="text-2xl font-black">{child.full_name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    Joined {new Date(child.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <BookOpen className="h-3 w-3 text-blue-500" /> Current Surah
                                    </p>
                                    <p className="font-bold truncate">{child.current_surah || 'Al-Fatiha'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3 text-green-500" /> Progress
                                    </p>
                                    <p className="font-bold">{child.progress_percentage || 0}%</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Quran Mastery</span>
                                    <span>{child.progress_percentage || 0}%</span>
                                </div>
                                <Progress value={child.progress_percentage || 0} className="h-2" />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <Button
                                    onClick={() => handleSelectChild(child)}
                                    className="w-full rounded-xl font-bold group"
                                >
                                    Manage Education
                                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl font-bold"
                                    asChild
                                >
                                    <Link to={`/student/audit-logs?childId=${child.id}`}>
                                        <ClipboardCheck className="h-4 w-4 mr-2" />
                                        View Audit Logs
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {linkedChildren.length === 0 && (
                    <Card className="col-span-full border-2 border-dashed border-muted-foreground/20 bg-muted/5 py-12">
                        <CardContent className="flex flex-col items-center text-center">
                            <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Children Linked</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Contact the academy administrator to link your children's accounts to your parent portal.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
