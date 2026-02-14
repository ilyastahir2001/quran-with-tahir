import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminService } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import type { Database, Json } from '@/integrations/supabase/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { Search, MoreHorizontal, FileDown, Filter, Mail, UserPlus, Eye, Users, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Student } from '@/types/database';

export default function AdminStudents() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [selectionModeFilter, setSelectionModeFilter] = useState<string>('all');
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [enrollFormData, setEnrollFormData] = useState({
        full_name: '',
        email: '',
        course_level: 'beginner',
        teacher_id: '',
    });
    const { profile } = useAuth();
    const queryClient = useQueryClient();

    const assignTeacher = useMutation({
        mutationFn: async ({ studentId, teacherId }: { studentId: string; teacherId: string }) => {
            const { error } = await supabase
                .from('students')
                .update({ teacher_id: teacherId })
                .eq('id', studentId);
            if (error) throw error;
        },
        onSuccess: (_, { studentId, teacherId }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'ASSIGN_TEACHER', 'student', studentId, { teacher_id: teacherId });
            }
            toast.success('Teacher assigned successfully');
        },
        onError: (error) => {
            console.error('Assignment error:', error);
            toast.error('Failed to assign teacher');
        }
    });

    // Real-time updates for students list
    React.useEffect(() => {
        const channel = supabase
            .channel('admin-students-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'students' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const enrollStudent = useMutation({
        mutationFn: async (data: typeof enrollFormData) => {
            // Create Student (without auth user/profile - they can link their account later)
            const { error: studentError } = await supabase
                .from('students')
                .insert({
                    user_id: null,
                    full_name: data.full_name,
                    email: data.email,
                    course_level: data.course_level,
                    teacher_id: data.teacher_id || null,
                    status: 'active'
                });

            if (studentError) throw studentError;
        },
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'ENROLL_STUDENT', 'student', null, { email: data.email, full_name: data.full_name });
            }
            toast.success('Student enrolled successfully');
            setIsEnrollModalOpen(false);
            setEnrollFormData({ full_name: '', email: '', course_level: 'beginner', teacher_id: '' });
        },
        onError: (error) => {
            console.error('Enrollment error:', error);
            toast.error('Failed to enroll student');
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
            queryClient.invalidateQueries({ queryKey: ['admin-students'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'PURGE_USER', 'user', userId);
            }
            toast.success('User and all associated data purged successfully');
        },
        onError: (error: Error) => {
            console.error('Purge error:', error);
            toast.error(error.message || 'Failed to purge user. Ensure the SQL function is installed.');
        }
    });

    const updateStudentStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('students')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: (_, { id, status }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-students'] });
            if (profile?.id) {
                AdminService.logAction(profile.id, 'UPDATE_STATUS', 'student', id, { status });
            }
            toast.success('Student status updated');
        },
        onError: () => {
            toast.error('Failed to update student status');
        }
    });

    const exportToCSV = () => {
        if (!filteredStudents.length) {
            toast.error('No data to export');
            return;
        }
        const rows = filteredStudents.map(s => ({
            Name: s.full_name || '',
            Email: s.email || '',
            Teacher: s.teacher?.profile?.full_name || 'Unassigned',
            Level: s.course_level || '',
            Country: s.country || '',
            Status: s.status || '',
            Joined: s.created_at ? format(new Date(s.created_at), 'yyyy-MM-dd') : ''
        }));
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map(r => Object.values(r).map(v => `"${v}"`).join(','));
        const csv = [headers, ...csvRows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${format(new Date(), 'yyyyMMdd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    const { data: teachers } = useQuery({
        queryKey: ['admin-teachers-list'],
        queryFn: async () => {
            const { data } = await supabase
                .from('teachers')
                .select('id, profile:profiles(full_name)')
                .eq('status', 'approved');
            return data || [];
        }
    });

    const { data: students, isLoading } = useQuery({
        queryKey: ['admin-students', statusFilter, levelFilter, countryFilter, teacherFilter, selectionModeFilter],
        queryFn: async () => {
            let query = supabase
                .from('students')
                .select(`
                    *,
                    teacher:teachers(id, profile:profiles(full_name))
                `)
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }
            if (levelFilter !== 'all') {
                query = query.eq('course_level', levelFilter);
            }
            if (countryFilter !== 'all') {
                query = query.eq('country', countryFilter);
            }
            if (teacherFilter === 'none') {
                query = query.is('teacher_id', null);
            } else if (teacherFilter !== 'all') {
                query = query.eq('teacher_id', teacherFilter);
            }
            if (selectionModeFilter !== 'all') {
                query = query.eq('teacher_selection_mode', selectionModeFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as (Student & { teacher?: { id: string; profile: { full_name: string | null } } })[];
        },
    });

    const filteredStudents = students?.filter(student => {
        const matchesSearch =
            student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Students Directory</h1>
                    <p className="text-muted-foreground">Manage student enrollments, assignments, and academic progress.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Enroll Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Enroll New Student</DialogTitle>
                                <DialogDescription>
                                    Add a new student to the platform. They can link their account later using their email.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="enroll-name">Full Name</Label>
                                    <Input
                                        id="enroll-name"
                                        placeholder="John Doe"
                                        value={enrollFormData.full_name}
                                        onChange={(e) => setEnrollFormData({ ...enrollFormData, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="enroll-email">Email Address</Label>
                                    <Input
                                        id="enroll-email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={enrollFormData.email}
                                        onChange={(e) => setEnrollFormData({ ...enrollFormData, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Level</Label>
                                        <Select
                                            value={enrollFormData.course_level}
                                            onValueChange={(v) => setEnrollFormData({ ...enrollFormData, course_level: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Teacher</Label>
                                        <Select
                                            value={enrollFormData.teacher_id}
                                            onValueChange={(v) => setEnrollFormData({ ...enrollFormData, teacher_id: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Optional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers?.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.profile?.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    onClick={() => enrollStudent.mutate(enrollFormData)}
                                    disabled={enrollStudent.isPending || !enrollFormData.full_name || !enrollFormData.email}
                                    className="w-full rounded-full"
                                >
                                    {enrollStudent.isPending ? 'Enrolling...' : 'Confirm Enrollment'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={exportToCSV} className="rounded-full">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle>Directory Filters</CardTitle>
                            <CardDescription>Refine your search across {students?.length || 0} students.</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name or email..."
                                    className="pl-8 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-white">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Advanced Filters
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active Only</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>Inactive Only</DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Course Level</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setLevelFilter('all')}>All Levels</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setLevelFilter('Beginner')}>Beginner</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setLevelFilter('Intermediate')}>Intermediate</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setLevelFilter('Advanced')}>Advanced</DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Teachers</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setTeacherFilter('all')}>All Teachers</DropdownMenuItem>
                                    {teachers?.map((t) => (
                                        <DropdownMenuItem key={t.id} onClick={() => setTeacherFilter(t.id)}>
                                            {t.profile?.full_name}
                                        </DropdownMenuItem>
                                    ))}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Selection Mode</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setSelectionModeFilter('all')}>All Modes</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectionModeFilter('academy')}>Academy Assign</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('on_hold')}>On Hold</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectionModeFilter('self')}>Self Find</DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Academy Matching</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => {
                                        setSelectionModeFilter('academy');
                                        setTeacherFilter('none');
                                    }}>
                                        Pending Academy Match
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {(statusFilter !== 'all' || levelFilter !== 'all' || teacherFilter !== 'all' || selectionModeFilter !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setLevelFilter('all');
                                        setTeacherFilter('all');
                                        setSelectionModeFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="pl-6">Student</TableHead>
                                    <TableHead>Flow</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Assigned Teacher</TableHead>
                                    <TableHead>Course Level</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground italic">
                                            Syncing with real-time student records...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="h-8 w-8 text-muted-foreground/50" />
                                                <p className="text-muted-foreground">No students matched your current criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                                        <AvatarImage src={student.avatar_url || undefined} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-500 font-semibold">{student.full_name?.charAt(0) || 'S'}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900 leading-tight">{student.full_name}</span>
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Mail className="h-3 w-3" />
                                                            {student.email || 'No Email'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.teacher_selection_mode === 'academy' ? (
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Academy</Badge>
                                                ) : student.teacher_selection_mode === 'self' ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">Self Find</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">Not Selected</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {student.schedule_days && student.schedule_days.length > 0 ? (
                                                        <>
                                                            <div className="flex flex-wrap gap-1">
                                                                {student.schedule_days.map((day: string) => (
                                                                    <Badge key={day} variant="outline" className="text-[9px] px-1 py-0 h-4 bg-slate-50">
                                                                        {day.slice(0, 3)}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                                                <Clock className="h-3 w-3" />
                                                                {student.schedule_time || 'Flex'}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[10px]">TBD</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.teacher ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{student.teacher.profile?.full_name}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Expert Tutor</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                    {student.course_level || 'General'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <span className="text-muted-foreground">{student.country || 'Global'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={student.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}>
                                                    <div className={`h-1.5 w-1.5 rounded-full mr-2 ${student.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                                    {student.status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {student.created_at ? format(new Date(student.created_at), 'MMM d, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(student.id); toast.success('ID copied!'); }}>
                                                            Copy ID
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/students/${student.id}`)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/messages?partnerId=${student.user_id}`)}>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Message
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={async () => {
                                                                const { error } = await supabase.from('students').update({ teacher_selection_mode: null }).eq('id', student.id);
                                                                if (!error) {
                                                                    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
                                                                    toast.success('Selection mode reset');
                                                                }
                                                            }}
                                                        >
                                                            Reset Selection Mode
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-amber-600"
                                                            onClick={async () => {
                                                                const { error } = await supabase.from('students').update({ teacher_id: null }).eq('id', student.id);
                                                                if (!error) {
                                                                    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
                                                                    toast.success('Teacher unassigned');
                                                                }
                                                            }}
                                                        >
                                                            Unassign Teacher
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Change Assignment</DropdownMenuLabel>
                                                        {teachers?.map((t) => (
                                                            <DropdownMenuItem
                                                                key={t.id}
                                                                onClick={() => assignTeacher.mutate({ studentId: student.id, teacherId: t.id })}
                                                                className={student.teacher_id === t.id ? 'bg-primary/5 font-bold' : ''}
                                                            >
                                                                {t.profile?.full_name}
                                                            </DropdownMenuItem>
                                                        ))}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive font-bold bg-destructive/5 hover:bg-destructive hover:text-white transition-colors"
                                                            onClick={() => {
                                                                if (window.confirm('🚨 TOTAL PURGE: Are you absolutely sure? This will delete the user, their payments, attendance, AND auth account. THIS CANNOT BE UNDONE.')) {
                                                                    if (student.user_id) {
                                                                        deleteUserCompletely.mutate(student.user_id);
                                                                    } else {
                                                                        toast.error('This student is not linked to an Auth user.');
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <ShieldAlert className="mr-2 h-4 w-4" />
                                                            Nuclear Delete (Purge)
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => updateStudentStatus.mutate({ id: student.id, status: student.status === 'active' ? 'inactive' : 'active' })}
                                                        >
                                                            {student.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
