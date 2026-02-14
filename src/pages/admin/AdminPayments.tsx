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
import { DollarSign, MoreHorizontal, Search, Filter, FileDown, CreditCard, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/types/database';

export default function AdminPayments() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

    const { data: payments, isLoading } = useQuery({
        queryKey: ['admin-payments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    student:students(full_name, email),
                    invoice:invoices(status, due_date)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching transactions:', error);
                return [];
            }
            return data;
        },
    });

    const filteredPayments = payments?.filter((payment) => {
        const studentName = payment.student?.full_name || '';
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            studentName.toLowerCase().includes(searchLower) ||
            payment.transaction_reference?.toLowerCase().includes(searchLower) ||
            payment.id.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) || [];

    const stats = {
        totalRevenue: filteredPayments
            .filter((p) => p.status === 'completed')
            .reduce((acc: number, curr) => acc + (curr.amount || 0), 0),
        pendingAmount: filteredPayments
            .filter((p) => p.status === 'pending')
            .reduce((acc: number, curr) => acc + (curr.amount || 0), 0),
        failedCount: filteredPayments.filter((p) => p.status === 'failed').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 uppercase text-[10px]">Completed</Badge>;
            case 'pending': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 uppercase text-[10px]">Pending</Badge>;
            case 'failed': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 uppercase text-[10px]">Failed</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments & Revenue</h1>
                    <p className="text-muted-foreground">Track all student fees and subscription transactions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                    <Button>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manual Payment
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${stats.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 inline-flex items-center font-medium">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +12%
                            </span> from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            ${stats.pendingAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across {filteredPayments.filter((p) => p.status === 'pending').length} pending invoices
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-red-600">!</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.failedCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Requires admin attention</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>A list of recent payments and their status.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    className="pl-8 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('failed')}>Failed</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reference ID</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">Loading payments...</TableCell>
                                    </TableRow>
                                ) : filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">No transactions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{payment.student?.full_name || 'System'}</span>
                                                    <span className="text-xs text-muted-foreground">{payment.student?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{format(new Date(payment.created_at), 'MMM d, h:mm a')}</TableCell>
                                            <TableCell className="font-bold">${payment.amount}</TableCell>
                                            <TableCell>{getStatusBadge(payment.status ?? 'pending')}</TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground">
                                                {payment.transaction_reference || payment.id.split('-')[0]}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => toast.info('Receipt viewer coming soon!')}>View Receipt</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => toast.info('Refund processing coming soon!')}>Refund Payment</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => toast.warning('Voiding transactions requires elevated permissions.')}>Void Transaction</DropdownMenuItem>
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
