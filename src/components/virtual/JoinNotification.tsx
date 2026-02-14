import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';

interface JoinNotificationProps {
    name: string;
    role: string;
}

export function JoinNotification({ name, role }: JoinNotificationProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3500);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
            <div className="flex items-center gap-3 px-4 py-3 bg-card border rounded-xl shadow-raised">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm font-medium">{name} joined</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
            </div>
        </div>
    );
}
