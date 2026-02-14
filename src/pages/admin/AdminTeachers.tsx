import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminService } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MoreHorizontal, FileDown, Plus, Mail, CheckCircle2, ShieldCheck, EyeOff, ShieldAlert, Eye, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Teacher, Profile } from '@/types/database';

interface TeacherWithProfile extends Teacher {
    profiles: Profile | null;
}

const exportTeachersToCSV = (teachers: TeacherWithProfile[], toastFn: typeof toast) => {
    if (!teachers?.length) {
        toast.error('No data to export');
        return;
    }
    const rows = teachers.map(t => ({
        Name: t.profiles?.full_name || 'Unknown',
        Email: t.profiles?.email || 'N/A',
        Country: t.profiles?.country || 'N/A',
        Status: t.status || 'N/A',
        Verified: t.is_verified ? 'Yes' : 'No',
        Joined: t.created_at ? format(new Date(t.created_at), 'yyyy-MM-dd') : ''
    }));
    const headers = Object.keys(rows[0]).join(',');
    const csvRows = rows.map(r => Object.values(r).map(v => `"${v}"`).join(','));
    const csv = [headers, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
};

export default function AdminTeachers() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const queryClient = useQueryClient();

    const { data: teachers, isLoading } = useQuery({
        queryKey: ['admin-teachers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('teachers')
                .select('*, profiles:profile_id(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data as unknown as TeacherWithProfile[];
        },
    });

    // Real-time updates for teachers list
    React.useEffect(() => {
        const channel = supabase
            .channel('admin-teachers-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'teachers' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const updateTeacher = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Database['public']['Tables']['teachers']['Update'] }) => {
            const { error } = await supabase
                .from('teachers')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: (_, { id, updates }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'UPDATE_TEACHER', 'teacher', id, updates);
            }
            toast.success('Teacher updated successfully');
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error('Failed to update teacher');
        }
    });

    const deleteUserCompletely = useMutation({
        mutationFn: async (userId: string) => {
            if (!userId) throw new Error('User ID is required');
            const { data, error } = await supabase.rpc('delete_user_completely', {
                target_user_id: userId
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'PURGE_TEACHER', 'user', userId);
            }
            toast.success('Teacher and all records purged successfully');
        },
        onError: (error: Error) => {
            console.error('Purge error:', error);
            toast.error(error.message || 'Failed to purge teacher. Check SQL function.');
        }
    });

    const filteredTeachers = teachers?.filter(teacher => {
        const profile = teacher.profiles; // Supabase returns single object for foreign key
        const fullName = profile?.full_name || 'Unknown';
        const email = profile?.email || 'No Email';

        const matchesSearch =
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
                    <p className="text-muted-foreground">Manage authorized instructors and applications.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => exportTeachersToCSV(filteredTeachers, toast)}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button onClick={() => toast.info('Teacher registration is via the public sign-up form.')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Teacher
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Teacher Directory</CardTitle>
                    <CardDescription>
                        A list of all registered teachers including their name, email, and approval status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teachers..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setStatusFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'approved' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setStatusFilter('approved')}
                                className="text-green-600 dark:text-green-400"
                            >
                                Active
                            </Button>
                            <Button
                                variant={statusFilter === 'pending' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setStatusFilter('pending')}
                                className="text-amber-600 dark:text-amber-400"
                            >
                                Pending
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Loading teachers...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No teachers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => {
                                        const profile = teacher.profiles || {} as Profile;
                                        return (
                                            <TableRow key={teacher.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'Teacher Name'} />
                                                            <AvatarFallback>{profile.full_name?.charAt(0) || 'T'}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium">{profile.full_name || 'Unknown Teacher'}</span>
                                                                {teacher.is_verified && (
                                                                    <CheckCircle2 className="h-4 w-4 text-primary fill-primary/10" />
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{profile.email || 'No Email'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{profile.country || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(teacher.status)}>
                                                        {teacher.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(teacher.created_at), 'MMM d, yyyy')}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/messages?partnerId=${teacher.user_id}`)}>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Message Teacher
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => updateTeacher.mutate({ id: teacher.id, updates: { is_verified: !teacher.is_verified } })}>
                                                                {teacher.is_verified ? (
                                                                    <>
                                                                        <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
                                                                        Revoke Verification
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                                                                        Verify Teacher
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => updateTeacher.mutate({ id: teacher.id, updates: { is_profile_hidden: !teacher.is_profile_hidden } })}>
                                                                {teacher.is_profile_hidden ? (
                                                                    <>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Make Profile Public
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                                        Hide from Search
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/teachers/${teacher.id}`)}>
                                                                <User className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/performance?search=${profile.full_name}`)}>
                                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                                Performance History
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive font-bold bg-destructive/5 hover:bg-destructive hover:text-white transition-colors"
                                                                onClick={() => {
                                                                    if (window.confirm('🚨 WARNING: This will permanently delete the teacher, their salary records, classes, and Auth account. Continue?')) {
                                                                        if (teacher.user_id) {
                                                                            deleteUserCompletely.mutate(teacher.user_id);
                                                                        } else {
                                                                            toast.error('No Auth user linked.');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <ShieldAlert className="mr-2 h-4 w-4" />
                                                                Nuclear Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>

                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
