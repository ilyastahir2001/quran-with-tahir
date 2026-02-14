import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { Loader2, User, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Saudi Arabia', 'UAE', 'Pakistan', 'India', 'Egypt',
    'Malaysia', 'Indonesia', 'Turkey', 'Bangladesh', 'Nigeria', 'Other'
];

const LANGUAGES = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
];

export default function TeacherProfile() {
    const { teacher, profile } = useAuth();
    const { updateProfile, isUpdating } = useTeacherProfile();

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        country: '',
        language_pref: 'english',
    });

    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (teacher || profile) {
            setFormData({
                full_name: profile?.full_name || '',
                phone: profile?.phone || '',
                country: profile?.country || '',
                language_pref: profile?.language_pref || 'english',
            });
        }
    }, [teacher, profile]);

    const displayName = formData.full_name || profile?.full_name || '';
    const email = profile?.email || '';
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

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingAvatar(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `${profile?.user_id}-${Math.random()}.${fileExt}`;

            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            updateProfile({ ...formData, avatar_url: publicUrl });
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload avatar. Make sure storage bucket "avatars" exists.');
        } finally {
            setIsUploadingAvatar(false);
        }
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
                        <input
                            id="avatar-upload"
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            aria-label="Upload profile picture"
                        />
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xl">{initials || <User className="h-8 w-8" />}</AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            onClick={handleAvatarClick}
                            disabled={isUploadingAvatar || isUpdating}
                        >
                            {isUploadingAvatar ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Change Photo
                                </>
                            )}
                        </Button>
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
                                <SelectTrigger id="country">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRIES.map(country => (
                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Preferred Language</Label>
                            <Select
                                value={formData.language_pref}
                                onValueChange={(v) => handleChange('language_pref', v)}
                            >
                                <SelectTrigger id="language">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map(lang => (
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
                                <span className="text-muted-foreground">Status:</span>
                                <span className="ml-2 capitalize">{teacher?.status || 'Pending'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Account Created:</span>
                                <span className="ml-2">
                                    {teacher?.created_at ? format(new Date(teacher.created_at), 'MMM d, yyyy') : '-'}
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
