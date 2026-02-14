// send-message — Moderated chat message via Edge Function

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin, getUser } from '../_shared/auth.ts';
import { moderateMessage } from '../_shared/moderation.ts';

// Simple in-memory rate limiter
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_MS = 1000;

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const user = await getUser(authHeader);
    const { session_id, message } = await req.json();

    if (!session_id || !message) {
      return new Response(
        JSON.stringify({ error: 'session_id and message required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Rate limit check
    const lastSent = rateLimiter.get(user.id) ?? 0;
    if (Date.now() - lastSent < RATE_LIMIT_MS) {
      return new Response(
        JSON.stringify({ error: 'Rate limited. Please slow down.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    rateLimiter.set(user.id, Date.now());

    const admin = getSupabaseAdmin();

    // Verify user is participant in this session
    const { data: participant } = await admin
      .from('session_participants')
      .select('id')
      .eq('session_id', session_id)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Not a participant in this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Server-side moderation
    const modResult = moderateMessage(message);

    // Insert chat message
    const { data: chat, error: chatErr } = await admin
      .from('session_chats')
      .insert({
        session_id,
        sender_id: user.id,
        message: modResult.sanitized,
        is_blocked: modResult.blocked,
      })
      .select()
      .single();

    if (chatErr) throw chatErr;

    // If blocked, log moderation event
    if (modResult.blocked) {
      await admin.from('moderation_events').insert({
        session_id,
        user_id: user.id,
        original_message: message,
        reason: modResult.reason ?? 'unknown',
      });
    }

    return new Response(
      JSON.stringify({ chat }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
