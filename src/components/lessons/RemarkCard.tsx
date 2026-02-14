import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { User, Calendar, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ExaminerRemark = Tables<'examiner_remarks'> & {
  student?: Tables<'students'> | null;
  lesson?: Tables<'lessons'> | null;
};

interface RemarkCardProps {
  remark: ExaminerRemark;
  onRespond: (id: string, response: string) => void;
  isUpdating?: boolean;
}

export function RemarkCard({ remark, onRespond, isUpdating }: RemarkCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [response, setResponse] = useState(remark.teacher_response || '');

  const studentInitials = remark.student?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const hasResponse = !!remark.teacher_response;

  const handleSubmit = () => {
    onRespond(remark.id, response);
    setDialogOpen(false);
  };

  return (
    <>
      <Card className={hasResponse ? 'border-green-200/50' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={remark.student?.avatar_url || undefined} />
                <AvatarFallback>{studentInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{remark.student?.full_name || 'Unknown Student'}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(remark.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            {hasResponse ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Responded
              </Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Remark Text */}
          <p className="text-sm">{remark.remarks_text}</p>

          {/* Tags */}
          {remark.tags && remark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {remark.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Linked Lesson Info */}
          {remark.lesson && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              <BookOpen className="h-3.5 w-3.5" />
              <span>
                {remark.lesson.surah && `${remark.lesson.surah}`}
                {remark.lesson.ayah_from && ` (${remark.lesson.ayah_from}-${remark.lesson.ayah_to})`}
                {' • '}
                {format(new Date(remark.lesson.created_at), 'MMM d')}
              </span>
            </div>
          )}

          {/* Teacher Response */}
          {remark.teacher_response && (
            <div className="p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
              <p className="text-xs font-medium text-primary mb-1">Your Response:</p>
              <p className="text-sm">{remark.teacher_response}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t">
            <Button
              size="sm"
              variant={hasResponse ? "outline" : "default"}
              onClick={() => setDialogOpen(true)}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {hasResponse ? 'Edit Response' : 'Respond'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Remark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Examiner's Remark:</p>
              <p className="text-sm text-muted-foreground">{remark.remarks_text}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Response</label>
              <Textarea
                placeholder="Write your response to this remark..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!response.trim() || isUpdating}>
              {isUpdating ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
