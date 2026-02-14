// create-session — Teacher starts a live class session
//
// Creates a LiveKit room, generates a token, and inserts a class_sessions row.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';
import { generateToken, createRoom, getLiveKitUrl } from '../_shared/livekit.ts';

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const user = await getUser(authHeader);
    const { class_id } = await req.json();

    if (!class_id) {
      return new Response(JSON.stringify({ error: 'class_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = getSupabaseAdmin();

    // Verify this user is a teacher for this class
    const { data: classData, error: classErr } = await admin
      .from('classes')
      .select('id, teacher_id')
      .eq('id', class_id)
      .single();

    if (classErr || !classData) {
      return new Response(JSON.stringify({ error: 'Class not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check teacher ownership via teachers table
    const { data: teacherData } = await admin
      .from('teachers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherData || teacherData.id !== classData.teacher_id) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const roomName = `class-${class_id}-${Date.now()}`;

    // Create LiveKit room
    await createRoom(roomName);

    // Generate token for teacher
    const token = await generateToken(user.id, roomName, JSON.stringify({ role: 'teacher' }));

    // Insert session
    const { data: session, error: sessionErr } = await admin
      .from('class_sessions')
      .insert({
        class_id,
        status: 'live',
        livekit_room_name: roomName,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionErr) throw sessionErr;

    // Insert participant
    await admin.from('session_participants').insert({
      session_id: session.id,
      user_id: user.id,
      role: 'teacher',
      joined_at: new Date().toISOString(),
    });

    // Update class status
    await admin
      .from('classes')
      .update({ status: 'in_progress', actual_start_time: new Date().toISOString() })
      .eq('id', class_id);

    // Log event
    await admin.from('session_logs').insert({
      session_id: session.id,
      event: 'session_created',
      metadata: { teacher_id: user.id, room_name: roomName },
    });

    return new Response(
      JSON.stringify({
        session_id: session.id,
        livekit_token: token,
        livekit_url: getLiveKitUrl(),
        room_name: roomName,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
