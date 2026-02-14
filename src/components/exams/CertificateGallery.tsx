import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Award,
    Download,
    ExternalLink,
    Calendar,
    ShieldCheck,
    Search,
    Filter,
    Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CertificateTemplate } from './CertificateTemplate';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface Certificate {
    id: string;
    student_id: string;
    title: string;
    certificate_type: string;
    issue_date: string;
    verification_code: string;
    metadata: Record<string, unknown>;
}

export const CertificateGallery = ({ studentId }: { studentId: string }) => {
    const { data: certificates, isLoading, error } = useQuery({
        queryKey: ['certificates', studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('student_id', studentId)
                .order('issue_date', { ascending: false });

            if (error) throw error;
            return data as Certificate[];
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden border-none shadow-lg">
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-6 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        toast.error('Failed to load certificates');
        return <div className="text-center py-20 opacity-50">Error loading certificates</div>;
    }

    if (!certificates || certificates.length === 0) {
        return (
            <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/20">
                <div className="bg-muted p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Award className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-2xl font-black mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Complete your exams with a score of 70% or higher to earn your official AI Academy certificates.
                </p>
                <Button variant="outline" className="mt-8 rounded-full px-8 font-bold">
                    Browse Available Exams
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/10 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Achievements</h2>
                    <p className="text-muted-foreground font-medium">You have earned {certificates.length} official certificates</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Find a certificate..."
                            className="h-11 pl-10 pr-4 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((cert) => (
                    <Card key={cert.id} className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card to-muted/10 rounded-3xl">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="h-32 w-32 -rotate-12" />
                        </div>

                        <CardHeader className="relative pb-4">
                            <div className="flex items-start justify-between mb-2">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                                    {cert.certificate_type}
                                </Badge>
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            </div>
                            <CardTitle className="text-xl font-black leading-tight group-hover:text-primary transition-colors pr-8">
                                {cert.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-6">
                            <div className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 opacity-50" />
                                    Issued on {new Date(cert.issue_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 opacity-50" />
                                    ID: <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-lg">{cert.verification_code}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="flex-1 rounded-2xl font-bold bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                                            View Details
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-3xl bg-transparent">
                                        <CertificateTemplate certificate={cert} />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 rounded-2xl hover:bg-primary/5 border-2"
                                    onClick={() => {
                                        const verifyUrl = `${window.location.origin}/verify/${cert.verification_code}`;
                                        navigator.clipboard.writeText(verifyUrl);
                                        toast.success('Verification link copied to clipboard!');
                                    }}
                                    title="Copy Verification Link"
                                >
                                    <Share2 className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl hover:bg-primary/5 border-2">
                                    <Download className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
