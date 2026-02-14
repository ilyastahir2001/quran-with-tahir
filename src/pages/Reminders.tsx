import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell } from 'lucide-react';
import { useReminders } from '@/hooks/useReminders';
import { useStudents } from '@/hooks/useStudents';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { ReminderDialog } from '@/components/reminders/ReminderDialog';
import { ReminderCardSkeleton } from '@/components/skeletons/ReminderCardSkeleton';

export default function Reminders() {
  const { reminders, stats, isLoading, createReminder, toggleComplete, deleteReminder } = useReminders();
  const { data: students = [] } = useStudents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredReminders = useMemo(() => {
    const now = new Date();

    switch (activeTab) {
      case 'upcoming':
        return reminders.filter(r => !r.is_completed && new Date(r.remind_at) >= now);
      case 'overdue':
        return reminders.filter(r => !r.is_completed && new Date(r.remind_at) < now);
      case 'completed':
        return reminders.filter(r => r.is_completed);
      default:
        return reminders;
    }
  }, [reminders, activeTab]);

  const handleCreateReminder = async (data: {
    title: string;
    description?: string;
    remind_at: string;
    student_id?: string;
  }) => {
    await createReminder.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    toggleComplete.mutate({ id, isCompleted });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
            <p className="text-muted-foreground">Set and manage your personal reminders</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Reminder
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ReminderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">Set and manage your personal reminders</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reminder
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-blue-600">
            Upcoming ({stats.upcoming})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-red-600">
            Overdue ({stats.overdue})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-green-600">
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>

        {/* Overdue Warning */}
        {stats.overdue > 0 && activeTab !== 'overdue' && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <span className="text-sm text-destructive font-medium">
              ⚠️ You have {stats.overdue} overdue reminder{stats.overdue > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Reminder List */}
        <TabsContent value={activeTab} className="mt-4">
          {filteredReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No reminders found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === 'all'
                  ? "You don't have any reminders yet. Create one to get started!"
                  : `No ${activeTab} reminders found.`
                }
              </p>
              {activeTab === 'all' && (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reminder
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  isUpdating={toggleComplete.isPending || deleteReminder.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Reminder Dialog */}
      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateReminder}
        isSubmitting={createReminder.isPending}
        students={students.map(s => ({ id: s.id, full_name: s.full_name || 'Unknown Student' }))}
      />
    </div>
  );
}
