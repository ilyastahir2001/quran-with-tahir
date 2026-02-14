import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateRoomRequest {
  class_id: string;
  teacher_id: string;
  student_id: string;
  duration_minutes?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
    if (!DAILY_API_KEY) {
      throw new Error('DAILY_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { class_id, teacher_id, student_id, duration_minutes = 30 }: CreateRoomRequest = await req.json();

    if (!class_id || !teacher_id || !student_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: class_id, teacher_id, student_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Daily.co room
    const roomName = `class-${class_id}-${Date.now()}`;
    const expiryTime = Math.floor(Date.now() / 1000) + (duration_minutes + 30) * 60; // duration + 30 min buffer

    const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: expiryTime,
          max_participants: 2,
          enable_chat: true,
          enable_prejoin_ui: false,
          start_video_off: false,
          start_audio_off: false,
          enable_knocking: false,
          enable_screenshare: true,
        },
      }),
    });

    if (!dailyResponse.ok) {
      const errorData = await dailyResponse.text();
      console.error('Daily.co API error:', errorData);
      throw new Error(`Failed to create Daily.co room: ${dailyResponse.status}`);
    }

    const roomData = await dailyResponse.json();
    const roomUrl = roomData.url;
    const roomId = roomData.name;

    // Update the class record with room info
    const { error: updateError } = await supabase
      .from('classes')
      .update({
        call_room_id: roomId,
        call_room_url: roomUrl,
        status: 'in_progress',
        actual_start_time: new Date().toISOString(),
      })
      .eq('id', class_id);

    if (updateError) {
      console.error('Failed to update class:', updateError);
      throw new Error('Failed to update class with room info');
    }

    // Log the call initiation
    await supabase.from('call_logs').insert({
      class_id,
      user_id: teacher_id, // Teacher is the initiator
      event_type: 'initiated',
      metadata: {
        teacher_id,
        student_id,
        room_id: roomId,
        room_url: roomUrl,
        duration_minutes
      },
    });

    // Create notification for student
    const { data: studentData } = await supabase
      .from('students')
      .select('user_id, full_name')
      .eq('id', student_id)
      .single();

    if (studentData?.user_id) {
      await supabase.from('notifications').insert({
        user_id: studentData.user_id,
        type: 'class_reminder',
        title: 'Incoming Call',
        message: 'Your teacher is calling you for your class session.',
        payload: { class_id, room_url: roomUrl, room_id: roomId },
      });
    }

    return new Response(
      JSON.stringify({
        room_url: roomUrl,
        room_id: roomId,
        expires_at: new Date(expiryTime * 1000).toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error creating Daily room:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
