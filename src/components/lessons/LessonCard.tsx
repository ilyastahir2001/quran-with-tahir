import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { StarRating } from './StarRating';
import type { Lesson, Student } from '@/types/database';

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
  const studentInitials = lesson.student?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const avgRating = [
    lesson.rating_concentration,
    lesson.rating_revision,
    lesson.rating_progress,
  ].filter(Boolean).reduce((a, b) => a + (b || 0), 0) / 3;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={lesson.student?.avatar_url || undefined} />
              <AvatarFallback>{studentInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{lesson.student?.full_name || 'Unknown Student'}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(lesson.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          {lesson.is_quick_lesson && (
            <Badge variant="outline" className="text-xs shrink-0">Quick</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Surah Info */}
        {lesson.surah && (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium">{lesson.surah}</span>
            {lesson.ayah_from && lesson.ayah_to && (
              <span className="text-sm text-muted-foreground">
                (Ayat {lesson.ayah_from}-{lesson.ayah_to})
              </span>
            )}
          </div>
        )}

        {/* Subject & Level */}
        <div className="flex flex-wrap gap-2">
          {lesson.quran_subject && (
            <Badge variant="secondary" className="text-xs">
              {lesson.quran_subject}
            </Badge>
          )}

        </div>

        {/* Ratings */}
        {avgRating > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Star className="h-4 w-4 text-yellow-500" />
            <StarRating value={Math.round(avgRating)} size="sm" readOnly />
            <span className="text-xs text-muted-foreground ml-auto">
              Avg: {avgRating.toFixed(1)}/5
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
