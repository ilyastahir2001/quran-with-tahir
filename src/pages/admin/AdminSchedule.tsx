import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Users, Search, Filter, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ClassStatus } from '@/types/database';
import type { Database } from '@/integrations/supabase/types';

type ClassWithDetails = Database['public']['Tables']['classes']['Row'] & {
    student: { id: string; full_name: string | null } | null;
    teacher: { id: string; profile: { full_name: string | null } | null } | null;
};

export default function AdminSchedule() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClassStatus | 'all'>('all');

    const { data: classes, isLoading, refetch } = useQuery({
        queryKey: ['admin-all-classes', statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('classes')
                .select(`
                    *,
                    student:students(id, full_name),
                    teacher:teachers(id, profile:profiles(full_name))
                `)
                .order('scheduled_date', { ascending: false })
                .order('start_time', { ascending: false })
                .limit(100);

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as ClassWithDetails[];
        }
    });

    const filteredClasses = classes?.filter(cls => {
        const studentName = cls.student?.full_name?.toLowerCase() || '';
        const teacherName = cls.teacher?.profile?.full_name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return studentName.includes(search) || teacherName.includes(search);
    });

    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-green-100 text-green-700',
        completed: 'bg-slate-100 text-slate-700',
        missed: 'bg-red-100 text-red-700',
        cancelled: 'bg-orange-100 text-orange-700',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Master Schedule</h1>
                    <p className="text-muted-foreground">Monitor and manage all learning sessions across the platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student or teacher..."
                                className="pl-9 rounded-full bg-slate-50 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            <Badge
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                className="cursor-pointer rounded-full px-4 py-1"
                                onClick={() => setStatusFilter('all')}
                            >
                                All
                            </Badge>
                            {['scheduled', 'in_progress', 'completed', 'missed', 'cancelled'].map(status => (
                                <Badge
                                    key={status}
                                    variant={statusFilter === status ? 'default' : 'outline'}
                                    className="cursor-pointer rounded-full px-4 py-1 capitalize"
                                    onClick={() => setStatusFilter(status as ClassStatus)}
                                >
                                    {status.replace('_', ' ')}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[180px]">Date & Time</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredClasses && filteredClasses.length > 0 ? (
                                filteredClasses.map((cls) => (
                                    <TableRow key={cls.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-sm uppercase font-bold text-slate-700">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(parseISO(cls.scheduled_date), 'MMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    {cls.start_time.slice(0, 5)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                <span className="font-semibold">{cls.student?.full_name || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <User className="h-4 w-4" />
                                                <span>{cls.teacher?.profile?.full_name || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium">
                                                {(cls.duration_minutes || 0)}m
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`rounded-full border-none px-3 py-0.5 capitalize ${statusColors[cls.status || 'scheduled'] || 'bg-slate-100'}`}>
                                                {(cls.status || 'scheduled').replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/5 hover:text-primary">
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No classes found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
