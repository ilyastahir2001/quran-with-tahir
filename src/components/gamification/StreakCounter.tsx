import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
    streak: number;
    className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak, className }) => {
    const isHot = streak >= 3;
    const isBlazing = streak >= 7;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 backdrop-blur-md shadow-sm transition-all duration-500",
                isBlazing ? "border-orange-500 shadow-orange-500/20 bg-orange-500/5 text-orange-600" :
                    isHot ? "border-yellow-500 shadow-yellow-500/20 bg-yellow-500/5 text-yellow-600" :
                        "border-border text-muted-foreground",
                className
            )}
        >
            <div className="relative">
                <Flame className={cn(
                    "h-5 w-5 fill-current transition-transform duration-500",
                    isHot && "animate-pulse scale-110",
                    isBlazing && "animate-bounce scale-125"
                )} />
                {isBlazing && (
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-orange-400 rounded-full blur-md -z-10"
                    />
                )}
            </div>
            <span className="font-black text-lg tracking-tight">
                {streak} <span className="text-sm font-bold uppercase tracking-widest">{streak === 1 ? 'Day' : 'Days'}</span>
            </span>
        </motion.div>
    );
};
