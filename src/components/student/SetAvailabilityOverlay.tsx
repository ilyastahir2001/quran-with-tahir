import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Loader2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SetAvailabilityOverlayProps {
    studentId: string;
    onComplete: () => void;
    onClose: () => void;
}

const DAYS = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
];

const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 8; // Start at 8 AM
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
});

export function SetAvailabilityOverlay({ studentId, onComplete, onClose }: SetAvailabilityOverlayProps) {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
    const [loading, setLoading] = useState(false);

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleSave = async () => {
        if (selectedDays.length === 0) {
            toast.error('Please select at least one day.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('students')
                .update({
                    schedule_days: selectedDays,
                    schedule_time: selectedTime
                })
                .eq('id', studentId);

            if (error) throw error;

            toast.success('Your availability has been saved! The Academy will match you shortly.');
            onComplete();
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error('Failed to save availability. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in zoom-in duration-300">
            <Card className="max-w-xl w-full shadow-2xl border-primary/20 relative overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardHeader className="text-center pb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 text-primary">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Set Your Learning Hours</CardTitle>
                    <CardDescription className="text-base">
                        Choose the days and time you'd like to have your classes.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {/* Days Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            Available Days
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {DAYS.map((day) => (
                                <div
                                    key={day.value}
                                    onClick={() => toggleDay(day.value)}
                                    className={cn(
                                        "flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                        selectedDays.includes(day.value)
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border hover:border-border/80 bg-background/50"
                                    )}
                                >
                                    <Checkbox
                                        checked={selectedDays.includes(day.value)}
                                        onCheckedChange={() => toggleDay(day.value)}
                                        className="rounded-full h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <span className={cn(
                                        "text-xs font-bold",
                                        selectedDays.includes(day.value) ? "text-primary" : "text-slate-600"
                                    )}>
                                        {day.label.slice(0, 3)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            Preferred Start Time
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {TIME_SLOTS.map((time) => (
                                <div
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                        "text-[10px] font-black py-2.5 px-1 rounded-lg border-2 text-center cursor-pointer transition-all duration-200",
                                        selectedTime === time
                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "border-border bg-background hover:bg-muted/50 text-slate-500"
                                    )}
                                >
                                    {time}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full h-12 rounded-full font-black text-lg shadow-xl shadow-primary/20 group"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Save Availability
                                </>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                            * Note: Our Academy experts will use this schedule to assign a teacher that matches your availability.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
