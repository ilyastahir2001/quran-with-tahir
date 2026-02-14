import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
    AlertCircle,
    CheckCircle2,
    MinusCircle,
    PlusCircle,
    Save,
    Trophy,
    History,
    Info,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Json } from '@/types/database';

interface Mistake {
    type: 'tajweed' | 'fluency' | 'memorization';
    description: string;
    severity: 'minor' | 'major';
}

export const GradingPad = ({ examId, studentId, studentName, surahName }: { examId: string, studentId: string, studentName: string, surahName: string }) => {
    const [scores, setScores] = useState({
        tajweed: 100,
        fluency: 100,
        memorization: 100
    });

    const [mistakes, setMistakes] = useState<Mistake[]>([]);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalScore = Math.round((scores.tajweed + scores.fluency + scores.memorization) / 3);
    const isPassed = totalScore >= 70;

    const handleAdjustScore = (type: keyof typeof scores, delta: number) => {
        setScores(prev => ({
            ...prev,
            [type]: Math.max(0, Math.min(100, prev[type] + delta))
        }));
    };

    const addMistake = (type: Mistake['type'], severity: Mistake['severity'], desc: string) => {
        setMistakes(prev => [...prev, { type, severity, description: desc }]);
        const deduction = severity === 'major' ? -5 : -2;
        handleAdjustScore(type, deduction);
        toast.info(`${type.toUpperCase()} mistake added: ${desc}`);
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            // 1. Save grading results
            const { data: grading, error: gradingError } = await supabase
                .from('exam_grading')
                .insert({
                    exam_id: examId,
                    tajweed_score: scores.tajweed,
                    fluency_score: scores.fluency,
                    memorization_score: scores.memorization,
                    total_score: totalScore,
                    is_passed: isPassed,
                    examiner_feedback: feedback,
                    mistakes_json: mistakes as unknown as Json,
                    completed_at: new Date().toISOString()
                })
                .select()
                .single();

            if (gradingError) throw gradingError;

            // 2. Update exam status
            const { error: examError } = await supabase
                .from('exams')
                .update({ status: 'completed' })
                .eq('id', examId);

            if (examError) throw examError;

            // 3. Issue certificate if passed
            if (isPassed) {
                // Generate a random verification code without nanoid
                const verificationCode = `CERT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

                const { error: certError } = await supabase
                    .from('certificates')
                    .insert({
                        student_id: studentId,
                        exam_id: examId,
                        grading_id: grading.id,
                        certificate_type: 'surah',
                        title: `Certificate of Achievement: ${surahName}`,
                        verification_code: verificationCode,
                        metadata: {
                            student_name: studentName,
                            surah_name: surahName,
                            score: totalScore,
                            scores: scores,
                            examiner_remarks: feedback
                        }
                    });

                if (certError) throw certError;
                toast.success('Exam graded! Certificate has been issued.');
            } else {
                toast.success('Exam graded successfully.');
            }
        } catch (error: unknown) {
            console.error('Grading error:', error);
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(message || 'Failed to save grading results.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-xl bg-gradient-to-br from-card to-muted/20 overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black">Examination Pad</CardTitle>
                                <CardDescription>Studying {surahName} with {studentName}</CardDescription>
                            </div>
                            <Badge variant={isPassed ? "default" : "destructive"} className="text-lg px-4 py-1 rounded-full">
                                {isPassed ? "Passing" : "Below Target"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {/* Score Sliders/Controls */}
                        <div className="grid gap-8">
                            {[
                                { label: 'Tajweed Mastery', key: 'tajweed' as const, color: 'text-blue-500' },
                                { label: 'Fluency & Flow', key: 'fluency' as const, color: 'text-green-500' },
                                { label: 'Memorization Retension', key: 'memorization' as const, color: 'text-purple-500' },
                            ].map((item) => (
                                <div key={item.key} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-2 w-2 rounded-full", item.color === 'text-blue-500' ? "bg-blue-500" : item.color === 'text-green-500' ? "bg-green-500" : "bg-purple-500")} />
                                            <Label className="text-lg font-bold">{item.label}</Label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" size="icon" onClick={() => handleAdjustScore(item.key, -5)} className="rounded-full"><MinusCircle className="h-4 w-4" /></Button>
                                            <span className="text-2xl font-black tabular-nums min-w-[3ch] text-center">{scores[item.key]}%</span>
                                            <Button variant="outline" size="icon" onClick={() => handleAdjustScore(item.key, 5)} className="rounded-full"><PlusCircle className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <Progress value={scores[item.key]} className="h-3" />

                                    {/* Quick Action Mistake Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] uppercase font-bold border border-border" onClick={() => addMistake(item.key, 'minor', 'Minor mistake')}>-2 Minor</Button>
                                        <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] uppercase font-bold border border-destructive/20 text-destructive" onClick={() => addMistake(item.key, 'major', 'Major mistake')}>-5 Major</Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Label className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Tajweed Rule Checklist
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { label: 'Ghunnah', key: 'ghunnah' },
                                    { label: 'Qalqalah', key: 'qalqalah' },
                                    { label: 'Madd Rules', key: 'madd' },
                                    { label: 'Noon Sakinah', key: 'noon_sakinah' },
                                    { label: 'Meem Sakinah', key: 'meem_sakinah' },
                                    { label: 'Articulation (Makhraj)', key: 'makhraj' },
                                ].map((rule) => (
                                    <Button
                                        key={rule.key}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "justify-start h-10 rounded-xl font-medium",
                                            mistakes.some(m => m.description.includes(rule.label)) ? "border-destructive text-destructive bg-destructive/5" : "hover:border-primary"
                                        )}
                                        onClick={() => addMistake('tajweed', 'minor', `Check ${rule.label}`)}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        {rule.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-bold flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    Examiner's Final Remarks
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary font-bold gap-2 hover:bg-primary/5"
                                    onClick={() => {
                                        const summary = mistakes.length > 0
                                            ? `Mashallah on completing ${surahName}! Focus on ${mistakes.map(m => m.description).join(', ')} to achieve mastery.`
                                            : `Exceptional recitation of ${surahName}! Your tajweed and fluency are exemplary. Barakatullah!`;
                                        setFeedback(summary);
                                        toast.success("AI Feedback Drafted!");
                                    }}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    AI Assist
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Provide detailed feedback for the student and teacher..."
                                className="min-h-[120px] rounded-2xl border-2 focus-visible:ring-primary shadow-inner bg-muted/10"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t p-6">
                        <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" onClick={handleFinish} disabled={isSubmitting}>
                            {isSubmitting ? "Finalizing Report..." : "Complete & Issue Certificate"}
                            <CheckCircle2 className="ml-2 h-6 w-6" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Results Overview */}
                <Card className="border-none shadow-lg bg-primary text-primary-foreground overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-6 w-6" />
                            Real-time Result
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                        <div className="text-7xl font-black mb-2">{totalScore}</div>
                        <p className="font-bold uppercase tracking-widest opacity-80">Aggregate Score</p>
                    </CardContent>
                </Card>

                {/* Mistake Log */}
                <Card className="border-none shadow-lg h-full max-h-[500px] overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            Mistake Log ({mistakes.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/10">
                        {mistakes.length === 0 ? (
                            <div className="text-center py-10 opacity-30 italic font-medium">No mistakes recorded yet. Perfections!</div>
                        ) : (
                            mistakes.map((m, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 animate-in slide-in-from-right-2 fade-in duration-300">
                                    <AlertCircle className={cn("h-5 w-5 shrink-0 mt-0.5", m.severity === 'major' ? "text-destructive" : "text-yellow-500")} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold leading-none capitalize">{m.type}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                                        <Badge variant="outline" className="text-[10px] h-4 py-0 font-black uppercase">{m.severity}</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

