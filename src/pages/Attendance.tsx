import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfMonth, startOfWeek } from 'date-fns';
import { Search, Filter, CalendarIcon, RefreshCw, ClipboardList, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAttendance, type AttendanceFilters, type AttendanceWithDetails } from '@/hooks/useAttendance';
import { useStudents } from '@/hooks/useStudents';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { AttendanceEditDialog } from '@/components/attendance/AttendanceEditDialog';
import { QuickAttendanceMarker } from '@/components/attendance/QuickAttendanceMarker';
import type { AttendanceStatus } from '@/types/database';

const datePresets = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'This Week', getValue: () => ({ from: startOfWeek(new Date()), to: new Date() }) },
  { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
];

const statusOptions: { value: AttendanceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' },
  { value: 'no_answer', label: 'No Answer' },
];

export default function Attendance() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AttendanceFilters>({
    dateFrom: subDays(new Date(), 30).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    status: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [editingAttendance, setEditingAttendance] = useState<AttendanceWithDetails | null>(null);

  const {
    attendance,
    isLoading,
    refetch,
    stats,
    statsLoading,
    classesNeedingAttendance,
    classesNeedingAttendanceLoading,
    createAttendance,
    updateAttendance,
    bulkMarkPresent,
  } = useAttendance(filters);

  const { data: students = [] } = useStudents();

  // Filter by search query
  const filteredAttendance = attendance.filter((record) =>
    record.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    if (range.from && range.to) {
      setFilters((prev) => ({
        ...prev,
        dateFrom: format(range.from!, 'yyyy-MM-dd'),
        dateTo: format(range.to!, 'yyyy-MM-dd'),
      }));
    }
  };

  const handlePresetSelect = (preset: typeof datePresets[0]) => {
    const range = preset.getValue();
    handleDateRangeChange(range);
  };

  const handleClearFilters = () => {
    const defaultRange = { from: subDays(new Date(), 30), to: new Date() };
    setDateRange(defaultRange);
    setFilters({
      dateFrom: format(defaultRange.from, 'yyyy-MM-dd'),
      dateTo: format(defaultRange.to, 'yyyy-MM-dd'),
      status: 'all',
    });
    setSearchQuery('');
  };

  const handleEditSave = (id: string, status: AttendanceStatus, note: string) => {
    updateAttendance.mutate(
      { id, status, note },
      {
        onSuccess: () => setEditingAttendance(null),
      }
    );
  };

  const handleQuickMark = (classId: string, studentId: string, status: AttendanceStatus) => {
    createAttendance.mutate({ classId, studentId, status });
  };

  const handleMarkAllPresent = () => {
    const classesToMark = classesNeedingAttendance.map((cls) => ({
      id: cls.id,
      student_id: cls.student_id,
    }));
    bulkMarkPresent.mutate(classesToMark);
  };

  const hasActiveFilters =
    filters.studentId ||
    filters.status !== 'all' ||
    searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track and manage student attendance</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <AttendanceStats stats={stats} isLoading={statsLoading} />

      {/* Quick Attendance Marker */}
      <QuickAttendanceMarker
        classes={classesNeedingAttendance}
        isLoading={classesNeedingAttendanceLoading}
        onMarkAttendance={handleQuickMark}
        onMarkAllPresent={handleMarkAllPresent}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search students by name"
          />
        </div>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal min-w-[240px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'MMM d, yyyy')
                )
              ) : (
                'Pick a date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <div className="border-r p-2 space-y-1">
                {datePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
                numberOfMonths={1}
                className="p-3 pointer-events-auto"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Student Filter */}
        <Select
          value={filters.studentId || 'all'}
          onValueChange={(v) =>
            setFilters((prev) => ({ ...prev, studentId: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) =>
            setFilters((prev) => ({ ...prev, status: v as AttendanceStatus | 'all' }))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Attendance List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAttendance.length > 0 ? (
        <div className="space-y-3">
          {filteredAttendance.map((record) => (
            <AttendanceCard
              key={record.id}
              attendance={record}
              onEdit={setEditingAttendance}
              onViewClass={(classId) => navigate(`/classes?classId=${classId}`)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No attendance records found</p>
              <p className="text-sm">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Attendance records will appear here after marking'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <AttendanceEditDialog
        attendance={editingAttendance}
        open={!!editingAttendance}
        onOpenChange={(open) => !open && setEditingAttendance(null)}
        onSave={handleEditSave}
        isLoading={updateAttendance.isPending}
      />
    </div>
  );
}
