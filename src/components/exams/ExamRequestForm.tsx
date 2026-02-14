import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Book, BookOpen, Send, Check } from 'lucide-react';
import { quranData } from '@/constants/quranData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import type { Database } from '@/integrations/supabase/types';

type ExamType = Database['public']['Enums']['exam_type'];

export const ExamRequestForm = () => {
    const { student } = useAuth();
    const [surah, setSurah] = useState('');
    const [juz, setJuz] = useState<string>('');
    const [examType, setExamType] = useState<ExamType>('nazra');
    const [date, setDate] = useState<Date>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleSubmit = async () => {
        if (!student?.id) return;
        if (!surah && !juz) {
            toast.error('Please select a Surah or Juz');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('exam_requests')
                .insert({
                    student_id: student.id,
                    surah_name: surah,
                    juz_number: juz ? parseInt(juz) : null,
                    type: examType,
                    preferred_date: date?.toISOString(),
                    status: 'pending'
                });

            if (error) throw error;

            setIsDone(true);
            toast.success('Exam request sent to Admin!');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error('Failed to send request: ' + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isDone) {
        return (
            <Card className="border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black mb-2">Request Submitted!</CardTitle>
                <CardDescription className="text-lg">
                    Your exam request for {surah || `Juz ${juz}`} has been sent to our academic department. We will notify you once it is scheduled.
                </CardDescription>
                <Button variant="outline" className="mt-6 rounded-full" onClick={() => setIsDone(false)}>Request Another</Button>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
            <div className="bg-primary p-6 text-primary-foreground">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Book className="h-6 w-6" />
                    Request an Assessment
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 mt-1">
                    Select what you've mastered and schedule a formal examination.
                </CardDescription>
            </div>
            <CardContent className="space-y-6 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Assessment Type</Label>
                        <Select value={examType} onValueChange={(v) => setExamType(v as ExamType)}>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nazra">Nazra (Recitation)</SelectItem>
                                <SelectItem value="hifz">Hifz (Memorization)</SelectItem>
                                <SelectItem value="tajweed_test">Tajweed Mastery Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Surah</Label>
                        <Select value={surah} onValueChange={(v) => { setSurah(v); setJuz(''); }}>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                                <SelectValue placeholder="Search Surah..." />
                            </SelectTrigger>
                            <SelectContent>
                                {quranData.map(s => (
                                    <SelectItem key={s.id} value={s.transliteration}>{s.id}. {s.transliteration}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Or Select Juz</Label>
                        <Select value={juz} onValueChange={(v) => { setJuz(v); setSurah(''); }}>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                                <SelectValue placeholder="Select Juz..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                                    <SelectItem key={j} value={j.toString()}>Juz {j}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preferred Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full h-12 rounded-xl border-2 justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-8">
                <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Sending Request..." : "Send Request to Academic Head"}
                    <Send className="ml-2 h-5 w-5" />
                </Button>
            </CardFooter>
        </Card>
    );
};
