import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminLeaveRequests, LeaveRequest } from '@/hooks/useTeacherLeave';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Loader2, Check, X, Calendar, Clock, FileText } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function AdminLeaveApprovals() {
    const { allRequests, isLoading, reviewRequest, isReviewing } = useAdminLeaveRequests();
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    const processedRequests = allRequests.filter(r => r.status !== 'pending');

    const handleReview = () => {
        if (!selectedRequest || !reviewAction) return;
        reviewRequest(
            { id: selectedRequest.id, status: reviewAction, admin_notes: adminNotes },
            {
                onSuccess: () => {
                    setSelectedRequest(null);
                    setReviewAction(null);
                    setAdminNotes('');
                },
            }
        );
    };

    const openReviewDialog = (request: LeaveRequest, action: 'approved' | 'rejected') => {
        setSelectedRequest(request);
        setReviewAction(action);
        setAdminNotes('');
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

    const RequestsTable = ({ requests, showActions = false }: { requests: LeaveRequest[]; showActions?: boolean }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-muted-foreground">
                            No requests found.
                        </TableCell>
                    </TableRow>
                ) : (
                    requests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.teacher?.full_name || 'Unknown'}</TableCell>
                            <TableCell className="capitalize">{request.leave_type.replace('_', ' ')}</TableCell>
                            <TableCell>{getDuration(request.start_date, request.end_date)}</TableCell>
                            <TableCell>
                                {format(parseISO(request.start_date), 'MMM d')} - {format(parseISO(request.end_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{request.reason || '-'}</TableCell>
                            <TableCell>
                                <Badge className={STATUS_COLORS[request.status]}>{request.status}</Badge>
                            </TableCell>
                            {showActions && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:bg-green-50"
                                            onClick={() => openReviewDialog(request, 'approved')}
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => openReviewDialog(request, 'rejected')}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Leave Approvals</h1>
                <p className="text-muted-foreground">Review and manage teacher leave requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <Check className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allRequests.filter(r => r.status === 'approved').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <X className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allRequests.filter(r => r.status === 'rejected').length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Leave Requests
                    </CardTitle>
                    <CardDescription>Approve or reject teacher leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending">
                        <TabsList>
                            <TabsTrigger value="pending">
                                Pending ({pendingRequests.length})
                            </TabsTrigger>
                            <TabsTrigger value="processed">
                                Processed ({processedRequests.length})
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="pending" className="mt-4">
                            <RequestsTable requests={pendingRequests} showActions />
                        </TabsContent>
                        <TabsContent value="processed" className="mt-4">
                            <RequestsTable requests={processedRequests} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === 'approved' ? 'Approve' : 'Reject'} Leave Request
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRequest && (
                                <span>
                                    {selectedRequest.teacher?.full_name} - {selectedRequest.leave_type} leave for{' '}
                                    {getDuration(selectedRequest.start_date, selectedRequest.end_date)}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Admin Notes (Optional)</label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes for the teacher..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReview}
                            disabled={isReviewing}
                            className={reviewAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {isReviewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            {reviewAction === 'approved' ? 'Approve' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
