import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, BookOpen, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLessonForm, type LessonFormData } from "@/hooks/useLessonForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { SurahSelector } from "@/components/lessons/SurahSelector";
import { StarRating } from "@/components/lessons/StarRating";
import { QURAN_SUBJECTS, TEACHING_METHODS, getSurahByName } from "@/lib/quran-data";

export default function AddLesson() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const { user } = useAuth();

  const [isFullMode, setIsFullMode] = useState(false);
  const [showMemorization, setShowMemorization] = useState(false);
  const [showIslamicStudies, setShowIslamicStudies] = useState(false);

  // Fetch class and student data
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      if (!classId) return null;

      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          student:students(*)
        `)
        .eq("id", classId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Fetch teacher ID
  const { data: teacher } = useQuery({
    queryKey: ["teacher", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const studentId = classData?.student_id ?? "";
  const teacherId = teacher?.id ?? "";
  // const courseLevel = classData?.student?.course_level;
  const courseLevel = undefined; // Property 'course_level' does not exist on type 'student'

  const { form, isSubmitting, submitLesson, getMaxAyah } = useLessonForm({
    classId: classId ?? "",
    studentId,
    teacherId,
    onSuccess: () => {
      navigate("/teacher/today-classes");
    },
  });

  const selectedSurah = form.watch("surah");
  const maxAyah = selectedSurah ? getMaxAyah(selectedSurah) : 286;

  // Update juzz when surah changes
  useEffect(() => {
    if (selectedSurah) {
      const surahInfo = getSurahByName(selectedSurah);
      if (surahInfo && isFullMode) {
        form.setValue("juzz", surahInfo.juzz);
      }
    }
  }, [selectedSurah, isFullMode, form]);

  const onSubmit = (data: LessonFormData) => {
    submitLesson(data);
  };

  if (!classId) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Class Selected</CardTitle>
            <CardDescription>
              Please select a class from the Today's Classes page to add a lesson.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/teacher/today-classes")}>
              Go to Today's Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (classLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Class Not Found</CardTitle>
            <CardDescription>
              The class you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/teacher/today-classes")}>
              Go to Today's Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const student = classData.student;

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Add Lesson</h1>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="full-mode" className="text-sm text-muted-foreground">
            Full Mode
          </Label>
          <Switch
            id="full-mode"
            checked={isFullMode}
            onCheckedChange={setIsFullMode}
          />
        </div>
      </div>

      {/* Student Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{student?.full_name ?? "Unknown Student"}</p>
              <p className="text-sm text-muted-foreground">
                {student?.course_level ?? "No level"} • {format(new Date(classData.scheduled_date), "MMM d, yyyy")} • {classData.start_time?.slice(0, 5)}
              </p>
            </div>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Lesson Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Mode Fields */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <FormField
                control={form.control}
                name="quran_subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QURAN_SUBJECTS.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Surah */}
              <FormField
                control={form.control}
                name="surah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surah</FormLabel>
                    <FormControl>
                      <SurahSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ayah Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ayah_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Ayah</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={maxAyah}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ayah_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Ayah</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={maxAyah}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {selectedSurah && (
                <p className="text-xs text-muted-foreground">
                  {selectedSurah} has {maxAyah} ayahs
                </p>
              )}
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Student Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rating_concentration"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        label="Concentration"
                        value={field.value ?? 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating_revision"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        label="Revision Quality"
                        value={field.value ?? 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating_progress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        label="Overall Progress"
                        value={field.value ?? 0}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about the lesson..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Full Mode Fields */}
          {isFullMode && (
            <>
              {/* Page Range & Juzz */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Page & Juzz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="juzz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Juzz Number</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="page_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Page</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={604}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="page_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Page</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={604}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Memorization Details */}
              <Collapsible open={showMemorization} onOpenChange={setShowMemorization}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Memorization Details</CardTitle>
                        {showMemorization ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <FormField
                        control={form.control}
                        name="memorization_surah"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Memorization Surah</FormLabel>
                            <FormControl>
                              <SurahSelector
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                placeholder="Select surah for memorization..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="memorization_ayah_from"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Ayah</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="memorization_ayah_to"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>To Ayah</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Islamic Studies */}
              <Collapsible open={showIslamicStudies} onOpenChange={setShowIslamicStudies}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Islamic Studies</CardTitle>
                        {showIslamicStudies ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      <FormField
                        control={form.control}
                        name="fundamental_islam"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fundamental Islam Topic</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Pillars of Islam, Tawheed..."
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ethics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ethics Topic</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Honesty, Patience..."
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Teaching Method */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Teaching Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select teaching method..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEACHING_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Lesson"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
