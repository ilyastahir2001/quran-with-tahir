import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { quranData } from '@/constants/quranData';

export const useQuranProgress = (studentId: string | undefined) => {
    return useQuery({
        queryKey: ['quran-progress', studentId],
        queryFn: async () => {
            if (!studentId) return null;

            // Fetch all lessons for this student
            const { data: lessons, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('student_id', studentId);

            if (error) throw error;

            // Calculate mastered Surahs (lessons where PROGRESS is >= 9) 
            // or simply sum up all surahs that have been "completed"
            const completedSurahs = new Set<number>();
            const completedJuz = new Set<number>();

            lessons?.forEach(lesson => {
                // Find surah ID from name in our quranData
                const surah = quranData.find(s => s.name === lesson.surah || s.transliteration === lesson.surah);
                if (surah && lesson.rating_progress && lesson.rating_progress >= 4) {
                    completedSurahs.add(surah.id);
                }

                if (lesson.juzz) {
                    completedJuz.add(lesson.juzz);
                }
            });

            return {
                completedSurahs: Array.from(completedSurahs),
                completedJuz: Array.from(completedJuz),
                lessonCount: lessons?.length || 0,
            };
        },
        enabled: !!studentId,
    });
};
