// stop-recording — Teacher stops recording a session

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';
import { stopEgress } from '../_shared/livekit.ts';

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const user = await getUser(authHeader);
    const { session_id, egress_id } = await req.json();

    if (!session_id || !egress_id) {
      return new Response(
        JSON.stringify({ error: 'session_id and egress_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const admin = getSupabaseAdmin();

    // Verify teacher
    const { data: session } = await admin
      .from('class_sessions')
      .select('*, classes!inner(teacher_id)')
      .eq('id', session_id)
      .single();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    await stopEgress(egress_id);

    // Log event
    await admin.from('session_logs').insert({
      session_id,
      event: 'recording_stopped',
      metadata: { egress_id, stopped_by: user.id },
    });

    return new Response(
      JSON.stringify({ status: 'stopped' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
