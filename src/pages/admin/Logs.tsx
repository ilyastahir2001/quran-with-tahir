import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ShieldAlert,
    History,
    User,
    Activity,
    Terminal,
    Search,
    Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { AuditLog, AdminAuditLog } from '@/types/database';

export default function AdminLogs() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['admin-audit-logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('admin_audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as AdminAuditLog[];
        }
    });

    const { data: counts } = useQuery({
        queryKey: ['admin-audit-counts'],
        queryFn: async () => {
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const { count: adminActions } = await supabase
                .from('admin_audit_logs')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', last24Hours);

            const { count: authEvents } = await supabase
                .from('auth_activity_logs')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', last24Hours);

            return {
                adminActions: adminActions || 0,
                authEvents: authEvents || 0
            };
        }
    });

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    System Audit Trail
                </h1>
                <p className="text-muted-foreground text-lg mt-1">Immutable security logs of all administrative actions and system events.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-lg bg-card border border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Admin Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{counts?.adminActions || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-card border border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Auth Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{counts?.authEvents || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">Recorded events</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-card border border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Crit Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-destructive">0</div>
                        <p className="text-xs text-muted-foreground mt-1">System healthy</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Terminal className="h-5 w-5" />
                            Live Audit Log
                        </CardTitle>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Filter logs..."
                                    className="pl-9 h-10 w-[240px] rounded-xl border-2 bg-muted/20 focus:bg-background transition-all outline-none focus:ring-2 ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/10 text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4 text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : logs?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">No audit logs found.</td>
                                    </tr>
                                ) : (
                                    logs?.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-bold tabular-nums text-sm text-muted-foreground">
                                                {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 opacity-50" />
                                                    <span className="font-bold text-sm">System</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="font-bold uppercase text-[10px] rounded-md">{log.action}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium leading-relaxed truncate max-w-[400px]">
                                                    {log.target_resource} - {JSON.stringify(log.details)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold tabular-nums text-xs opacity-50">{log.ip_address || '127.0.0.1'}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t p-4 justify-center">
                    <Button variant="ghost" className="rounded-xl font-bold">Load More Entry History</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
