import { useEffect, useRef } from 'react';
import { useTodayClasses } from './useStudentClasses';
import { toast } from 'sonner';
import { differenceInMinutes, parseISO, isSameDay } from 'date-fns';

export function useClassReminders() {
    const { data: classes } = useTodayClasses();
    const notifiedClasses = useRef<Set<string>>(new Set());
    const prevStatuses = useRef<Record<string, string>>({});

    useEffect(() => {
        if (!classes) return;

        const checkReminders = () => {
            classes.forEach((cls) => {
                // 1. Status Change Notification (Teacher started class)
                const prevStatus = prevStatuses.current[cls.id];
                if (prevStatus === 'scheduled' && cls.status === 'in_progress') {
                    toast.success(`Teacher ${cls.teacher?.full_name || ''} has started the class!`, {
                        action: {
                            label: 'Join Now',
                            onClick: () => window.location.href = `/virtual-class/${cls.id}?autoJoin=true`
                        },
                        duration: 10000,
                    });
                }
                prevStatuses.current[cls.id] = cls.status;

                // 2. Time-based Reminder (15 minutes before)
                if (cls.status !== 'scheduled') return;

                const classDate = parseISO(cls.scheduled_date);
                if (!isSameDay(classDate, new Date())) return;

                const [hours, minutes] = cls.start_time.split(':').map(Number);
                const classTime = new Date();
                classTime.setHours(hours, minutes, 0, 0);

                const diff = differenceInMinutes(classTime, new Date());

                // Notify if exactly 15 minutes or less (but not already started)
                // We use a range to avoid spamming: 10-15 minutes window
                if (diff <= 15 && diff > 0 && !notifiedClasses.current.has(cls.id)) {
                    toast.info(`Class with ${cls.teacher?.full_name || 'Teacher'} starts in ${diff} minutes!`, {
                        action: {
                            label: 'Join Early',
                            onClick: () => window.location.href = `/virtual-class/${cls.id}`
                        },
                        duration: 5000,
                    });
                    notifiedClasses.current.add(cls.id);
                }
            });
        };

        // Initial check
        checkReminders();

        // Check every minute
        const interval = setInterval(checkReminders, 60000);

        return () => clearInterval(interval);
    }, [classes]);
}
