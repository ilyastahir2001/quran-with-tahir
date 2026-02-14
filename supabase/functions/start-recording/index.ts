// start-recording — Teacher starts recording a session

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';
import { startRoomCompositeEgress } from '../_shared/livekit.ts';

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
      .select('*, classes!inner(teacher_id)')
      .eq('id', session_id)
      .single();

    if (sessionErr || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify teacher
    const { data: teacherData } = await admin
      .from('teachers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const classInfo = session.classes as { teacher_id: string };
    if (!teacherData || teacherData.id !== classInfo.teacher_id) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get storage bucket name from env (defaults to project bucket)
    const bucket = Deno.env.get('RECORDING_BUCKET') ?? 'recordings';

    const egressId = await startRoomCompositeEgress(session.livekit_room_name, bucket);

    // Store egress ID for later stop
    await admin
      .from('class_sessions')
      .update({
        recording_url: null, // Will be set when recording stops
      })
      .eq('id', session_id);

    // Log event
    await admin.from('session_logs').insert({
      session_id,
      event: 'recording_started',
      metadata: { egress_id: egressId, started_by: user.id },
    });

    return new Response(
      JSON.stringify({ egress_id: egressId, status: 'recording' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
