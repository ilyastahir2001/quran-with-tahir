import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

import { type Student } from '@/types/database';

interface ClassFiltersProps {
  students: Student[];
  selectedStudent: string;
  onStudentChange: (value: string) => void;
  selectedStatus: string[];
  onStatusChange: (value: string[]) => void;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function ClassFilters({
  students,
  selectedStudent,
  onStudentChange,
  selectedStatus,
  onStatusChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: ClassFiltersProps) {
  const hasFilters = selectedStudent || selectedStatus.length > 0 || startDate || endDate;

  const toggleStatus = (status: string) => {
    if (selectedStatus.includes(status)) {
      onStatusChange(selectedStatus.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatus, status]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={selectedStudent} onValueChange={onStudentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Students" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Students</SelectItem>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {student.full_name || 'Unknown'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate && endDate
              ? `${format(startDate, 'PP')} - ${format(endDate, 'PP')}`
              : 'Pick dates'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={(range) => {
              onStartDateChange(range?.from);
              onEndDateChange(range?.to);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-1">
        {statusOptions.map((status) => (
          <Badge
            key={status.value}
            variant={selectedStatus.includes(status.value) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleStatus(status.value)}
          >
            {status.label}
          </Badge>
        ))}
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
