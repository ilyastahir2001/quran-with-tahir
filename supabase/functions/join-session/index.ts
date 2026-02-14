// join-session — Student (or teacher re-join) joins an existing live session

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';
import { generateToken, getLiveKitUrl } from '../_shared/livekit.ts';

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const user = await getUser(authHeader);
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = getSupabaseAdmin();

    // Fetch session
    const { data: session, error: sessionErr } = await admin
      .from('class_sessions')
      .select('*, classes!inner(student_id, teacher_id)')
      .eq('id', session_id)
      .single();

    if (sessionErr || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (session.status !== 'live') {
      return new Response(JSON.stringify({ error: 'Session is not live' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine role
    const classInfo = session.classes as { student_id: string; teacher_id: string };

    // Check via students table
    const { data: studentData } = await admin
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Check via teachers table
    const { data: teacherData } = await admin
      .from('teachers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let role = '';
    if (teacherData && teacherData.id === classInfo.teacher_id) {
      role = 'teacher';
    } else if (studentData && studentData.id === classInfo.student_id) {
      role = 'student';
    } else {
      return new Response(JSON.stringify({ error: 'Not authorized for this session' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate token
    const token = await generateToken(
      user.id,
      session.livekit_room_name,
      JSON.stringify({ role }),
    );

    // Upsert participant
    const { data: existingPart } = await admin
      .from('session_participants')
      .select('id')
      .eq('session_id', session_id)
      .eq('user_id', user.id)
      .single();

    if (!existingPart) {
      await admin.from('session_participants').insert({
        session_id,
        user_id: user.id,
        role,
        joined_at: new Date().toISOString(),
      });
    } else {
      // Re-joining: clear left_at
      await admin
        .from('session_participants')
        .update({ left_at: null })
        .eq('id', existingPart.id);
    }

    // Log event
    await admin.from('session_logs').insert({
      session_id,
      event: 'participant_joined',
      metadata: { user_id: user.id, role },
    });

    return new Response(
      JSON.stringify({
        livekit_token: token,
        livekit_url: getLiveKitUrl(),
        room_name: session.livekit_room_name,
        session: {
          id: session.id,
          class_id: session.class_id,
          status: session.status,
          livekit_room_name: session.livekit_room_name,
          started_at: session.started_at,
          ended_at: session.ended_at,
          created_at: session.created_at,
          recording_url: session.recording_url,
          whiteboard_snapshot_url: session.whiteboard_snapshot_url,
        },
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
