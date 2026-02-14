import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { useExaminerRemarks } from '@/hooks/useExaminerRemarks';
import { RemarkCard } from '@/components/lessons/RemarkCard';
import { RemarkCardSkeleton } from '@/components/skeletons/RemarkCardSkeleton';

export default function ExaminerRemarks() {
  const { remarks, students, stats, isLoading, respondToRemark } = useExaminerRemarks();
  const [activeTab, setActiveTab] = useState('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');

  const filteredRemarks = useMemo(() => {
    let result = remarks;

    // Filter by tab
    if (activeTab === 'pending') {
      result = result.filter(r => !r.teacher_response);
    } else if (activeTab === 'responded') {
      result = result.filter(r => r.teacher_response);
    }

    // Filter by student
    if (studentFilter !== 'all') {
      result = result.filter(r => r.student_id === studentFilter);
    }

    return result;
  }, [remarks, activeTab, studentFilter]);

  const handleRespond = (id: string, response: string) => {
    respondToRemark.mutate({ id, response });
  };

  const clearFilters = () => {
    setStudentFilter('all');
  };

  const hasActiveFilters = studentFilter !== 'all';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Examiner Remarks</h1>
          <p className="text-muted-foreground">View and respond to OCA feedback and examiner notes</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <RemarkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Examiner Remarks</h1>
        <p className="text-muted-foreground">
          View and respond to OCA feedback and examiner notes
        </p>
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
          <TabsTrigger value="responded" className="text-green-600">
            Responded ({stats.responded})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}

          {stats.pending > 0 && (
            <span className="text-sm text-yellow-600 font-medium ml-auto">
              {stats.pending} pending response{stats.pending > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Remarks List */}
        <TabsContent value={activeTab} className="mt-4">
          {filteredRemarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No remarks found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {activeTab === 'all' 
                  ? "You don't have any examiner remarks yet."
                  : `No ${activeTab} remarks found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRemarks.map(remark => (
                <RemarkCard
                  key={remark.id}
                  remark={remark}
                  onRespond={handleRespond}
                  isUpdating={respondToRemark.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
