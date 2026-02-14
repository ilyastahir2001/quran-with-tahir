import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, X } from 'lucide-react';
import { useLessons } from '@/hooks/useLessons';
import { Lesson } from '@/types/database';
import { LessonCard } from '@/components/lessons/LessonCard';
import { LessonDetailsDialog } from '@/components/lessons/LessonDetailsDialog';
import { LessonCardSkeleton } from '@/components/skeletons/LessonCardSkeleton';

export default function LessonHistory() {
  const { lessons, students, surahs, isLoading, stats } = useLessons();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [surahFilter, setSurahFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = useMemo(() => {
    let result = lessons;

    if (studentFilter !== 'all') {
      result = result.filter(l => l.student_id === studentFilter);
    }

    if (surahFilter !== 'all') {
      result = result.filter(l => l.surah === surahFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.student?.full_name?.toLowerCase().includes(query) ||
        l.surah?.toLowerCase().includes(query) ||
        l.comments?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [lessons, studentFilter, surahFilter, searchQuery]);

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setStudentFilter('all');
    setSurahFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = studentFilter !== 'all' || surahFilter !== 'all' || searchQuery;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lesson History</h1>
          <p className="text-muted-foreground">View and filter past lesson records</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LessonCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lesson History</h1>
        <p className="text-muted-foreground">
          View and filter past lesson records • {stats.total} total lessons
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search lessons by student name, surah, or comments"
          />
        </div>

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

        <Select value={surahFilter} onValueChange={setSurahFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Surahs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surahs</SelectItem>
            {surahs.map(surah => (
              <SelectItem key={surah} value={surah!}>
                {surah}
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
      </div>

      {/* Lesson List */}
      {filteredLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No lessons found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {hasActiveFilters
              ? "Try adjusting your filters to find more lessons."
              : "You haven't recorded any lessons yet."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onClick={() => handleLessonClick(lesson)}
            />
          ))}
        </div>
      )}

      {/* Lesson Details Dialog */}
      <LessonDetailsDialog
        lesson={selectedLesson}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
