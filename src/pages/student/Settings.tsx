import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Video, Accessibility, Globe, Loader2 } from 'lucide-react';
import { useStudentSettings, type StudentSettings } from '@/hooks/useStudentSettings';

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Karachi', label: 'Karachi' },
  { value: 'Asia/Kolkata', label: 'Mumbai' },
  { value: 'Asia/Riyadh', label: 'Riyadh' },
];

export default function Settings() {
  const { settings, isLoading, updateSettings, isUpdating } = useStudentSettings();

  const handleNotificationChange = (key: string, value: boolean | number) => {
    const currentPrefs = settings.notification_prefs || { email: true, push: true, sms: false, reminder_minutes: 15 };
    updateSettings({
      notification_prefs: {
        ...currentPrefs,
        [key]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email Notifications</Label>
              <Switch
                id="email-notif"
                checked={settings.notification_prefs?.email ?? true}
                onCheckedChange={(v) => handleNotificationChange('email', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notif">Push Notifications</Label>
              <Switch
                id="push-notif"
                checked={settings.notification_prefs?.push ?? true}
                onCheckedChange={(v) => handleNotificationChange('push', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminder-time">Class Reminder</Label>
                <p className="text-xs text-muted-foreground">How early to remind you</p>
              </div>
              <Select
                value={String(settings.notification_prefs?.reminder_minutes ?? 15)}
                onValueChange={(v) => handleNotificationChange('reminder_minutes', parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Video Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Preferences
            </CardTitle>
            <CardDescription>Configure your video call settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="camera-default">Camera on by default</Label>
              <Switch
                id="camera-default"
                checked={settings.video_pref ?? true}
                onCheckedChange={(v) => updateSettings({ video_pref: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="low-bandwidth">Low bandwidth mode</Label>
                <p className="text-xs text-muted-foreground">Use audio-only to save data</p>
              </div>
              <Switch
                id="low-bandwidth"
                checked={settings.low_bandwidth_mode ?? false}
                onCheckedChange={(v) => updateSettings({ low_bandwidth_mode: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility
            </CardTitle>
            <CardDescription>Adjust accessibility settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="accessibility-mode">Accessibility Mode</Label>
                <p className="text-xs text-muted-foreground">Adjust UI for better accessibility</p>
              </div>
              <Select
                value={settings.accessibility_mode ?? 'standard'}
                onValueChange={(v) => updateSettings({ accessibility_mode: v as StudentSettings['accessibility_mode'] })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="senior">Senior-Friendly</SelectItem>
                  <SelectItem value="high-contrast">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Regional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>Set your timezone, country, and language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone ?? 'UTC'}
                onValueChange={(v) => updateSettings({ timezone: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
