import { useMemo } from 'react';
import { quranData } from '@/constants/quranData';

export interface RevisionItem {
    surahId: number;
    surahName: string;
    surahTransliteration: string;
    type: 'sabqi' | 'sabq_para' | 'manzil';
    priority: number; // Lower = higher priority
    memoryStrength: number; // 0-100
    lastReviewedAt?: string;
    daysOverdue: number;
}

interface MasteryRecord {
    surahId: number;
    lastExamDate: string | null;
    errorCount: number;
    passed: boolean;
}

/**
 * Spaced Repetition System (SRS) for Quran Memorization.
 * Calculates memory strength decay and generates a ranked revision list.
 */
export const useRevisionAgenda = (
    masteryRecords: MasteryRecord[] = [],
    currentSurahId: number = 1,
    currentJuz: number = 30
) => {
    // Constants for SRS decay
    const DECAY_RATE = 0.1; // Memory decays by ~10% per day without review
    const ERROR_PENALTY = 5; // Each error reduces initial strength

    const revisionItems = useMemo(() => {
        const today = new Date();
        const items: RevisionItem[] = [];

        masteryRecords.forEach(record => {
            if (!record.passed) return; // Only schedule passed surahs for revision

            const surah = quranData.find(s => s.id === record.surahId);
            if (!surah) return;

            const lastReviewDate = record.lastExamDate ? new Date(record.lastExamDate) : new Date();
            const daysSinceReview = Math.floor((today.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate memory strength using exponential decay
            // Starts at 100, minus error penalties, then decays over time
            const baseStrength = Math.max(0, 100 - (record.errorCount * ERROR_PENALTY));
            const memoryStrength = Math.max(0, Math.round(baseStrength * Math.exp(-DECAY_RATE * daysSinceReview)));

            // Determine revision type based on surah's current juz and recency
            let type: RevisionItem['type'] = 'manzil';
            if (surah.id === currentSurahId) {
                type = 'sabqi'; // Today's new lesson
            } else if (Array.isArray(surah.juz) ? surah.juz.includes(currentJuz) : surah.juz === currentJuz) {
                type = 'sabq_para'; // Same juz as current lesson
            }


            // Priority: Lower strength = higher priority (lower number)
            const priority = memoryStrength;
            const daysOverdue = daysSinceReview > 7 ? daysSinceReview - 7 : 0;

            items.push({
                surahId: surah.id,
                surahName: surah.name,
                surahTransliteration: surah.transliteration,
                type,
                priority,
                memoryStrength,
                lastReviewedAt: record.lastExamDate || undefined,
                daysOverdue
            });
        });

        // Sort by priority (ascending, so lowest memory strength comes first)
        return items.sort((a, b) => a.priority - b.priority);
    }, [masteryRecords, currentSurahId, currentJuz]);

    // Group items by type
    const sabqi = useMemo(() => revisionItems.filter(i => i.type === 'sabqi').slice(0, 1), [revisionItems]);
    const sabqPara = useMemo(() => revisionItems.filter(i => i.type === 'sabq_para').slice(0, 5), [revisionItems]);
    const manzil = useMemo(() => revisionItems.filter(i => i.type === 'manzil').slice(0, 7), [revisionItems]);

    // Calculate overall revision health
    const overdueCount = revisionItems.filter(i => i.daysOverdue > 0).length;
    const averageStrength = revisionItems.length > 0
        ? Math.round(revisionItems.reduce((acc, i) => acc + i.memoryStrength, 0) / revisionItems.length)
        : 100;

    return {
        sabqi,
        sabqPara,
        manzil,
        allItems: revisionItems,
        overdueCount,
        averageStrength
    };
};
