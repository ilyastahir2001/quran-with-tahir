import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTeacherLeave } from '@/hooks/useTeacherLeave';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Loader2, Plus, Calendar, X, Clock } from 'lucide-react';

const LEAVE_TYPES = [
    { value: 'sick', label: 'Sick Leave' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'personal', label: 'Personal' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function LeaveRequests() {
    const { leaveRequests, isLoading, createLeaveRequest, isCreating, cancelLeaveRequest, isCancelling } = useTeacherLeave();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leave_type || !formData.start_date || !formData.end_date) {
            return;
        }
        createLeaveRequest(formData, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
            },
        });
    };

    const getDuration = (start: string, end: string) => {
        const days = differenceInDays(parseISO(end), parseISO(start)) + 1;
        return days === 1 ? '1 day' : `${days} days`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
                    <p className="text-muted-foreground">Submit and manage your leave requests</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request Leave</DialogTitle>
                            <DialogDescription>Submit a new leave request for approval.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="leave_type">Leave Type</Label>
                                <Select value={formData.leave_type} onValueChange={(v) => setFormData(prev => ({ ...prev, leave_type: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAVE_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        min={formData.start_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Textarea
                                    id="reason"
                                    value={formData.reason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Provide additional details..."
                                    rows={3}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        My Leave Requests
                    </CardTitle>
                    <CardDescription>Track the status of your leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {leaveRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p>No leave requests yet.</p>
                            <p className="text-sm">Click "New Request" to submit one.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium capitalize">{request.leave_type.replace('_', ' ')}</TableCell>
                                        <TableCell>{getDuration(request.start_date, request.end_date)}</TableCell>
                                        <TableCell>
                                            {format(parseISO(request.start_date), 'MMM d')} - {format(parseISO(request.end_date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[request.status]}>{request.status}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {request.admin_notes || request.reason || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {request.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => cancelLeaveRequest(request.id)}
                                                    disabled={isCancelling}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
