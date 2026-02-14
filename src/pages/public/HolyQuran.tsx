import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Search,
    Settings,
    ChevronLeft,
    ChevronRight,
    Volume2,
    Pause,
    Maximize2,
    Minimize2,
    Menu,
    X,
    Type,
    Palette,
    ArrowBigDownDash,
    LayoutGrid
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { quranData, Surah, getJuzSurahs } from '@/constants/quranData';
import quranFullData from '@/constants/quran-full.json';
import { QURAN_META } from '@/constants/quranMeta';
import { cn } from '@/lib/utils';

interface WordData {
    id: number;
    position: number;
    text: string;
    translation: string;
    transliteration: string;
}

interface VerseWordData {
    verse_key: string;
    words: WordData[];
}

// --- Types ---
interface VerseData {
    id: number;
    text: string;
    number: number;
    translation?: string;
    transliteration?: string;
}

type Theme = 'light' | 'dark' | 'sepia' | 'midnight';
type Script = 'uthmani' | 'indopak';

// --- Constants ---
const THEMES: Record<Theme, string> = {
    light: 'bg-[#fdfcf9] text-gray-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-[#1a1a1a] text-gray-100',
    midnight: 'bg-[#0a0a0c] text-blue-100'
};

const HolyQuran = () => {
    // --- State ---
    const [selectedSurah, setSelectedSurah] = useState<Surah>(quranData[0]);
    const [verses, setVerses] = useState<VerseData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState<Theme>('sepia');
    const [fontSize, setFontSize] = useState(28);
    const [script, setScript] = useState<Script>('uthmani');
    const [showTransliteration, setShowTransliteration] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [playingVerseId, setPlayingVerseId] = useState<number | null>(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [navTab, setNavTab] = useState<'surah' | 'juz' | 'page'>('surah');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<'verse' | 'mushaf'>('verse');
    const [showWordByWord, setShowWordByWord] = useState(false);
    const [wordByWordData, setWordByWordData] = useState<Record<string, VerseWordData>>({});
    const [isLoadingWords, setIsLoadingWords] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // --- Helpers ---
    const filteredSurahs = useMemo(() => {
        if (!searchQuery) return quranData;
        return quranData.filter(s =>
            s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toString() === searchQuery
        );
    }, [searchQuery]);

    // Load verses when Surah changes
    useEffect(() => {
        const data = (quranFullData as Record<string, VerseData[]>)[selectedSurah.id.toString()];
        if (data) {
            if (viewMode === 'mushaf') {
                const pageStart = QURAN_META.pages[currentPage - 1];
                const pageEnd = QURAN_META.pages[currentPage]; // This would be the start of the next page

                setVerses(data.filter(v => {
                    // Simple condition: if the page only spans one surah
                    // If page spans multiple surahs, we'd need more complex logic
                    // But for now, we filter ayahs of the selectedSurah that belong to currentPage
                    const isSameSurahAsStart = pageStart.surah === selectedSurah.id;
                    const isSameSurahAsEnd = pageEnd ? pageEnd.surah === selectedSurah.id : true;

                    if (isSameSurahAsStart && isSameSurahAsEnd) {
                        return v.number >= pageStart.ayah && (pageEnd ? v.number < pageEnd.ayah : true);
                    }
                    if (isSameSurahAsStart) return v.number >= pageStart.ayah;
                    if (isSameSurahAsEnd && pageEnd) return v.number < pageEnd.ayah;

                    // If the surah is entirely within the page
                    return true;
                }));
            } else {
                setVerses(data);
            }
        }

        // Scroll to top on Surah change
        const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = 0;
    }, [selectedSurah.id, viewMode, currentPage, showWordByWord]);

    // SEO: Set Page Title and Meta Description
    useEffect(() => {
        document.title = "Read Quran Online - Holy Quran with Tahir";
        
        const metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription?.getAttribute('content');
        
        if (metaDescription) {
            metaDescription.setAttribute('content', "Read the Holy Quran online with tajweed, translations, and word-by-word meanings. Quran with Tahir provides an immersive reading experience for students worldwide.");
        }
        
        return () => {
            document.title = "Quran With Tahir";
            if (metaDescription && originalDescription) {
                metaDescription.setAttribute('content', originalDescription);
            }
        };
    }, []);

    // Global search and Jump to Ayah
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Check for Ayah jump pattern (e.g. 2:255)
        const match = query.match(/^(\d+):(\d+)$/);
        if (match) {
            const surahId = parseInt(match[1]);
            const ayahNum = parseInt(match[2]);
            const surah = quranData.find(s => s.id === surahId);
            if (surah && ayahNum <= surah.totalAyahs) {
                setSelectedSurah(surah);
                setIsNavOpen(false);
                setSearchQuery('');
                // Scroll to ayah logic
                setTimeout(() => {
                    const el = document.getElementById(`verse-${surahId}-${ayahNum}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    };

    // Fetch word-by-word data on demand
    useEffect(() => {
        if (!showWordByWord) return;

        const fetchWords = async () => {
            setIsLoadingWords(true);
            try {
                const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${selectedSurah.id}?language=en&words=true&word_fields=translation,transliteration`);
                const data = await response.json();
                const mapped: Record<string, VerseWordData> = {};
                data.verses.forEach((v: { verse_key: string; words: { id: number; position: number; text: string; translation: { text: string }; transliteration: { text: string } }[] }) => {
                    mapped[v.verse_key] = {
                        verse_key: v.verse_key,
                        words: v.words.map((w: { id: number; position: number; text: string; translation: { text: string }; transliteration: { text: string } }) => ({
                            id: w.id,
                            position: w.position,
                            text: w.text,
                            translation: w.translation.text,
                            transliteration: w.transliteration.text
                        }))
                    };
                });
                setWordByWordData(prev => ({ ...prev, ...mapped }));
            } catch (error) {
                console.error("Failed to fetch word-by-word data:", error);
            } finally {
                setIsLoadingWords(false);
            }
        };

        const firstVerseKey = `${selectedSurah.id}:1`;
        if (!wordByWordData[firstVerseKey]) {
            fetchWords();
        }
    }, [selectedSurah.id, showWordByWord, wordByWordData]);

    const handlePlayVerse = (verse: VerseData) => {
        if (playingVerseId === verse.id && audioRef.current) {
            audioRef.current.pause();
            setPlayingVerseId(null);
            return;
        }

        if (audioRef.current) audioRef.current.pause();

        const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verse.id}.mp3`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setPlayingVerseId(verse.id);

        audio.play().catch(() => setPlayingVerseId(null));
        audio.onended = () => setPlayingVerseId(null);
    };

    const jumpToSurah = (id: number) => {
        const surah = quranData.find(s => s.id === id);
        if (surah) {
            setSelectedSurah(surah);
            setIsNavOpen(false);
            setViewMode('verse');
        }
    };

    const jumpToJuz = (juzNum: number) => {
        const juzStart = QURAN_META.juzs[juzNum - 1];
        const surah = quranData.find(s => s.id === juzStart.surah);
        if (surah) {
            setSelectedSurah(surah);
            setIsNavOpen(false);
            setViewMode('verse');
            // Logic to scroll to the specific ayah
        }
    };

    const jumpToPage = (pageNum: number) => {
        const pageStart = QURAN_META.pages[pageNum - 1];
        const surah = quranData.find(s => s.id === pageStart.surah);
        if (surah) {
            setSelectedSurah(surah);
            setCurrentPage(pageNum);
            setViewMode('mushaf');
            setIsNavOpen(false);
        }
    };

    // --- Render ---
    return (
        <div className={cn(
            "min-h-screen flex flex-col transition-colors duration-500 font-outfit",
            THEMES[theme],
            isFullScreen ? "fixed inset-0 z-[100]" : ""
        )}>
            {/* Premium Header - Quran Academy Branding */}
            <header className="sticky top-0 z-40 bg-inherit/80 backdrop-blur-xl border-b border-black/5 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setIsNavOpen(true)} className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-black text-lg leading-none tracking-tight">QURAN <span className="text-primary text-emerald-600">WITH TAHIR</span></h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Quran with Tahir</p>
                            {/* SEO Hidden H1 for ranking */}
                            <h1 className="sr-only">Read Holy Quran Online - Quran With Tahir</h1>
                        </div>
                    </div>
                </div>

                {/* Structured Data for SEO */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Read Quran Online - Quran With Tahir",
                        "description": "Read the Holy Quran online with translations, tajweed, and word-by-word meanings.",
                        "breadcrumb": "Home > Read Quran",
                        "publisher": {
                            "@type": "Organization",
                            "name": "Quran With Tahir"
                        }
                    })}
                </script>

                {/* Omni-Search for Desktop */}
                <div className="hidden md:flex items-center gap-2 max-w-md w-full mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
                        <Input
                            placeholder="Jump to Surah..."
                            className="pl-10 h-10 rounded-full border-black/10 bg-black/5"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                        {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-primary" />
                                    Reader Settings
                                </SheetTitle>
                            </SheetHeader>

                            <div className="py-6 space-y-8">
                                {/* Theme Selection */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Display Theme</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(Object.keys(THEMES) as Theme[]).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTheme(t)}
                                                className={cn(
                                                    "h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-bold uppercase",
                                                    t === 'light' ? 'bg-[#fdfcf9] text-gray-900 border-gray-200' :
                                                        t === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636] border-[#5b4636]/20' :
                                                            t === 'dark' ? 'bg-[#1a1a1a] text-gray-100 border-white/10' :
                                                                'bg-[#0a0a0c] text-blue-100 border-blue-900/40',
                                                    theme === t ? "border-primary ring-2 ring-primary/20 scale-105" : "opacity-60"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Scaling */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Arabic Font Size</h4>
                                        <span className="text-sm font-bold text-primary">{fontSize}px</span>
                                    </div>
                                    <Slider
                                        value={[fontSize]}
                                        min={20}
                                        max={60}
                                        step={2}
                                        onValueChange={(val) => setFontSize(val[0])}
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold">Transliteration</h4>
                                            <p className="text-xs opacity-60">Read in Roman script</p>
                                        </div>
                                        <Button
                                            variant={showTransliteration ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setShowTransliteration(!showTransliteration)}
                                        >
                                            {showTransliteration ? "ON" : "OFF"}
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold">Translation</h4>
                                            <p className="text-xs opacity-60">English (Sahih Intl.)</p>
                                        </div>
                                        <Button
                                            variant={showTranslation ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setShowTranslation(!showTranslation)}
                                        >
                                            {showTranslation ? "ON" : "OFF"}
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-bold">Word by Word</h4>
                                            <p className="text-xs opacity-60">Show individual word meanings</p>
                                        </div>
                                        <Button
                                            variant={showWordByWord ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setShowWordByWord(!showWordByWord)}
                                        >
                                            {showWordByWord ? "ON" : "OFF"}
                                        </Button>
                                    </div>

                                    <div className="pt-4 border-t space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">Reading View</h4>
                                        <Tabs value={viewMode} onValueChange={(val: any) => setViewMode(val)} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 h-10 bg-black/5 rounded-xl">
                                                <TabsTrigger value="verse" className="rounded-lg font-bold text-[10px]">VERSE BY VERSE</TabsTrigger>
                                                <TabsTrigger value="mushaf" className="rounded-lg font-bold text-[10px]">MUSHAF MODE</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Navigation Sidebar (Desktop Only) */}
                <aside className="hidden md:flex w-72 flex-col border-r border-black/5 bg-black/5">
                    <div className="p-4 border-b border-black/5">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Select Surah</h3>
                        <ScrollArea className="h-[calc(100vh-160px)] pr-4">
                            <div className="space-y-1">
                                {filteredSurahs.map((surah) => (
                                    <button
                                        key={surah.id}
                                        onClick={() => setSelectedSurah(surah)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                                            selectedSurah.id === surah.id
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "hover:bg-black/5"
                                        )}
                                    >
                                        <span className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs",
                                            selectedSurah.id === surah.id ? "bg-white/20" : "bg-black/10"
                                        )}>
                                            {surah.id}
                                        </span>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-bold truncate text-sm">{surah.transliteration}</p>
                                            <p className="text-[10px] opacity-60 font-medium">{surah.totalAyahs} Ayahs</p>
                                        </div>
                                        <span className="text-lg font-arabic opacity-50 group-hover:opacity-100">{surah.name}</span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </aside>

                {/* Reading Area */}
                <main className="flex-1 overflow-hidden relative">
                    <ScrollArea ref={scrollAreaRef} className="h-full">
                        <div className="max-w-4xl mx-auto py-12 px-6 lg:px-12 space-y-12">
                            {/* Surah Intro Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6 pb-12 border-b border-black/5"
                            >
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
                                    <LayoutGrid className="h-3 w-3" />
                                    Surah {selectedSurah.id}
                                </div>
                                <h2 className="text-6xl font-arabic text-primary leading-relaxed">{selectedSurah.name}</h2>
                                <div className="flex items-center justify-center gap-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{selectedSurah.transliteration}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">{selectedSurah.type}</p>
                                    </div>
                                    <div className="w-[1px] h-10 bg-black/10" />
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{selectedSurah.totalAyahs}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Ayahs</p>
                                    </div>
                                </div>

                                {selectedSurah.id !== 9 && (
                                    <h3 className="text-4xl font-arabic opacity-80 pt-12">
                                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                    </h3>
                                )}
                            </motion.div>

                            {/* Verses List */}
                            <div className="space-y-16">
                                {verses.map((verse) => (
                                    <motion.div
                                        key={verse.id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        className={cn(
                                            "group relative p-8 rounded-3xl transition-all border-2 border-transparent hover:border-primary/10 hover:bg-black/5",
                                            playingVerseId === verse.id && "bg-primary/5 border-primary/20"
                                        )}
                                    >
                                        {/* Verse Controls */}
                                        <div className="absolute -left-3 top-8 md:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant={playingVerseId === verse.id ? "default" : "secondary"}
                                                className="rounded-full shadow-xl"
                                                onClick={() => handlePlayVerse(verse)}
                                            >
                                                {playingVerseId === verse.id ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                            </Button>
                                        </div>

                                        <div className="flex flex-col gap-8">
                                            {/* Arabic Text */}
                                            <p
                                                dir="rtl"
                                                className="font-quran quran-verse-text"
                                                style={{ '--quran-font-size': `${fontSize}px` } as React.CSSProperties}
                                            >
                                                {showWordByWord ? (
                                                    <div className="flex flex-wrap justify-end gap-x-4 gap-y-8 direction-rtl">
                                                        {wordByWordData[`${selectedSurah.id}:${verse.number}`]?.words.map((word, idx) => (
                                                            <div key={idx} className="group relative flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95">
                                                                <span className="hover:text-primary transition-colors duration-300 font-arabic text-[1.2em]">
                                                                    {word.text}
                                                                </span>
                                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white shadow-xl rounded-lg px-3 py-1 border border-primary/10 z-10 pointer-events-none">
                                                                    <p className="text-[10px] font-black text-primary uppercase tracking-tighter whitespace-nowrap">
                                                                        {word.translation}
                                                                    </p>
                                                                    <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest whitespace-nowrap">
                                                                        {word.transliteration}
                                                                    </p>
                                                                </div>
                                                                {/* Optional: Word level indicator */}
                                                                <div className="w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                                            </div>
                                                        )) || verse.text.split(' ').map((w, i) => <span key={i}>{w}</span>)}
                                                    </div>
                                                ) : (
                                                    verse.text
                                                )}
                                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary/20 text-xs font-bold mr-6 align-middle text-primary/60">
                                                    {verse.number}
                                                </span>
                                            </p>

                                            {/* Info & Metadata */}
                                            <div className="space-y-4">
                                                {showTransliteration && (
                                                    <p className="text-lg italic opacity-70 font-medium leading-relaxed max-w-2xl">
                                                        {verse.transliteration}
                                                    </p>
                                                )}
                                                {showTranslation && (
                                                    <div className="p-6 bg-black/5 rounded-2xl">
                                                        <p className="text-lg leading-relaxed font-bold opacity-90 max-w-3xl">
                                                            {verse.translation}
                                                        </p>
                                                        <p className="text-[10px] uppercase tracking-widest font-black opacity-30 mt-4">Sahih International</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Academic Footer */}
                        <footer className="py-24 px-12 text-center border-t border-black/5 mt-12 bg-black/5">
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                    <BookOpen className="h-8 w-8 text-primary" />
                                </div>
                                <h4 className="text-3xl font-black">Quran With Tahir</h4>
                                <p className="opacity-60 leading-relaxed font-medium">Providing premium digital Quranic education for a modern world. Join our courses today to master Tajweed and Hifz.</p>
                                
                                {/* SEO-Rich Content Section */}
                                <div className="grid md:grid-cols-2 gap-8 pt-12 text-left border-t border-black/5 mt-12">
                                    <div className="space-y-4">
                                        <h5 className="font-black text-primary uppercase tracking-widest text-xs">Read Quran Online</h5>
                                        <p className="text-sm opacity-60 leading-relaxed">
                                            Looking to read the Holy Quran online? Our platform offers a premium, distraction-free reading experience. Master Tajweed, explore translations, and deepen your understanding with our word-by-word meanings.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="font-black text-primary uppercase tracking-widest text-xs">Quran Education</h5>
                                        <p className="text-sm opacity-60 leading-relaxed">
                                            Quran with Tahir is dedicated to providing high-quality Quranic education. Join thousands of students who are learning Quran online with qualified teachers from the comfort of their homes.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-3 pt-12">
                                    <a href="https://www.quranwithtahir.com" target="_blank" rel="noopener noreferrer">
                                        <Button className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 bg-emerald-600 hover:bg-emerald-700">Enroll Now</Button>
                                    </a>
                                    <a href="https://www.quranwithtahir.com/#contact" target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" className="rounded-full px-8 h-12 font-bold bg-transparent border-emerald-600/20 text-emerald-600 hover:bg-emerald-50">Contact Us</Button>
                                    </a>
                                </div>
                            </div>
                        </footer>
                    </ScrollArea>
                </main>
            </div>

            {/* Sticky Mobile Navigation Bar - BEST IN CLASS UX */}
            <footer className="md:hidden sticky bottom-0 z-50 bg-inherit/95 backdrop-blur-2xl border-t border-black/5 p-4 safe-area-bottom">
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        className="flex-1 flex flex-col gap-1 h-auto py-2 rounded-2xl hover:bg-black/10"
                        disabled={selectedSurah.id === 1}
                        onClick={() => jumpToSurah(selectedSurah.id - 1)}
                    >
                        <ChevronLeft className="h-5 w-5 opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Prev</span>
                    </Button>

                    <Button
                        className="flex-[2] h-12 rounded-2xl shadow-xl shadow-primary/20 font-black tracking-widest flex items-center gap-2"
                        onClick={() => setIsNavOpen(true)}
                    >
                        <ArrowBigDownDash className="h-4 w-4" />
                        JUMP TO...
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex-1 flex flex-col gap-1 h-auto py-2 rounded-2xl hover:bg-black/10"
                        disabled={selectedSurah.id === 114}
                        onClick={() => jumpToSurah(selectedSurah.id + 1)}
                    >
                        <ChevronRight className="h-5 w-5 opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Next</span>
                    </Button>
                </div>
            </footer>

            {/* Mobile Navigation Drawer */}
            <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-[40px] p-0 overflow-hidden">
                    <div className="p-8 pb-4">
                        <SheetHeader className="mb-6">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-3xl font-black">Holy Quran</SheetTitle>
                                <Badge variant="secondary" className="font-bold tracking-widest">114 SURAHS</Badge>
                            </div>
                        </SheetHeader>

                        <Tabs value={navTab} onValueChange={(val: any) => setNavTab(val)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-12 bg-black/5 rounded-2xl p-1 mb-6">
                                <TabsTrigger value="surah" className="rounded-xl font-bold">SURAH</TabsTrigger>
                                <TabsTrigger value="juz" className="rounded-xl font-bold">JUZ</TabsTrigger>
                                <TabsTrigger value="page" className="rounded-xl font-bold">PAGE</TabsTrigger>
                            </TabsList>

                            <Input
                                placeholder={`Search ${navTab}... (e.g. 2:255)`}
                                className="h-14 rounded-2xl border-black/10 bg-black/5 px-6 font-bold mb-4"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                            <ScrollArea className="h-[calc(80vh-220px)] pb-12">
                                {navTab === 'surah' && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredSurahs.map((surah) => (
                                            <button
                                                key={surah.id}
                                                onClick={() => jumpToSurah(surah.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-5 rounded-3xl transition-all border-2",
                                                    selectedSurah.id === surah.id
                                                        ? "bg-primary border-primary text-white shadow-2xl shadow-primary/30"
                                                        : "bg-black/5 border-transparent active:scale-95"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                                                        selectedSurah.id === surah.id ? "bg-white/20" : "bg-primary/10 text-primary"
                                                    )}
                                                    >
                                                        {surah.id}
                                                    </span>
                                                    <div className="text-left">
                                                        <p className="font-black text-lg leading-none">{surah.transliteration}</p>
                                                        <p className={cn(
                                                            "text-[10px] uppercase font-bold tracking-widest mt-1",
                                                            selectedSurah.id === surah.id ? "text-white/60" : "text-black/40"
                                                        )}>{surah.type} • {surah.totalAyahs} Ayahs</p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "text-3xl font-arabic",
                                                    selectedSurah.id === surah.id ? "text-white" : "text-primary/40"
                                                )}>{surah.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {navTab === 'juz' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => jumpToJuz(i + 1)}
                                                className="h-24 rounded-3xl bg-black/5 border-2 border-transparent hover:border-primary/20 hover:bg-white flex flex-col items-center justify-center transition-all p-4 text-center"
                                            >
                                                <span className="text-2xl font-black text-primary">JUZ {i + 1}</span>
                                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Starting Verse</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {navTab === 'page' && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {Array.from({ length: 604 }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => jumpToPage(i + 1)}
                                                className={cn(
                                                    "h-16 rounded-2xl flex flex-col items-center justify-center transition-all text-sm font-bold",
                                                    currentPage === i + 1 ? "bg-primary text-white" : "bg-black/5 hover:bg-black/10"
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </Tabs>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default HolyQuran;
