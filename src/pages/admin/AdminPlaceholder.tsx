import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface AdminPagePlaceholderProps {
    title: string;
    description?: string;
}

export function AdminPagePlaceholder({ title, description }: AdminPagePlaceholderProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">
                        {description || 'Manage this section of the academy.'}
                    </p>
                </div>
            </div>

            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5 text-amber-500" />
                        Under Construction
                    </CardTitle>
                    <CardDescription>
                        This module is currently being built. Check back soon!
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/20">
                    FEATURE COMING SOON
                </CardContent>
            </Card>
        </div>
    );
}
