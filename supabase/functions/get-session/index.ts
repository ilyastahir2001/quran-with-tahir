// get-session — Get active session for a class or by session ID

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const _user = await getUser(authHeader);

    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const sessionId = url.searchParams.get('session_id');

    if (!classId && !sessionId) {
      return new Response(
        JSON.stringify({ error: 'class_id or session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const admin = getSupabaseAdmin();

    let query = admin.from('class_sessions').select('*');

    if (sessionId) {
      query = query.eq('id', sessionId);
    } else if (classId) {
      query = query.eq('class_id', classId).eq('status', 'live');
    }

    const { data: sessions, error: err } = await query;

    if (err) throw err;

    // Also load chat history if requesting a specific session
    if (sessionId && sessions && sessions.length > 0) {
      const { data: chats } = await admin
        .from('session_chats')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      return new Response(
        JSON.stringify({ session: sessions[0], chats: chats ?? [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ sessions: sessions ?? [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
