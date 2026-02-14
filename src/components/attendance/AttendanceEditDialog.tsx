import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { AttendanceWithDetails } from '@/hooks/useAttendance';
import type { AttendanceStatus } from '@/types/database';

interface AttendanceEditDialogProps {
  attendance: AttendanceWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, status: AttendanceStatus, note: string) => void;
  isLoading?: boolean;
}

export function AttendanceEditDialog({
  attendance,
  open,
  onOpenChange,
  onSave,
  isLoading,
}: AttendanceEditDialogProps) {
  const [status, setStatus] = useState<AttendanceStatus>(attendance?.status || 'present');
  const [note, setNote] = useState(attendance?.note || '');

  React.useEffect(() => {
    if (attendance) {
      setStatus(attendance.status);
      setNote(attendance.note || '');
    }
  }, [attendance]);

  const handleSave = () => {
    if (attendance) {
      onSave(attendance.id, status, note);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Update attendance record for {attendance?.student?.full_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
