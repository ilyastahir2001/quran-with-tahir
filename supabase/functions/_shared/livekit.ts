// LiveKit helpers for Supabase Edge Functions
//
// Uses LiveKit Server SDK via REST API to:
// 1. Generate access tokens
// 2. Create/manage rooms
// 3. Start/stop egress recordings
//
// The following secrets must be set:
//   LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL

import { encode as base64url } from 'https://deno.land/std@0.177.0/encoding/base64url.ts';

// ── JWT Token Generation ──────────────────────────

interface TokenGrants {
  roomJoin: boolean;
  room: string;
  canPublish: boolean;
  canSubscribe: boolean;
  canPublishData: boolean;
}

interface TokenClaims {
  iss: string;
  sub: string;
  nbf: number;
  exp: number;
  video: TokenGrants;
  metadata?: string;
}

async function hmacSign(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(data),
  );
  return base64url(new Uint8Array(signature));
}

export async function generateToken(
  identity: string,
  roomName: string,
  metadata?: string,
): Promise<string> {
  const apiKey = Deno.env.get('LIVEKIT_API_KEY')!;
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')!;

  const now = Math.floor(Date.now() / 1000);
  const claims: TokenClaims = {
    iss: apiKey,
    sub: identity,
    nbf: now,
    exp: now + 6 * 3600, // 6 hours
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  };

  if (metadata) {
    claims.metadata = metadata;
  }

  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
  );
  const payload = base64url(
    new TextEncoder().encode(JSON.stringify(claims)),
  );
  const signature = await hmacSign(apiSecret, `${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

// ── Room Management ───────────────────────────────

async function livekitApiCall(
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const url = Deno.env.get('LIVEKIT_URL')!;
  const apiKey = Deno.env.get('LIVEKIT_API_KEY')!;
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')!;

  // Create a short-lived token for API auth
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
  );
  const payload = base64url(
    new TextEncoder().encode(
      JSON.stringify({ iss: apiKey, nbf: now, exp: now + 60, video: { roomAdmin: true } }),
    ),
  );
  const signature = await hmacSign(apiSecret, `${header}.${payload}`);
  const token = `${header}.${payload}.${signature}`;

  const apiUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');

  return fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function createRoom(name: string): Promise<void> {
  await livekitApiCall('/twirp/livekit.RoomService/CreateRoom', {
    name,
    empty_timeout: 600, // 10 min
    max_participants: 2,
  });
}

// ── Egress (Recording) ───────────────────────────

export async function startRoomCompositeEgress(
  roomName: string,
  bucket: string,
): Promise<string> {
  const res = await livekitApiCall(
    '/twirp/livekit.Egress/StartRoomCompositeEgress',
    {
      room_name: roomName,
      file_outputs: [
        {
          file_type: 'mp4',
          filepath: `recordings/${roomName}/{time}.mp4`,
          s3: {
            bucket,
            region: 'auto',
          },
        },
      ],
    },
  );
  const data = await res.json();
  return data.egress_id ?? '';
}

export async function stopEgress(egressId: string): Promise<void> {
  await livekitApiCall('/twirp/livekit.Egress/StopEgress', {
    egress_id: egressId,
  });
}

export function getLiveKitUrl(): string {
  return Deno.env.get('LIVEKIT_URL')!;
}
