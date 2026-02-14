import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getMaxAyahForSurah, getSurahByName } from "@/lib/quran-data";

const lessonFormSchema = z.object({
  // Quick mode fields
  quran_subject: z.string().min(1, "Subject is required"),
  surah: z.string().min(1, "Surah is required"),
  ayah_from: z.number().min(1, "Starting ayah is required"),
  ayah_to: z.number().min(1, "Ending ayah is required"),
  rating_concentration: z.number().min(0).max(5).optional(),
  rating_revision: z.number().min(0).max(5).optional(),
  rating_progress: z.number().min(0).max(5).optional(),
  comments: z.string().optional(),

  // Full mode fields
  juzz: z.number().min(1).max(30).optional().nullable(),
  page_from: z.number().min(1).max(604).optional().nullable(),
  page_to: z.number().min(1).max(604).optional().nullable(),
  memorization_surah: z.string().optional().nullable(),
  memorization_ayah_from: z.number().optional().nullable(),
  memorization_ayah_to: z.number().optional().nullable(),
  fundamental_islam: z.string().optional().nullable(),
  ethics: z.string().optional().nullable(),
  method: z.string().optional().nullable(),
}).refine(
  (data) => data.ayah_to >= data.ayah_from,
  {
    message: "Ending ayah must be greater than or equal to starting ayah",
    path: ["ayah_to"],
  }
);

export type LessonFormData = z.infer<typeof lessonFormSchema>;

interface UseLessonFormProps {
  classId: string;
  studentId: string;
  teacherId: string;
  onSuccess?: () => void;
}

export function useLessonForm({
  classId,
  studentId,
  teacherId,
  onSuccess,
}: UseLessonFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      quran_subject: "",
      surah: "",
      ayah_from: 1,
      ayah_to: 1,
      rating_concentration: 0,
      rating_revision: 0,
      rating_progress: 0,
      comments: "",
      juzz: null,
      page_from: null,
      page_to: null,
      memorization_surah: null,
      memorization_ayah_from: null,
      memorization_ayah_to: null,
      fundamental_islam: null,
      ethics: null,
      method: null,
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      // Get the surah info for juzz if not provided
      const surahInfo = getSurahByName(data.surah);
      const juzzValue = data.juzz ?? null;

      // 1. Insert lesson
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .insert({
          class_id: classId,
          student_id: studentId,
          teacher_id: teacherId,
          quran_subject: data.quran_subject,
          surah: data.surah,
          ayah_from: data.ayah_from,
          ayah_to: data.ayah_to,
          rating_concentration: data.rating_concentration || null,
          rating_revision: data.rating_revision || null,
          rating_progress: data.rating_progress || null,
          comments: data.comments || null,
          juzz: juzzValue,
          page_from: data.page_from,
          page_to: data.page_to,
          memorization_surah: data.memorization_surah,
          memorization_ayah_from: data.memorization_ayah_from,
          memorization_ayah_to: data.memorization_ayah_to,
          fundamental_islam: data.fundamental_islam,
          ethics: data.ethics,
          method: data.method,
          is_quick_lesson: !data.juzz && !data.page_from, // Mark as quick if no full mode fields
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // 2. Update class to mark lesson as added
      const { error: classError } = await supabase
        .from("classes")
        .update({ lesson_added: true })
        .eq("id", classId);

      if (classError) throw classError;

      // 3. Update student's current progress (optional)
      if (surahInfo) {
        await supabase
          .from("students")
          .update({
            current_surah: data.surah,
            current_juzz: juzzValue,
          })
          .eq("id", studentId);
      }

      return lesson;
    },
    onSuccess: () => {
      toast({
        title: "Lesson saved",
        description: "The lesson record has been saved successfully.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["today-classes"] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["class", classId] });

      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to save lesson:", error);
      toast({
        title: "Error saving lesson",
        description: "There was a problem saving the lesson. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateAyahRange = (surahName: string, ayahFrom: number, ayahTo: number): boolean => {
    const surah = getSurahByName(surahName);
    if (!surah) return true;

    const maxAyah = surah.ayahCount;
    return ayahFrom <= maxAyah && ayahTo <= maxAyah;
  };

  return {
    form,
    isSubmitting: createLessonMutation.isPending,
    submitLesson: (data: LessonFormData) => createLessonMutation.mutate(data),
    validateAyahRange,
    getMaxAyah: (surahName: string) => {
      const surah = getSurahByName(surahName);
      return surah?.ayahCount ?? 286;
    },
  };
}
