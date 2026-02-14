import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useComplaints } from '@/hooks/useCommunication';

const statusConfig = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  under_review: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
};

export default function Complaints() {
  const { complaints, isLoading, createComplaint } = useComplaints();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    await createComplaint.mutateAsync({ subject, description, category: 'general', attachments: [] });
    setSubject('');
    setDescription('');
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">Submit and track your complaints</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit Complaint
        </Button>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No complaints</h3>
          <p className="text-muted-foreground text-sm mt-1">
            You haven't submitted any complaints yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const status = complaint.status ?? 'open';
            const config = statusConfig[status];

            return (
              <Card key={complaint.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{complaint.subject}</h3>
                    <Badge className={config.className}>{config.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{complaint.description}</p>

                  {complaint.admin_response && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium mb-1">Admin Response:</p>
                      <p className="text-sm">{complaint.admin_response}</p>
                    </div>
                  )}

                  {!complaint.admin_response && status === 'open' && (
                    <p className="text-xs text-muted-foreground italic">No response yet</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Complaint</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll address it as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createComplaint.isPending}>
                {createComplaint.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
