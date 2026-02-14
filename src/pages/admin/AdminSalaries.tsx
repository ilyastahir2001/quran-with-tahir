import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search,
    Banknote,
    Clock,
    Send,
    Download,
    MoreHorizontal,
    TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SalaryRecord } from '@/types/database';

interface SalaryWithTeacher extends Omit<SalaryRecord, 'teacher'> {
    teacher: {
        id: string;
        profile: {
            full_name: string | null;
            avatar_url: string | null;
        } | null;
    } | null;
}


export default function AdminSalaries() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: salaryData, isLoading } = useQuery({
        queryKey: ['admin-salaries'],
        queryFn: async () => {
            // Joining teachers -> profile -> salary_records
            const { data, error } = await supabase
                .from('salary_records')
                .select(`
                  *,
                  teacher:teachers(
                    id,
                    profile:profiles(full_name, avatar_url)
                  )
                `)
                .order('month', { ascending: false });

            if (error) {
                console.error('Error fetching salaries:', error);
                return [] as SalaryWithTeacher[];
            }
            return data as SalaryWithTeacher[];
        },
    });

    const filteredSalaries = salaryData?.filter((record) => {
        const teacherName = record.teacher?.profile?.full_name || '';
        return teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.month.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    const totalPayout = filteredSalaries.reduce((acc: number, curr) => acc + (curr.net_salary || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payroll & Salaries</h1>
                    <p className="text-muted-foreground">Manage teacher payouts, bonuses, and deductions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Slips
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Send className="mr-2 h-4 w-4" />
                        Run Payroll
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payouts (Month)</CardTitle>
                        <Banknote className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalPayout.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">For {new Set(filteredSalaries.map((s) => s.teacher_id)).size} active teachers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredSalaries.filter((s) => s.status === 'pending').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Salary slips awaiting review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bonuses / Deductions</CardTitle>
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${filteredSalaries.reduce((acc: number, curr) => acc + (curr.bonus || 0) - (curr.total_deductions || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Net adjustments this cycle</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Payroll History</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by teacher or month..."
                                className="pl-8 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Classes</TableHead>
                                    <TableHead>Base Salary</TableHead>
                                    <TableHead>Net Payout</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">Loading payroll...</TableCell>
                                    </TableRow>
                                ) : filteredSalaries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">No payroll records found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSalaries.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                        {record.teacher?.profile?.avatar_url ? (
                                                            <img src={record.teacher.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-500">
                                                                {record.teacher?.profile?.full_name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{record.teacher?.profile?.full_name || 'Teacher Profile'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{record.month}</TableCell>
                                            <TableCell>{record.classes_count}</TableCell>
                                            <TableCell>${record.base_salary}</TableCell>
                                            <TableCell className="font-bold">${record.net_salary}</TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === 'paid' ? 'secondary' : 'outline'}
                                                    className={record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-slate-100'}>
                                                    {record.status?.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Breakdown</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit Adjustment</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-green-600">Mark as Paid</DropdownMenuItem>
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
