// end-session — Teacher ends a live session

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';

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

    // Fetch session with class info
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

    // Verify teacher ownership
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

    const endedAt = new Date().toISOString();

    // Mark session as ended
    await admin
      .from('class_sessions')
      .update({ status: 'ended', ended_at: endedAt })
      .eq('id', session_id);

    // Update all participants who haven't left
    const { data: activeParticipants } = await admin
      .from('session_participants')
      .select('id, joined_at')
      .eq('session_id', session_id)
      .is('left_at', null);

    if (activeParticipants) {
      for (const p of activeParticipants) {
        const joinedAt = new Date(p.joined_at).getTime();
        const endedAtMs = new Date(endedAt).getTime();
        const durationSeconds = Math.round((endedAtMs - joinedAt) / 1000);

        await admin
          .from('session_participants')
          .update({ left_at: endedAt, duration_seconds: durationSeconds })
          .eq('id', p.id);
      }
    }

    // Update class status
    await admin
      .from('classes')
      .update({ status: 'completed', actual_end_time: endedAt })
      .eq('id', session.class_id);

    // Log event
    await admin.from('session_logs').insert({
      session_id,
      event: 'session_ended',
      metadata: { ended_by: user.id },
    });

    return new Response(
      JSON.stringify({ status: 'ended' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
