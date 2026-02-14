import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    ChevronRight,
    ChevronLeft,
    Maximize2,
    Minimize2,
    Highlighter,
    Settings,
    Search,
    Volume2,
    Pause
} from 'lucide-react';
import { quranData, Surah } from '@/constants/quranData';
import quranFullData from '@/constants/quran-full.json';
import { cn } from '@/lib/utils';

interface VerseData {
    id: number;
    text: string;
    number: number;
    translation?: string;
    transliteration?: string;
}

interface SharedQuranViewerProps {
    isTeacher?: boolean;
    activeSurahId?: number;
    activeVerse?: number;
    scrollOffset?: number;
    onSyncUpdate?: (data: { surahId?: number; verse?: number; scrollOffset?: number; highlightIndex?: number }) => void;
    highlightIndex?: number;
    className?: string;
}

export const SharedQuranViewer = ({
    isTeacher = false,
    activeSurahId = 1,
    activeVerse = 1,
    scrollOffset = 0,
    onSyncUpdate,
    highlightIndex,
    className
}: SharedQuranViewerProps) => {
    const [selectedSurah, setSelectedSurah] = useState<Surah>(quranData.find(s => s.id === activeSurahId) || quranData[0]);
    const [verses, setVerses] = useState<VerseData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [playingVerseId, setPlayingVerseId] = useState<number | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Audio playback handler using al-quran.cloud
    const handlePlayVerse = useCallback((surahId: number, verseNumber: number, verseId: number) => {
        // If already playing this verse, pause it
        if (playingVerseId === verseId && audioRef.current) {
            audioRef.current.pause();
            setPlayingVerseId(null);
            return;
        }

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Construct the audio URL (using Alafasy recitation)
        const paddedSurah = String(surahId).padStart(3, '0');
        const paddedVerse = String(verseNumber).padStart(3, '0');
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${selectedSurah.id > 1 ? (quranData.slice(0, selectedSurah.id - 1).reduce((acc, s) => acc + s.totalAyahs, 0) + verseNumber) : verseNumber}.mp3`;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setPlayingVerseId(verseId);

        audio.play().catch(err => {
            console.error('Audio playback failed:', err);
            setPlayingVerseId(null);
        });

        audio.onended = () => setPlayingVerseId(null);
    }, [playingVerseId, selectedSurah.id]);

    // Fetch verses (Now local and instantaneous)
    useEffect(() => {
        const loadVerses = () => {
            const surahVerses = (quranFullData as Record<string, VerseData[]>)[selectedSurah.id.toString()];
            if (surahVerses) {
                setVerses(surahVerses);
            }
        };

        loadVerses();
    }, [selectedSurah.id]);

    // Update internal state if props change (sync from remote)
    useEffect(() => {
        if (!isTeacher && activeSurahId !== selectedSurah.id) {
            const newSurah = quranData.find(s => s.id === activeSurahId);
            if (newSurah) setSelectedSurah(newSurah);
        }
    }, [activeSurahId, isTeacher, selectedSurah.id]);

    // Handle scroll sync
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!isTeacher || !onSyncUpdate) return;
        const target = e.currentTarget;
        const offset = target.scrollTop / target.scrollHeight;
        onSyncUpdate({ scrollOffset: offset });
    };

    // Apply remote scroll
    useEffect(() => {
        if (!isTeacher && viewportRef.current) {
            const target = viewportRef.current;
            target.scrollTop = scrollOffset * target.scrollHeight;
        }
    }, [scrollOffset, isTeacher]);

    const handleSurahChange = (surahId: number) => {
        const surah = quranData.find(s => s.id === surahId);
        if (surah) {
            setSelectedSurah(surah);
            if (isTeacher && onSyncUpdate) {
                onSyncUpdate({ surahId: surah.id, verse: 1, scrollOffset: 0 });
            }
        }
    };

    return (
        <Card className={cn(
            "flex flex-col border-none shadow-xl overflow-hidden bg-card transition-all duration-300",
            isFullScreen ? "fixed inset-0 z-50 rounded-none" : "h-full rounded-2xl",
            className
        )}>
            <CardHeader className="bg-primary/5 py-3 px-6 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {selectedSurah.transliteration}
                            <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">
                                {selectedSurah.type}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {selectedSurah.totalAyahs} Ayahs • {selectedSurah.name}
                        </CardDescription>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Surah Selector (Teacher Only Control or Shared View) */}
                    <div className="flex items-center gap-1 bg-background border rounded-lg px-2 py-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            disabled={selectedSurah.id <= 1}
                            onClick={() => handleSurahChange(selectedSurah.id - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-bold px-2 min-w-[80px] text-center">
                            Surah {selectedSurah.id}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            disabled={selectedSurah.id >= 114}
                            onClick={() => handleSurahChange(selectedSurah.id + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Fetching Holy Verses...</p>
                    </div>
                )}

                <ScrollArea
                    className="h-full w-full bg-[#fdfcf9]"
                    onScroll={handleScroll}
                    ref={scrollAreaRef}
                >
                    <div className="max-w-4xl mx-auto py-12 px-8 flex flex-col gap-10">
                        {/* Bismillah (if not Surah At-Tawbah) */}
                        {selectedSurah.id !== 9 && (
                            <div className="text-center py-6">
                                <h3 className="text-4xl font-arabic text-primary leading-loose tracking-widest opacity-80">
                                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                </h3>
                            </div>
                        )}

                        <div className="flex flex-col gap-10">
                            {verses.map((verse) => {
                                const isSelected = activeVerse === verse.number;
                                const isPlaying = playingVerseId === verse.id;
                                return (
                                    <div
                                        key={verse.id}
                                        className={cn(
                                            "group relative p-6 rounded-2xl transition-all cursor-pointer border-2",
                                            isPlaying ? "bg-primary/10 border-primary shadow-lg ring-2 ring-primary/30" :
                                                isSelected ? "bg-primary/5 border-primary/20 shadow-sm" : "border-transparent hover:bg-muted/30"
                                        )}
                                        id={`verse-${verse.number}`}
                                        onClick={() => isTeacher && onSyncUpdate?.({ verse: verse.number })}
                                    >
                                        {/* Audio Play Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "absolute right-4 top-4 h-10 w-10 rounded-full transition-all z-10",
                                                isPlaying ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted/50 hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayVerse(selectedSurah.id, verse.number, verse.id);
                                            }}
                                            title={isPlaying ? "Pause recitation" : "Play recitation"}
                                        >
                                            {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                        </Button>

                                        <div className="flex flex-col gap-3">
                                            <p
                                                className={cn(
                                                    "text-right font-quran text-3xl leading-[2.5] tracking-wide pr-14",
                                                    isPlaying ? "text-primary" : isSelected ? "text-primary" : "text-foreground"
                                                )}
                                            >
                                                {verse.text}
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 text-xs mr-4 align-middle text-primary/60">
                                                    {verse.number}
                                                </span>
                                            </p>

                                            {verse.transliteration && (
                                                <p className="text-sm text-muted-foreground italic font-medium leading-relaxed">
                                                    {verse.transliteration}
                                                </p>
                                            )}

                                            {verse.translation && (
                                                <p className="text-sm text-foreground/80 leading-relaxed font-outfit max-w-3xl">
                                                    {verse.translation}
                                                </p>
                                            )}
                                        </div>

                                        {isTeacher && (
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-background shadow-md border border-border">

                                                    <Highlighter className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-background shadow-md border border-border">
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>

                {/* Control Overlay for Teacher */}
                {isTeacher && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/90 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl px-6 py-3 transition-transform hover:scale-105">
                        <Badge className="bg-primary text-primary-foreground font-black px-3 py-1 mr-2">TEACHER MODE</Badge>
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sync Active</span>
                            </div>
                            <Button size="sm" variant="outline" className="rounded-xl font-bold h-8 text-xs border-primary/20 text-primary">
                                <Search className="h-3 w-3 mr-2" />
                                Jump to Verse
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Status Footer */}
            <div className="bg-muted/30 px-6 py-2 border-t flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span>Active Session: #CS-9921</span>
                    <span>•</span>
                    <span>Participants: 2</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Secure Real-time Data Tunnel
                </div>
            </div>
        </Card>
    );
};
