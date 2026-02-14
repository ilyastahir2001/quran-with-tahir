import React, { useEffect, useRef } from 'react';
import { DailyParticipant } from '@daily-co/daily-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MicOff, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoTileProps {
  participant: DailyParticipant | null;
  isLocal?: boolean;
  isMini?: boolean;
  fallbackName?: string;
  fallbackAvatar?: string;
  className?: string;
}

export function VideoTile({
  participant,
  isLocal = false,
  isMini = false,
  fallbackName = 'Participant',
  fallbackAvatar,
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!participant) return;

    const videoTrack = participant.tracks?.video;
    const audioTrack = participant.tracks?.audio;

    // Set up video
    if (videoRef.current && videoTrack?.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack.persistentTrack]);
    }

    // Set up audio (only for remote participants)
    if (!isLocal && audioRef.current && audioTrack?.persistentTrack) {
      audioRef.current.srcObject = new MediaStream([audioTrack.persistentTrack]);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [participant, isLocal]);

  const isVideoOff = !participant?.video;
  const isAudioOff = !participant?.audio;
  const displayName = participant?.user_name || fallbackName;

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-muted',
        isMini ? 'w-40 h-28' : 'w-full h-full',
        className
      )}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={cn(
          'w-full h-full object-cover',
          isVideoOff && 'hidden'
        )}
      />

      {/* Audio element for remote participants */}
      {!isLocal && <audio ref={audioRef} autoPlay />}

      {/* Fallback when video is off */}
      {isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Avatar className={cn(isMini ? 'h-12 w-12' : 'h-24 w-24')}>
            <AvatarImage src={fallbackAvatar} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Overlay indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
          {isLocal ? 'You' : displayName}
        </Badge>

        <div className="flex items-center gap-1">
          {isAudioOff && (
            <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center">
              <MicOff className="h-3 w-3" />
            </Badge>
          )}
          {isVideoOff && (
            <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center">
              <VideoOff className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
