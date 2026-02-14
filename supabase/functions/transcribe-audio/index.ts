import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscriptionRequest {
    audio_base64: string;
    surah_id: number;
    student_id: string;
    expected_text?: string;
}

interface TranscriptionResult {
    transcription: string;
    accuracy_score: number;
    feedback: string;
    tajweed_notes: string[];
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not configured. Please add it to your Supabase secrets.');
        }

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Supabase configuration is missing');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { audio_base64, surah_id, student_id, expected_text }: TranscriptionRequest = await req.json();

        if (!audio_base64 || !student_id) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: audio_base64, student_id' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Convert base64 to binary for Whisper API
        const binaryString = atob(audio_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create form data for Whisper API
        const formData = new FormData();
        formData.append('file', new Blob([bytes], { type: 'audio/webm' }), 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'ar'); // Force Arabic language detection
        formData.append('response_format', 'json');

        // Call OpenAI Whisper API
        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });

        if (!whisperResponse.ok) {
            const errorData = await whisperResponse.text();
            console.error('OpenAI Whisper API error:', errorData);
            throw new Error(`Whisper API failed: ${whisperResponse.status}`);
        }

        const whisperResult = await whisperResponse.json();
        const transcription = whisperResult.text || '';

        // Calculate accuracy if expected text is provided
        let accuracy_score = 0;
        let feedback = '';
        const tajweed_notes: string[] = [];

        if (expected_text && transcription) {
            // Simple word-level comparison for scoring
            const expectedWords = expected_text.split(/\s+/).filter(w => w.length > 0);
            const transcribedWords = transcription.split(/\s+/).filter((w: string) => w.length > 0);

            let matchingWords = 0;
            for (const word of transcribedWords) {
                if (expectedWords.includes(word)) {
                    matchingWords++;
                }
            }

            accuracy_score = expectedWords.length > 0
                ? Math.round((matchingWords / expectedWords.length) * 100)
                : 0;

            // Generate feedback based on score
            if (accuracy_score >= 90) {
                feedback = 'Excellent recitation! Your pronunciation is clear and accurate. MashAllah!';
                tajweed_notes.push('Great articulation of Arabic letters.');
            } else if (accuracy_score >= 70) {
                feedback = 'Good effort! Focus on maintaining consistent pace and clarity.';
                tajweed_notes.push('Consider reviewing Madd (elongation) rules.');
            } else if (accuracy_score >= 50) {
                feedback = 'Keep practicing! Pay attention to the pronunciation of letters like ع, ق, and ح.';
                tajweed_notes.push('Review the Makharij (articulation points).');
                tajweed_notes.push('Practice with slower recitation first.');
            } else {
                feedback = 'Let\'s review this Surah together. Practice listening to a Qari first.';
                tajweed_notes.push('Start with shorter verses.');
                tajweed_notes.push('Listen and repeat technique recommended.');
            }
        } else {
            // No expected text, just return transcription
            accuracy_score = 75; // Default score
            feedback = 'Transcription complete. For accuracy scoring, please select a Surah to practice.';
        }

        const result: TranscriptionResult = {
            transcription,
            accuracy_score,
            feedback,
            tajweed_notes,
        };

        // Save the session to database
        const { error: insertError } = await supabase.from('ai_sessions').insert({
            student_id,
            surah_id,
            accuracy_score,
            feedback_data: {
                transcription,
                feedback,
                tajweed_notes,
            },
        });

        if (insertError) {
            console.error('Failed to save AI session:', insertError);
            // Don't throw - we still want to return the result
        }

        return new Response(
            JSON.stringify(result),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Error in transcribe-audio:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
