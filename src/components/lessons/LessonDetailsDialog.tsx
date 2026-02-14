import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Calendar, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { StarRating } from './StarRating';

type Lesson = Tables<'lessons'> & {
  student?: Tables<'students'> | null;
  class?: Tables<'classes'> | null;
};

interface LessonDetailsDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonDetailsDialog({ lesson, open, onOpenChange }: LessonDetailsDialogProps) {
  if (!lesson) return null;

  const studentInitials = lesson.student?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lesson Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={lesson.student?.avatar_url || undefined} />
              <AvatarFallback>{studentInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{lesson.student?.full_name || 'Unknown Student'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(lesson.created_at), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            {lesson.is_quick_lesson && (
              <Badge variant="outline" className="ml-auto">Quick Lesson</Badge>
            )}
          </div>

          <Separator />

          {/* Quran Content */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Quran Progress
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lesson.surah && (
                <div>
                  <span className="text-muted-foreground">Surah:</span>
                  <p className="font-medium">{lesson.surah}</p>
                </div>
              )}
              {lesson.juzz && (
                <div>
                  <span className="text-muted-foreground">Juzz:</span>
                  <p className="font-medium">{lesson.juzz}</p>
                </div>
              )}
              {lesson.ayah_from && lesson.ayah_to && (
                <div>
                  <span className="text-muted-foreground">Ayat Range:</span>
                  <p className="font-medium">{lesson.ayah_from} - {lesson.ayah_to}</p>
                </div>
              )}
              {lesson.page_from && lesson.page_to && (
                <div>
                  <span className="text-muted-foreground">Pages:</span>
                  <p className="font-medium">{lesson.page_from} - {lesson.page_to}</p>
                </div>
              )}
              {lesson.quran_subject && (
                <div>
                  <span className="text-muted-foreground">Subject:</span>
                  <p className="font-medium">{lesson.quran_subject}</p>
                </div>
              )}

            </div>
          </div>

          {/* Memorization */}
          {lesson.memorization_surah && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Memorization</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Surah:</span>
                    <p className="font-medium">{lesson.memorization_surah}</p>
                  </div>
                  {lesson.memorization_ayah_from && lesson.memorization_ayah_to && (
                    <div>
                      <span className="text-muted-foreground">Ayat:</span>
                      <p className="font-medium">
                        {lesson.memorization_ayah_from} - {lesson.memorization_ayah_to}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Ratings */}
          {(lesson.rating_concentration || lesson.rating_revision || lesson.rating_progress) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Ratings</h4>
                <div className="space-y-2">
                  {lesson.rating_concentration !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Concentration</span>
                      <StarRating value={lesson.rating_concentration ?? 0} size="sm" readOnly />
                    </div>
                  )}
                  {lesson.rating_revision !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Revision</span>
                      <StarRating value={lesson.rating_revision ?? 0} size="sm" readOnly />
                    </div>
                  )}
                  {lesson.rating_progress !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <StarRating value={lesson.rating_progress ?? 0} size="sm" readOnly />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Additional Fields */}
          {(lesson.fundamental_islam || lesson.ethics) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Additional Topics</h4>
                <div className="space-y-2 text-sm">
                  {lesson.fundamental_islam && (
                    <div>
                      <span className="text-muted-foreground">Islamic Fundamentals:</span>
                      <p>{lesson.fundamental_islam}</p>
                    </div>
                  )}
                  {lesson.ethics && (
                    <div>
                      <span className="text-muted-foreground">Ethics:</span>
                      <p>{lesson.ethics}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Comments */}
          {lesson.comments && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </h4>
                <p className="text-sm text-muted-foreground">{lesson.comments}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
