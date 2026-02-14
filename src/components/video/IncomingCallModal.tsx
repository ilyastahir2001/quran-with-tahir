import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IncomingCall } from '@/hooks/useIncomingCall';

interface IncomingCallModalProps {
  call: IncomingCall | null;
  isRinging: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({
  call,
  isRinging,
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play ringtone when ringing
  useEffect(() => {
    if (isRinging) {
      // Create a simple oscillating ringtone using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        // Create a pulsing effect
        const interval = setInterval(() => {
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.3);
        }, 1000);

        oscillator.start();

        return () => {
          clearInterval(interval);
          oscillator.stop();
          audioContext.close();
        };
      } catch (error) {
        console.log('Audio not supported:', error);
      }
    }
  }, [isRinging]);

  const handleAccept = () => {
    onAccept();
    if (call) {
      navigate(`/virtual-class/${call.classId}`);
    }
  };

  if (!call || !isRinging) {
    return null;
  }

  return (
    <AlertDialog open={isRinging}>
      <AlertDialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Animated ringing avatar */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full bg-primary/20",
              "animate-ping"
            )} />
            <div className={cn(
              "absolute -inset-2 rounded-full bg-primary/10",
              "animate-pulse"
            )} />
            <Avatar className="h-24 w-24 relative border-4 border-primary">
              <AvatarImage src={call.teacherAvatar} alt={call.teacherName} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {call.teacherName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-1">
            <AlertDialogTitle className="text-xl">
              Incoming Call
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-foreground">
              {call.teacherName}
            </AlertDialogDescription>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Video className="h-4 w-4" />
              Video Class Session
            </p>
          </div>

          {/* Accept/Decline buttons */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Button
                size="lg"
                variant="destructive"
                className="h-14 w-14 rounded-full p-0"
                onClick={onDecline}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              <span className="text-xs text-muted-foreground">Decline</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full p-0 bg-green-600 hover:bg-green-700"
                onClick={handleAccept}
              >
                <Phone className="h-6 w-6" />
              </Button>
              <span className="text-xs text-muted-foreground">Accept</span>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
