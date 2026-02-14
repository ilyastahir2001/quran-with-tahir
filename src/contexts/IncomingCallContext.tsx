import React, { createContext, useContext, ReactNode } from 'react';
import { useIncomingCall, IncomingCall } from '@/hooks/useIncomingCall';
import { IncomingCallModal } from '@/components/video/IncomingCallModal';

interface IncomingCallContextType {
  incomingCall: IncomingCall | null;
  isRinging: boolean;
  acceptCall: () => void;
  declineCall: () => void;
  clearCall: () => void;
}

const IncomingCallContext = createContext<IncomingCallContextType | null>(null);

export function useIncomingCallContext() {
  const context = useContext(IncomingCallContext);
  if (!context) {
    throw new Error('useIncomingCallContext must be used within IncomingCallProvider');
  }
  return context;
}

interface IncomingCallProviderProps {
  children: ReactNode;
}

export function IncomingCallProvider({ children }: IncomingCallProviderProps) {
  const {
    incomingCall,
    isRinging,
    acceptCall,
    declineCall,
    clearCall,
  } = useIncomingCall();

  return (
    <IncomingCallContext.Provider
      value={{ incomingCall, isRinging, acceptCall, declineCall, clearCall }}
    >
      {children}
      <IncomingCallModal
        call={incomingCall}
        isRinging={isRinging}
        onAccept={acceptCall}
        onDecline={declineCall}
      />
    </IncomingCallContext.Provider>
  );
}
