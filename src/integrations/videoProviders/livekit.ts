// LiveKit Video Provider Adapter
//
// Wraps livekit-client SDK into the VideoProviderAdapter interface so the
// rest of the app is provider-agnostic.

import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
  DataPacket_Kind,
} from 'livekit-client';

import type {
  VideoProviderAdapter,
  VideoProviderEventMap,
  VideoTrackInfo,
  VideoParticipantInfo,
  ConnectionStatus,
} from './types';

// ── Helpers ───────────────────────────────────────

function mapConnectionState(state: ConnectionState): ConnectionStatus {
  switch (state) {
    case ConnectionState.Connected:
      return 'connected';
    case ConnectionState.Connecting:
      return 'connecting';
    case ConnectionState.Reconnecting:
      return 'reconnecting';
    case ConnectionState.Disconnected:
      return 'disconnected';
    default:
      return 'idle';
  }
}

function participantInfo(
  p: RemoteParticipant | LocalParticipant,
): VideoParticipantInfo {
  const tracks: VideoTrackInfo[] = [];
  p.trackPublications.forEach((pub) => {
    if (pub.track) {
      tracks.push({
        trackSid: pub.trackSid,
        participantId: p.identity,
        kind: pub.kind === Track.Kind.Video ? 'video' : 'audio',
        stream: pub.track.mediaStream ?? undefined,
      });
    }
  });

  return {
    identity: p.identity,
    sid: p.sid,
    isSpeaking: p.isSpeaking,
    isMuted: !p.isMicrophoneEnabled,
    isCameraOff: !p.isCameraEnabled,
    tracks,
  };
}

// ── Adapter Class ─────────────────────────────────

class LiveKitAdapter implements VideoProviderAdapter {
  private room: Room;
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    this.attachRoomEvents();
  }

  // ── Connection ────────────────────────────────

  async connect(url: string, token: string): Promise<void> {
    await this.room.connect(url, token);
  }

  disconnect(): void {
    this.room.disconnect();
  }

  // ── Media Controls ────────────────────────────

  async setMicEnabled(enabled: boolean): Promise<void> {
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    await this.room.localParticipant.setCameraEnabled(enabled);
  }

  // ── Streams ───────────────────────────────────

  getLocalVideoStream(): MediaStream | null {
    const pub = this.room.localParticipant.getTrackPublication(
      Track.Source.Camera,
    );
    return pub?.track?.mediaStream ?? null;
  }

  getRemoteVideoStream(participantId: string): MediaStream | null {
    const p = Array.from(this.room.remoteParticipants.values()).find(
      (rp) => rp.identity === participantId,
    );
    if (!p) return null;

    const pub = p.getTrackPublication(Track.Source.Camera);
    return pub?.track?.mediaStream ?? null;
  }

  // ── Data Channel ──────────────────────────────

  sendData(payload: string, _topic?: string): void {
    const encoder = new TextEncoder();
    this.room.localParticipant.publishData(
      encoder.encode(payload),
      { reliable: true },
    );
  }

  // ── Event Emitter ─────────────────────────────

  on<K extends keyof VideoProviderEventMap>(
    event: K,
    handler: VideoProviderEventMap[K],
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void);
  }

  off<K extends keyof VideoProviderEventMap>(
    event: K,
    handler: VideoProviderEventMap[K],
  ): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void);
  }

  private emit<K extends keyof VideoProviderEventMap>(
    event: K,
    ...args: Parameters<VideoProviderEventMap[K]>
  ): void {
    this.listeners.get(event)?.forEach((fn) => fn(...(args as unknown[])));
  }

  // ── Room Events ───────────────────────────────

  private attachRoomEvents(): void {
    this.room
      .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
        this.emit('participantJoined', participantInfo(p));
      })
      .on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
        this.emit('participantLeft', participantInfo(p));
      })
      .on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, p: RemoteParticipant) => {
          this.emit('trackSubscribed', {
            trackSid: track.sid,
            participantId: p.identity,
            kind: track.kind === Track.Kind.Video ? 'video' : 'audio',
            stream: track.mediaStream ?? undefined,
          });
        },
      )
      .on(
        RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, p: RemoteParticipant) => {
          this.emit('trackUnsubscribed', {
            trackSid: track.sid,
            participantId: p.identity,
            kind: track.kind === Track.Kind.Video ? 'video' : 'audio',
          });
        },
      )
      .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        this.emit('connectionStateChanged', mapConnectionState(state));
      })
      .on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
        const decoder = new TextDecoder();
        this.emit('dataReceived', {
          senderId: participant?.identity ?? 'unknown',
          payload: decoder.decode(payload),
        });
      })
      .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        this.emit(
          'activeSpeakerChanged',
          speakers.map((s) => s.identity),
        );
      });
  }
}

// ── Singleton Export ─────────────────────────────

let instance: LiveKitAdapter | null = null;

export function createLiveKitAdapter(): VideoProviderAdapter {
  if (!instance) {
    instance = new LiveKitAdapter();
  }
  return instance;
}
