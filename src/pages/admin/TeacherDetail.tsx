import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Profile, Teacher } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Globe,
    Calendar,
    BookOpen,
    Star,
    ShieldCheck,
    TrendingUp,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminTeacherDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: teacher, isLoading } = useQuery({
        queryKey: ['admin-teacher-detail', id],
        queryFn: async () => {
            if (!id) throw new Error('No teacher ID');

            const { data, error } = await supabase
                .from('teachers')
                .select(`
          *,
          profile:profiles!inner(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-32" />
                <Card>
                    <CardContent className="p-8">
                        <div className="flex gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Teacher not found</h2>
                <Button variant="outline" onClick={() => navigate('/admin/teachers')} className="mt-4">
                    Back to Teachers
                </Button>
            </div>
        );
    }

    const profile = teacher.profile as unknown as Profile;
    const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate('/admin/teachers')} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Teachers
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-lg overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
                        <CardContent className="relative pt-0 px-8 pb-8">
                            <div className="absolute -top-12 left-8">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                    <AvatarImage src={profile.avatar_url || ''} />
                                    <AvatarFallback className="text-2xl font-black bg-slate-100 text-slate-400">{initials}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="pt-16 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-black tracking-tight">{profile.full_name}</h1>
                                        {teacher.is_verified && (
                                            <Badge className="bg-primary/10 text-primary border-none">
                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4" />
                                        {profile.email}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = `mailto:${profile.email}`}>
                                        Email Teacher
                                    </Button>
                                    <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20">
                                        Edit Profile
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">About Teacher</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Biography</h3>
                                <p className="text-slate-600 leading-relaxed italic">
                                    "{teacher.bio || 'No biography provided.'}"
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-bold uppercase">Country</p>
                                                <p className="font-semibold">{profile.country || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Globe className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-bold uppercase">Language</p>
                                                <p className="font-semibold capitalize">{profile.language_pref || 'English'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.specializations?.map((spec: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-full text-xs font-bold">
                                                {spec}
                                            </Badge>
                                        ))}
                                        {!teacher.specializations?.length && <p className="text-sm text-muted-foreground italic">No specializations listed.</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg bg-primary text-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 opacity-70" />
                                    <span className="text-sm font-medium opacity-80">Rating</span>
                                </div>
                                <div className="flex items-center gap-1 font-black text-xl">
                                    <Star className="h-5 w-5 fill-white text-white" />
                                    4.9
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 opacity-70" />
                                    <span className="text-sm font-medium opacity-80">Lessons</span>
                                </div>
                                <span className="font-black text-xl">248</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 opacity-70" />
                                    <span className="text-sm font-medium opacity-80">Experience</span>
                                </div>
                                <span className="font-black text-xl">2.4 yrs</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-muted-foreground">Status</span>
                                <Badge className="bg-green-100 text-green-700 border-none capitalize">{teacher.status}</Badge>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-muted-foreground">Joined</span>
                                <span className="font-bold">{format(new Date(teacher.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Level</span>
                                <span className="font-bold">Level 2 (Certified)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
