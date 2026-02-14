import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useClasses, useClassStats, type ClassFilters } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { ClassCard } from '@/components/classes/ClassCard';
import { ClassFilters as ClassFiltersComponent } from '@/components/classes/ClassFilters';
import { RecoveryClassDialog } from '@/components/classes/RecoveryClassDialog';
import { useNavigate } from 'react-router-dom';
import type { ClassWithStudent } from '@/hooks/useClasses';
import type { Database } from '@/integrations/supabase/types';

type ClassStatus = Database['public']['Enums']['class_status'];

export default function Classes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'recovery'>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithStudent | null>(null);

  const filters: ClassFilters = useMemo(() => ({
    tab: activeTab,
    studentId: selectedStudent && selectedStudent !== 'all' ? selectedStudent : undefined,
    status: selectedStatus.length > 0 ? selectedStatus as ClassStatus[] : undefined,
    startDate,
    endDate,
  }), [activeTab, selectedStudent, selectedStatus, startDate, endDate]);

  const { data: classes = [], isLoading: classesLoading } = useClasses(filters);
  const { data: students = [] } = useStudents();
  const { data: stats } = useClassStats();

  const handleScheduleRecovery = (classData: ClassWithStudent) => {
    setSelectedClass(classData);
    setRecoveryDialogOpen(true);
  };

  const handleStartCall = (classData: ClassWithStudent) => {
    navigate(`/virtual-class/${classData.id}`);
  };

  const handleClearFilters = () => {
    setSelectedStudent('');
    setSelectedStatus([]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Classes</h1>
          <p className="text-muted-foreground">
            View and manage all your scheduled classes
          </p>
        </div>
        <Button onClick={() => navigate('/teacher/schedule')}>
          <Calendar className="w-4 h-4 mr-2" />
          View Schedule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.upcoming || 0}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.missed || 0}</p>
                <p className="text-sm text-muted-foreground">Missed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="recovery">
              <RefreshCw className="w-4 h-4 mr-1" />
              Recovery
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <ClassFiltersComponent
            students={students}
            selectedStudent={selectedStudent}
            onStudentChange={setSelectedStudent}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClearFilters={handleClearFilters}
          />
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {classesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Classes Found</h3>
                <p className="text-muted-foreground mt-2">
                  {activeTab === 'upcoming'
                    ? 'You have no upcoming classes scheduled.'
                    : activeTab === 'past'
                      ? 'No past classes found with the current filters.'
                      : activeTab === 'recovery'
                        ? 'No recovery classes scheduled.'
                        : 'No classes found with the current filters.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  onScheduleRecovery={handleScheduleRecovery}
                  onStartCall={handleStartCall}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recovery Dialog */}
      <RecoveryClassDialog
        open={recoveryDialogOpen}
        onOpenChange={setRecoveryDialogOpen}
        originalClass={selectedClass}
      />
    </div>
  );
}
