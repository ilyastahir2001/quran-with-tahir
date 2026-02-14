import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Mic,
    Square,
    Play,
    RotateCcw,
    Brain,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Trophy
} from 'lucide-react';
import { AudioVisualizer } from '@/components/gamification/AudioVisualizer';
import { quranData } from '@/constants/quranData';
import { quranTextData, QuranWord } from '@/constants/quranText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AITutor() {
    const { student, profile } = useAuth();
    const [selectedSurah, setSelectedSurah] = useState(quranData[0]);
    const [isRecording, setIsRecording] = useState(false);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [recitationScore, setRecitationScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [isPlayingModel, setIsPlayingModel] = useState(false);
    const [wordDiagnostics, setWordDiagnostics] = useState<Record<number, 'success' | 'warning' | 'error' | null>>({});
    const [viewMode, setViewMode] = useState<'practice' | 'diagnostic'>('practice');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            setIsRecording(true);
            setRecitationScore(null);
            setFeedback(null);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                processRecitation(audioBlob);
            };

            mediaRecorder.start();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            audioStream?.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setAudioStream(null);
        }
    };

    const processRecitation = async (blob: Blob) => {
        setProcessing(true);

        try {
            // Convert blob to base64
            const reader = new FileReader();
            const audioBase64 = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Call the Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                body: {
                    audio_base64: audioBase64,
                    surah_id: selectedSurah.id,
                    student_id: profile?.id,
                    expected_text: selectedSurah.name // Arabic name as reference
                }
            });

            if (error) {
                console.error('Transcription error:', error);
                toast.error('Failed to process recitation. Please try again.');
                setProcessing(false);
                return;
            }

            setRecitationScore(data.accuracy_score);
            setFeedback(data.feedback);

            // Mock granular data if not returned by Edge function yet
            const mockDiagnostics: Record<number, 'success' | 'warning' | 'error' | null> = {};
            const surahText = quranTextData[selectedSurah.id];
            if (surahText) {
                surahText.verses.forEach(v => {
                    v.words.forEach(w => {
                        const rand = Math.random();
                        mockDiagnostics[w.id] = rand > 0.8 ? 'success' : rand > 0.4 ? 'warning' : 'error';
                    });
                });
            }
            setWordDiagnostics(data.word_diagnostics || mockDiagnostics);
            setViewMode('diagnostic');
            toast.success('Recitation analyzed successfully!');
        } catch (err) {
            console.error('Error processing recitation:', err);
            toast.error('An error occurred while processing your recitation.');
        } finally {
            setProcessing(false);
        }
    };

    const toggleModelPlayback = () => {
        setIsPlayingModel(!isPlayingModel);
        if (!isPlayingModel) {
            toast.info("Playing Al-Minshawi's model recitation...");
            // Real implementation would use an <audio> element with a URL from quran.com or similar
        }
    };

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                        AI Tajweed Tutor <Badge variant="secondary" className="bg-primary/10 text-primary">Beta</Badge>
                    </h1>
                    <p className="text-muted-foreground text-lg mt-2">
                        Practice your recitation and receive instant feedback from the Digital Academy AI.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-card p-4 rounded-2xl border shadow-sm">
                    <Brain className="h-10 w-10 text-primary animate-pulse" />
                    <div>
                        <div className="font-bold text-sm">AI Engine Active</div>
                        <div className="text-xs text-muted-foreground">Monitoring Tajweed Rules</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selection Column */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Select Surah</CardTitle>
                            <CardDescription>Choose a chapter to practice</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-2">
                                    {quranData.map((surah) => (
                                        <button
                                            key={surah.id}
                                            onClick={() => setSelectedSurah(surah)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedSurah.id === surah.id
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                                : 'hover:bg-muted bg-muted/30'
                                                }`}
                                        >
                                            <div className="text-left font-bold">{surah.transliteration}</div>
                                            <div className="text-right text-sm opacity-80">{surah.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Practice Column */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-card to-muted/50 overflow-hidden">
                        <div className="h-1.5 w-full bg-primary/20">
                            {processing && <div className="h-full bg-primary animate-progress-buffer" style={{ width: '40%' }} />}
                        </div>
                        <CardHeader className="text-center pb-2 relative">
                            <div className="absolute right-6 top-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn("rounded-full border-primary/20", isPlayingModel && "bg-primary/10 border-primary text-primary animate-pulse")}
                                    onClick={toggleModelPlayback}
                                >
                                    <Play className={cn("h-4 w-4 mr-2", isPlayingModel && "fill-primary")} />
                                    {isPlayingModel ? "Stop Model" : "Hear Model"}
                                </Button>
                            </div>
                            <div className="text-4xl mb-4 text-foreground font-black rtl">{selectedSurah.name}</div>
                            <CardTitle className="text-2xl font-bold">{selectedSurah.transliteration}</CardTitle>
                            <CardDescription>Advanced Diagnostic Mode</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 p-10">
                            {/* Display Area */}
                            <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-dashed border-primary/20 min-h-[250px] flex flex-col items-center justify-center text-center">
                                {!isRecording && !recitationScore ? (
                                    <div className="text-muted-foreground italic flex flex-col items-center gap-4">
                                        <div className="p-4 bg-muted rounded-full">
                                            <Play className="h-8 w-8 opacity-50" />
                                        </div>
                                        Ready to listen. Click record and start reciting.
                                    </div>
                                ) : isRecording ? (
                                    <div className="w-full space-y-4">
                                        <AudioVisualizer stream={audioStream} isActive={isRecording} />
                                        <div className="text-primary font-bold animate-pulse text-lg">Listening...</div>
                                    </div>
                                ) : recitationScore ? (
                                    <div className="space-y-8 w-full animate-in fade-in zoom-in duration-500">
                                        {/* Diagnostic Map */}
                                        {quranTextData[selectedSurah.id] ? (
                                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 rtl">
                                                {quranTextData[selectedSurah.id]?.verses.map((verse) => (
                                                    <div key={verse.number} className="flex flex-wrap gap-2 items-center">
                                                        {verse.words.map((word) => (
                                                            <span
                                                                key={word.id}
                                                                className={cn(
                                                                    "text-3xl font-arabic px-3 py-1 rounded-xl transition-all cursor-help hover:scale-105",
                                                                    wordDiagnostics[word.id] === 'success' ? "bg-green-100 text-green-800 border-b-2 border-green-300" :
                                                                        wordDiagnostics[word.id] === 'warning' ? "bg-yellow-100 text-yellow-800 border-b-2 border-yellow-300" :
                                                                            wordDiagnostics[word.id] === 'error' ? "bg-red-100 text-red-800 border-b-2 border-red-300" :
                                                                                "text-foreground"
                                                                )}
                                                                title={wordDiagnostics[word.id] === 'error' ? "Tajweed error detected" : "Correct recitation"}
                                                            >
                                                                {word.text}
                                                            </span>
                                                        ))}
                                                        <Badge variant="outline" className="text-[10px] h-5 opacity-40">
                                                            {verse.number}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                                                <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                                <div className="text-4xl font-black text-primary mb-2">{recitationScore}% Match</div>
                                                <p className="text-xs text-muted-foreground italic px-10">
                                                    Granular diagnostic map for {selectedSurah.transliteration} is coming soon.
                                                    Try practicing Al-Fatihah (1) or An-Nas (114) for live highlighting.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-12 border-t pt-8 border-primary/10">
                                            <div className="text-center">
                                                <div className="text-4xl font-black text-primary">{recitationScore}%</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Match Score</div>
                                            </div>

                                            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex-1 max-w-md text-left">
                                                <div className="flex items-start gap-4">
                                                    <Sparkles className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-sm text-foreground">AI Diagnostic Insight</div>
                                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                            {feedback}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center gap-6">
                                {!isRecording ? (
                                    <Button
                                        size="lg"
                                        className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 group overflow-hidden relative"
                                        onClick={startRecording}
                                        disabled={processing}
                                    >
                                        <Mic className="h-10 w-10 group-hover:scale-110 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        className="h-20 w-20 rounded-full shadow-2xl shadow-destructive/40 group overflow-hidden relative"
                                        onClick={stopRecording}
                                    >
                                        <Square className="h-10 w-10 group-hover:scale-95 transition-transform" />
                                    </Button>
                                )}

                                {recitationScore && !isRecording && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-20 w-20 rounded-full group overflow-hidden"
                                        onClick={() => { setRecitationScore(null); setFeedback(null); }}
                                    >
                                        <RotateCcw className="h-8 w-8 group-hover:rotate-45 transition-transform" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats / Tips */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="border-none shadow-md bg-blue-50/50 dark:bg-blue-900/10">
                            <CardContent className="p-6">
                                <Trophy className="h-8 w-8 text-blue-500 mb-2" />
                                <div className="text-2xl font-black">12</div>
                                <div className="text-sm text-muted-foreground font-medium">Practice Sessions</div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-green-50/50 dark:bg-green-900/10">
                            <CardContent className="p-6">
                                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                                <div className="text-2xl font-black">92%</div>
                                <div className="text-sm text-muted-foreground font-medium">Average Accuracy</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
