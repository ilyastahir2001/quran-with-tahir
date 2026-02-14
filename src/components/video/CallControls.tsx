import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Video, VideoOff, PhoneOff, FileText, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallControlsProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isMinimized?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onAddNote?: () => void;
  onToggleMinimize?: () => void;
}

export function CallControls({
  isMicOn,
  isCameraOn,
  isMinimized = false,
  onToggleMic,
  onToggleCamera,
  onEndCall,
  onAddNote,
  onToggleMinimize,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            variant={isMicOn ? 'secondary' : 'destructive'}
            className={cn(
              'rounded-full h-12 w-12 p-0',
              !isMicOn && 'bg-destructive/80 hover:bg-destructive'
            )}
            onClick={onToggleMic}
            aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            variant={isCameraOn ? 'secondary' : 'destructive'}
            className={cn(
              'rounded-full h-12 w-12 p-0',
              !isCameraOn && 'bg-destructive/80 hover:bg-destructive'
            )}
            onClick={onToggleCamera}
            aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        </TooltipContent>
      </Tooltip>

      {onAddNote && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full h-12 w-12 p-0"
              onClick={onAddNote}
              aria-label="Add quick note"
            >
              <FileText className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add quick note</TooltipContent>
        </Tooltip>
      )}

      {onToggleMinimize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full h-12 w-12 p-0"
              onClick={onToggleMinimize}
              aria-label={isMinimized ? 'Maximize video call' : 'Minimize video call'}
            >
              {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isMinimized ? 'Maximize' : 'Minimize'}
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full h-12 w-12 p-0 bg-destructive hover:bg-destructive/90"
            onClick={onEndCall}
            aria-label="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>End call</TooltipContent>
      </Tooltip>
    </div>
  );
}
