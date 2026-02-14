import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentAvatar, AvatarConfig } from './StudentAvatar';
import { Check, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

const SKIN_COLORS = ['#f3d6b1', '#e0ac69', '#8d5524', '#c68642', '#ffdbac'];
const CLOTHING_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#db2777', '#f59e0b', '#000000'];
const HEADWEAR_COLORS = ['#ffffff', '#000000', '#1e40af', '#166534', '#991b1b', '#3730a3'];

export function AvatarCustomizer() {
    const { profile, refreshProfile } = useAuth();

    // Initial config from profile metadata or default
    const profileMetadata = profile?.metadata as { avatar_config?: AvatarConfig } | null;
    const initialConfig = profileMetadata?.avatar_config || {
        base: 'neutral',
        skinColor: '#f3d6b1',
        clothingColor: '#2563eb',
        headwearColor: '#ffffff',
        accessory: 'none'
    };

    const [config, setConfig] = useState<AvatarConfig>(initialConfig);
    const [saving, setSaving] = useState(false);

    const updateConfig = (key: keyof AvatarConfig, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const currentMetadata = (profile.metadata && typeof profile.metadata === 'object' && !Array.isArray(profile.metadata))
                ? (profile.metadata as Record<string, Json>)
                : {};

            const { error } = await supabase
                .from('profiles')
                .update({
                    metadata: {
                        ...currentMetadata,
                        avatar_config: config as unknown as Json
                    } as Json
                })
                .eq('id', profile.id);

            if (error) throw error;

            await refreshProfile();
            toast.success('Avatar saved successfully!');
        } catch (err) {
            console.error('Error saving avatar:', err);
            toast.error('Failed to save avatar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border-none shadow-2xl overflow-hidden bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            Your "Little Hafiz" Avatar
                        </CardTitle>
                        <CardDescription>Customize your digital student profile</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Level 1</Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Preview Area */}
                <div className="flex flex-col items-center justify-center p-8 bg-background/50 rounded-3xl border-2 border-dashed border-primary/20 aspect-square">
                    <StudentAvatar config={config} size={200} />
                    <div className="mt-6 flex gap-3">
                        <Button variant="outline" size="sm" onClick={() => setConfig(initialConfig)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Avatar'}
                        </Button>
                    </div>
                </div>

                {/* Customization Tabs */}
                <div className="space-y-6">
                    <Tabs defaultValue="base" className="w-full">
                        <TabsList className="grid grid-cols-4 w-full h-12">
                            <TabsTrigger value="base" className="text-xs">Style</TabsTrigger>
                            <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
                            <TabsTrigger value="headwear" className="text-xs">Hijab/Hat</TabsTrigger>
                            <TabsTrigger value="extras" className="text-xs">Extras</TabsTrigger>
                        </TabsList>

                        <TabsContent value="base" className="p-4 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {['boy', 'girl', 'neutral'].map((style) => (
                                    <Button
                                        key={style}
                                        variant={config.base === style ? 'default' : 'outline'}
                                        className="capitalize h-12"
                                        onClick={() => updateConfig('base', style)}
                                    >
                                        {style}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="colors" className="p-4 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Skin Tone</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {SKIN_COLORS.map(color => (
                                        <button
                                            key={color}
                                            title={`Set skin tone to ${color}`}
                                            className={`h-8 w-8 rounded-full border-2 ${config.skinColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => updateConfig('skinColor', color)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clothing</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {CLOTHING_COLORS.map(color => (
                                        <button
                                            key={color}
                                            title={`Set clothing color to ${color}`}
                                            className={`h-8 w-8 rounded-full border-2 ${config.clothingColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => updateConfig('clothingColor', color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="headwear" className="p-4 space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {HEADWEAR_COLORS.map(color => (
                                    <button
                                        key={color}
                                        title={`Set headwear color to ${color}`}
                                        className={`h-10 w-10 rounded-full border-2 ${config.headwearColor === color ? 'border-primary scale-110' : 'border-transparent'} flex items-center justify-center`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateConfig('headwearColor', color)}
                                    >
                                        {config.headwearColor === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                                    </button>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="extras" className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {['none', 'glasses', 'book', 'tasbih'].map((item) => (
                                    <Button
                                        key={item}
                                        variant={config.accessory === item ? 'default' : 'outline'}
                                        className="capitalize h-12"
                                        onClick={() => updateConfig('accessory', item)}
                                    >
                                        {item}
                                    </Button>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
    );
}
