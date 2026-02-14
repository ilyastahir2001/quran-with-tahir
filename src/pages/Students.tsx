import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentStats } from '@/components/students/StudentStats';
import { useStudents, useStudentStats } from '@/hooks/useStudents';
import { Search, LayoutGrid, List, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortOption = 'name-asc' | 'name-desc' | 'progress-high' | 'progress-low';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: stats, isLoading: statsLoading } = useStudentStats();

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    const filtered = students.filter((student) => {
      const matchesSearch =
        searchQuery === '' ||
        (student.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesLevel = levelFilter === 'all' || student.course_level === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'name-desc':
          return (b.full_name || '').localeCompare(a.full_name || '');
        case 'progress-high':
          return (b.progress_percentage || 0) - (a.progress_percentage || 0);
        case 'progress-low':
          return (a.progress_percentage || 0) - (b.progress_percentage || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchQuery, statusFilter, levelFilter, sortBy]);

  const navigate = useNavigate();

  const handleCallClick = (studentId: string) => {
    // Navigate to classroom to initiate video call with student
    navigate(`/virtual-class/call?studentId=${studentId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Students</h1>
          <p className="text-muted-foreground">Manage and track your students' progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StudentStats
        total={stats?.total || 0}
        active={stats?.active || 0}
        withClassToday={stats?.withClassToday || 0}
        avgProgress={stats?.avgProgress || 0}
        isLoading={statsLoading}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="progress-high">Progress (High)</SelectItem>
            <SelectItem value="progress-low">Progress (Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Grid/List */}
      {studentsLoading ? (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No students found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery || statusFilter !== 'all' || levelFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'You have no students assigned yet'}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
        >
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onCallClick={handleCallClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
