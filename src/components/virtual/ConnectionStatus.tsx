import React from 'react';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import type { ConnectionStatus } from '@/types/virtual';

interface ConnectionStatusProps {
    status: ConnectionStatus;
    reconnectAttempts?: number;
}

const statusConfig: Record<
    ConnectionStatus,
    { label: string; color: string; icon: React.ReactNode }
> = {
    idle: {
        label: 'Ready',
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        icon: <Wifi className="h-3.5 w-3.5" />,
    },
    connecting: {
        label: 'Connecting…',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    },
    connected: {
        label: 'Connected',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: <Wifi className="h-3.5 w-3.5" />,
    },
    reconnecting: {
        label: 'Reconnecting…',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    },
    disconnected: {
        label: 'Disconnected',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <WifiOff className="h-3.5 w-3.5" />,
    },
    failed: {
        label: 'Connection Failed',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
};

export function ConnectionStatusBadge({
    status,
    reconnectAttempts,
}: ConnectionStatusProps) {
    const cfg = statusConfig[status];

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}
        >
            {cfg.icon}
            <span>{cfg.label}</span>
            {status === 'reconnecting' && reconnectAttempts != null && (
                <span className="opacity-70">({reconnectAttempts})</span>
            )}
        </div>
    );
}
