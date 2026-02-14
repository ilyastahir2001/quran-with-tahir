// recording-webhook — LiveKit egress webhook to save recording URL

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/auth.ts';

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = Deno.env.get('LIVEKIT_WEBHOOK_SECRET');
    if (webhookSecret) {
      const authHeader = req.headers.get('Authorization') ?? '';
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return new Response(JSON.stringify({ error: 'Invalid webhook secret' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const body = await req.json();
    const event = body.event;

    // We only care about egress_ended
    if (event !== 'egress_ended') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const egressInfo = body.egressInfo;
    if (!egressInfo) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const roomName = egressInfo.room_name;
    const fileResults = egressInfo.file_results ?? egressInfo.fileResults;
    const recordingUrl = fileResults?.[0]?.download_url ?? fileResults?.[0]?.downloadUrl ?? null;

    if (!roomName || !recordingUrl) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = getSupabaseAdmin();

    // Find session by room name and update recording URL
    const { data: session } = await admin
      .from('class_sessions')
      .select('id')
      .eq('livekit_room_name', roomName)
      .single();

    if (session) {
      await admin
        .from('class_sessions')
        .update({ recording_url: recordingUrl })
        .eq('id', session.id);

      await admin.from('session_logs').insert({
        session_id: session.id,
        event: 'recording_completed',
        metadata: { recording_url: recordingUrl, egress_id: egressInfo.egress_id },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
