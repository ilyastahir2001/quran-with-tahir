import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Saudi Arabia', 'UAE', 'Pakistan', 'India', 'Egypt',
  'Malaysia', 'Indonesia', 'Turkey', 'Bangladesh', 'Nigeria'
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Karachi', label: 'Karachi' },
  { value: 'Asia/Kolkata', label: 'Mumbai' },
  { value: 'Asia/Dhaka', label: 'Dhaka' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur' },
  { value: 'Asia/Jakarta', label: 'Jakarta' },
  { value: 'Asia/Riyadh', label: 'Riyadh' },
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'urdu', label: 'Urdu' },
];

export default function Profile() {
  const { student, profile } = useAuth();
  const { updateProfile, isUpdating } = useStudentProfile();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country: '',
    timezone: 'UTC',
    language_pref: 'english',
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from student/profile
  useEffect(() => {
    if (student || profile) {
      setFormData({
        full_name: student?.full_name || profile?.full_name || '',
        phone: student?.profile?.phone || profile?.phone || '',
        country: student?.profile?.country || profile?.country || '',
        timezone: student?.timezone || 'UTC',
        language_pref: student?.profile?.language_pref || profile?.language_pref || 'english',
      });
    }
  }, [student, profile]);

  const displayName = formData.full_name || '';
  const email = profile?.email || student?.profile?.email || '';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student?.avatar_url || undefined} />
              <AvatarFallback className="text-xl">{initials || <User className="h-8 w-8" />}</AvatarFallback>
            </Avatar>
            <Button variant="outline" disabled>Change Photo</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(v) => handleChange('country', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => handleChange('timezone', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language_pref}
                onValueChange={(v) => handleChange('language_pref', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Read-only info */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Account Information</h4>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Course Level:</span>
                <span className="ml-2 capitalize">{student?.course_level || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Account Created:</span>
                <span className="ml-2">
                  {student?.created_at ? format(new Date(student.created_at), 'MMM d, yyyy') : '-'}
                </span>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={!isDirty || isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
