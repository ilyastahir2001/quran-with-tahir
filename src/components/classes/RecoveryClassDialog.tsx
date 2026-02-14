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
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ClassWithStudent } from '@/hooks/useClasses';
import { useCreateRecoveryClass } from '@/hooks/useClasses';

interface RecoveryClassDialogProps {
  originalClass: ClassWithStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryClassDialog({ originalClass, open, onOpenChange }: RecoveryClassDialogProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const createRecovery = useCreateRecoveryClass();

  const handleSubmit = async () => {
    if (!originalClass || !date || !time) return;
    
    await createRecovery.mutateAsync({
      originalClassId: originalClass.id,
      studentId: originalClass.student_id,
      scheduledDate: format(date, 'yyyy-MM-dd'),
      startTime: time,
      durationMinutes: originalClass.duration_minutes || 30,
    });
    
    onOpenChange(false);
    setDate(undefined);
    setTime('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Recovery Class</DialogTitle>
          <DialogDescription>
            Schedule a recovery class for {originalClass?.student?.full_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !time || createRecovery.isPending}
          >
            {createRecovery.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
