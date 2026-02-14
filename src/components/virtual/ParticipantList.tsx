import React from 'react';
import { Users } from 'lucide-react';
import type { SessionParticipant } from '@/types/virtual';

interface ParticipantListProps {
    participants: SessionParticipant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
    if (participants.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground py-6">
                No participants yet.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                <Users className="h-4 w-4" />
                <span>Participants ({participants.length})</span>
            </div>

            <div className="space-y-1">
                {participants.map((p) => {
                    const isOnline = !p.left_at;
                    const roleColor =
                        p.role === 'teacher'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-sky-400';

                    return (
                        <div
                            key={p.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm"
                        >
                            {/* Online dot */}
                            <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                                    }`}
                            />

                            <span className="truncate flex-1">{p.user_id}</span>
                            <span className={`text-xs font-medium capitalize ${roleColor}`}>
                                {p.role}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
