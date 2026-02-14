import { useMemo } from 'react';

export interface Rank {
    name: string;
    minXp: number;
    color: string;
    icon: string;
}

const RANKS: Rank[] = [
    { name: 'Seeker of Light', minXp: 0, color: 'text-slate-400', icon: '✨' },
    { name: 'Novice Reciter', minXp: 500, color: 'text-blue-400', icon: '📖' },
    { name: 'Juz Explorer', minXp: 2000, color: 'text-green-400', icon: '🗺️' },
    { name: 'Guardian of Prayer', minXp: 5000, color: 'text-purple-400', icon: '🛡️' },
    { name: 'Eloquent Master', minXp: 10000, color: 'text-amber-400', icon: '💎' },
    { name: 'Hafiz Candidate', minXp: 25000, color: 'text-rose-400', icon: '👑' },
];

export const useGamification = (xp: number = 0) => {
    const currentRank = useMemo(() => {
        return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
    }, [xp]);

    const nextRank = useMemo(() => {
        const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);
        return RANKS[currentIndex + 1] || null;
    }, [currentRank]);

    const progressToNext = useMemo(() => {
        if (!nextRank) return 100;
        const range = nextRank.minXp - currentRank.minXp;
        const currentProgress = xp - currentRank.minXp;
        return Math.min(100, Math.max(0, (currentProgress / range) * 100));
    }, [xp, currentRank, nextRank]);

    const level = Math.floor(Math.sqrt(xp / 100)) + 1;

    return {
        level,
        currentRank,
        nextRank,
        progressToNext,
        xp
    };
};
