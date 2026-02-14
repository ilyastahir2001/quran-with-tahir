import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ListTodo, Loader2, X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';

type TaskFilter = 'all' | 'personal' | 'assigned';

export default function Tasks() {
  const { tasks, isLoading, stats, createTask, updateTaskStatus, deleteTask } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TaskFilter>('all');

  // Filter tasks based on tab and type filter
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by status tab
    if (activeTab !== 'all') {
      result = result.filter(task => task.status === activeTab);
    }

    // Filter by type
    if (typeFilter === 'personal') {
      result = result.filter(task => task.is_personal);
    } else if (typeFilter === 'assigned') {
      result = result.filter(task => !task.is_personal);
    }

    return result;
  }, [tasks, activeTab, typeFilter]);

  const handleCreateTask = async (data: { title: string; description?: string; due_date?: string }) => {
    await createTask.mutateAsync(data);
    setDialogOpen(false);
  };

  const handleStatusChange = (id: string, status: 'pending' | 'in_progress' | 'completed') => {
    updateTaskStatus.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(id);
    }
  };

  const clearFilters = () => {
    setTypeFilter('all');
  };

  const hasActiveFilters = typeFilter !== 'all';

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
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your personal and assigned tasks</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-yellow-600">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="text-blue-600">
            In Progress ({stats.inProgress})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-green-600">
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TaskFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}

          {stats.overdue > 0 && (
            <span className="text-sm text-destructive font-medium ml-auto">
              {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Task List */}
        <TabsContent value={activeTab} className="mt-4">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === 'all' 
                  ? "You don't have any tasks yet. Create one to get started!"
                  : `No ${activeTab.replace('_', ' ')} tasks found.`
                }
              </p>
              {activeTab === 'all' && (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={task.is_personal ? handleDelete : undefined}
                  isUpdating={updateTaskStatus.isPending || deleteTask.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateTask}
        isSubmitting={createTask.isPending}
      />
    </div>
  );
}
