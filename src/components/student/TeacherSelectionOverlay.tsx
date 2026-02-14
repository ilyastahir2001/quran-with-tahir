import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TeacherSelectionOverlayProps {
    studentId: string;
    onSelectionComplete: () => void;
}

export function TeacherSelectionOverlay({ studentId, onSelectionComplete }: TeacherSelectionOverlayProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleSelection = async (mode: 'academy' | 'self') => {
        setLoading(mode);
        try {
            const { error } = await supabase
                .from('students')
                .update({ teacher_selection_mode: mode })
                .eq('id', studentId);

            if (error) throw error;

            toast.success(
                mode === 'academy'
                    ? 'Great! The Academy will assign your teacher shortly.'
                    : 'Happy searching! Explore our certified teachers.'
            );

            onSelectionComplete();
        } catch (error) {
            console.error('Error updating selection mode:', error);
            toast.error('Failed to save your choice. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10 space-y-4">
                    <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[10px] font-bold">
                        Onboarding Phase
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent leading-tight">
                        How would you like to find <br /> your <span className="text-primary">Perfect Teacher?</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Your Quranic journey is unique. Choose the method that best fits your learning style.
                        <span className="block mt-1 font-medium text-amber-500 text-sm italic"> (Reversable after your initial contract ends)</span>
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Option 1: Academy Assign */}
                    <Card className="relative overflow-hidden group border-2 border-transparent hover:border-primary/50 transition-all duration-500 shadow-2xl hover:shadow-primary/20 bg-card/50 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="h-20 w-20 text-primary animate-pulse" />
                        </div>

                        <CardHeader className="relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black">Academy Assign</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                Let our experts analyze your profile and assign the most suitable certified teacher for your level and goals.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-6">
                            <ul className="space-y-3">
                                {[
                                    'Profile-based matching',
                                    'Expert quality assurance',
                                    'Faster onboarding',
                                    'Worry-free replacement'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleSelection('academy')}
                                disabled={!!loading}
                                className="w-full rounded-full h-12 text-lg font-bold shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform"
                            >
                                {loading === 'academy' ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Choose Academy matching
                                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Option 2: Self Find */}
                    <Card className="relative overflow-hidden group border-2 border-transparent hover:border-blue-500/50 transition-all duration-500 shadow-2xl hover:shadow-blue-500/10 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <Search className="h-8 w-8 text-blue-500" />
                            </div>
                            <CardTitle className="text-2xl font-black">Self Find</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                Browse our directory of 50+ certified teachers. Watch bios, check specializations, and request a connection yourself.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-6">
                            <ul className="space-y-3">
                                {[
                                    'Full directory access',
                                    'Watch teacher video intros',
                                    'Check personal schedules',
                                    'Direct connection requests'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                onClick={() => handleSelection('self')}
                                disabled={!!loading}
                                className="w-full rounded-full h-12 text-lg font-bold border-blue-500/20 hover:bg-blue-500/10 group-hover:scale-[1.02] transition-transform"
                            >
                                {loading === 'self' ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                ) : (
                                    <>
                                        Browse Teachers
                                        <ArrowRight className="h-5 w-5 ml-2 text-blue-500 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper component for Badge if it's not imported globally
function Badge({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) {
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
            {children}
        </div>
    );
}

// Utility to merge classes
function cn(...inputs: (string | boolean | undefined | null)[]) {
    return inputs.filter(Boolean).join(' ');
}
