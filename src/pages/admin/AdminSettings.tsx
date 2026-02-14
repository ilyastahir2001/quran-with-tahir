import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SystemSetting, Json } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Settings,
    Bell,
    Shield,
    Database,
    Mail,
    Smartphone,
    RotateCcw,
    Save
} from 'lucide-react';

export default function AdminSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['admin-system-settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*');

            if (error) {
                console.error('Error fetching settings:', error);
                return [];
            }
            return data as SystemSetting[];
        }
    });

    const updateConfig = useMutation({
        mutationFn: async ({ key, value }: { key: string, value: string | boolean | number | Record<string, unknown> }) => {
            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key,
                    value: value as Json,
                    updated_at: new Date().toISOString(),
                    updated_by: (await supabase.auth.getUser()).data.user?.id
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
            toast({
                title: "Setting Saved",
                description: "Configuration updated successfully.",
            });
        }
    });

    const getValue = <T,>(key: string, defaultValue: T): T => {
        const setting = settings?.find(s => s.key === key);
        return (setting?.value as T) ?? defaultValue;
    };



    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading system settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Manage global platform configurations and security policies.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-slate-100/50">
                    <TabsTrigger value="general" className="gap-2 py-2">
                        <Settings className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 py-2">
                        <Shield className="h-4 w-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 py-2">
                        <Bell className="h-4 w-4" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="database" className="gap-2 py-2">
                        <Database className="h-4 w-4" /> System
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Configuration</CardTitle>
                            <CardDescription>Control core behavior of the academy platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Disable public access to the platform while performing updates.
                                    </p>
                                </div>
                                <Switch
                                    checked={getValue('maintenance_mode', false)}
                                    onCheckedChange={(checked) => updateConfig.mutate({ key: 'maintenance_mode', value: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow New Student Signups</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable the registration form for new students.
                                    </p>
                                </div>
                                <Switch
                                    checked={getValue('allow_signups', true)}
                                    onCheckedChange={(checked) => updateConfig.mutate({ key: 'allow_signups', value: checked })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Academy Name</Label>
                                <div className="flex gap-2">
                                    <Input
                                        defaultValue={getValue('platform_name', 'WARM Academy')}
                                        className="max-w-md"
                                        onBlur={(e) => updateConfig.mutate({ key: 'platform_name', value: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Regional & Localization</CardTitle>
                            <CardDescription>Set default timezone and language for the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Currency</Label>
                                    <Input
                                        defaultValue={getValue('default_currency', 'USD')}
                                        onBlur={(e) => updateConfig.mutate({ key: 'default_currency', value: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Primary Language</Label>
                                    <Input
                                        defaultValue={getValue('primary_language', 'English')}
                                        onBlur={(e) => updateConfig.mutate({ key: 'primary_language', value: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Control</CardTitle>
                            <CardDescription>Configure authentication and session policies.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Two-Factor Authentication (2FA)</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Require 2FA for all administrative accounts.
                                    </p>
                                </div>
                                <Switch checked={false} />
                            </div>
                            <div className="space-y-2">
                                <Label>Session Timeout (Minutes)</Label>
                                <Input type="number" defaultValue="60" className="max-w-[150px]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Password Policy</CardTitle>
                            <CardDescription>Manage password complexity requirements.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Minimum Length</Label>
                                <Input type="number" defaultValue="8" className="max-w-[100px]" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Require Special Characters</Label>
                                <Switch checked={true} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Communication Channels</CardTitle>
                            <CardDescription>Enable or disable automated notification paths.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">Class reminders and receipts</p>
                                    </div>
                                </div>
                                <Switch checked={true} />
                            </div>
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">WhatsApp Updates</p>
                                        <p className="text-sm text-muted-foreground">Real-time status alerts</p>
                                    </div>
                                </div>
                                <Switch checked={true} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">System Toast Alerts</p>
                                        <p className="text-sm text-muted-foreground">In-app notifications</p>
                                    </div>
                                </div>
                                <Switch checked={true} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database" className="mt-6">
                    <Card className="border-destructive/20">
                        <CardHeader className="bg-destructive/5">
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Critical system maintenance actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Clear System Logs</p>
                                    <p className="text-sm text-muted-foreground">Permanent deletion of activity logs over 90 days.</p>
                                </div>
                                <Button variant="outline" className="text-destructive hover:bg-destructive/10">Purge Logs</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Reset Permissions</p>
                                    <p className="text-sm text-muted-foreground">Revert all admin roles to factory defaults.</p>
                                </div>
                                <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">Factory Reset</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Discard Changes
                </Button>
                <Button className="gap-2 shadow-lg shadow-primary/20" disabled={updateConfig.isPending}>
                    <Save className="h-4 w-4" />
                    {updateConfig.isPending ? "Saving..." : "Save All Changes"}
                </Button>
            </div>
        </div>
    );
}
