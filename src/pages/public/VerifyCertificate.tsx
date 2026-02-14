import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Search, ArrowLeft, Award, Calendar, User, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function VerifyCertificate() {
    const { code: urlCode } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const [code, setCode] = useState(urlCode || '');
    const [loading, setLoading] = useState(false);
    const [certificate, setCertificate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const performVerification = async (verifyCode: string) => {
        if (!verifyCode) return;
        setLoading(true);
        setError(null);
        setCertificate(null);

        try {
            const { data, error: certError } = await supabase
                .from('certificates')
                .select(`
          id,
          title,
          issue_date,
          verification_code,
          certificate_type,
          students (
            full_name
          )
        `)
                .eq('verification_code', verifyCode.toUpperCase())
                .single();

            if (certError) {
                setError('Invalid verification code. Please check and try again.');
            } else {
                setCertificate(data);
            }
        } catch (err) {
            setError('An error occurred during verification.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (urlCode) {
            performVerification(urlCode);
        }
    }, [urlCode]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (code) {
            navigate(`/verify/${code.toUpperCase()}`);
            performVerification(code);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-8">
                {/* Branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 text-primary">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Certificate Verification</h1>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Official authenticity portal for Global Quranic Recognition.
                    </p>
                </div>

                {/* Verification Card */}
                <Card className="border-none shadow-2xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-900 text-white pb-8 pt-8">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Verify Credentials
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter the unique verification code found on the certificate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="-mt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="e.g. CERT-ABCDE-12345"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="h-14 pl-4 text-lg font-mono uppercase tracking-widest border-2 focus-visible:ring-primary shadow-lg"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="h-14 px-8 font-bold text-lg shadow-lg hover:translate-y-[-2px] transition-transform"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify Now'}
                            </Button>
                        </form>

                        {/* Verification Results */}
                        <div className="mt-8">
                            {error && (
                                <div className="p-6 rounded-2xl bg-destructive/5 border-2 border-destructive/10 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                                    <ShieldAlert className="h-6 w-6 text-destructive shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-destructive">Verification Failed</h3>
                                        <p className="text-sm text-slate-600">{error}</p>
                                    </div>
                                </div>
                            )}

                            {certificate && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-100 flex items-start gap-4">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-green-900">Authenticity Confirmed</h3>
                                            <p className="text-sm text-green-700">This document is a verified digital achievement issued by our academy.</p>
                                            <Badge className="bg-green-600 mt-2 font-mono">{certificate.verification_code}</Badge>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Card className="border-slate-100 bg-slate-50/50">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Issued To</p>
                                                        <p className="font-bold text-slate-900">{certificate.students?.full_name}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-slate-100 bg-slate-50/50">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                                        <Award className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Achievement</p>
                                                        <p className="font-bold text-slate-900">{certificate.title}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-slate-100 bg-slate-50/50">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Date</p>
                                                        <p className="font-bold text-slate-900">{format(new Date(certificate.issue_date), 'MMMM dd, yyyy')}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-slate-100 bg-slate-50/50">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                                        <ShieldCheck className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</p>
                                                        <p className="font-bold text-slate-900 capitalize">{certificate.certificate_type.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 py-4 flex justify-between items-center text-xs text-slate-400">
                        <span>&copy; {new Date().getFullYear()} Global Quranic Academy</span>
                        <span className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Verified via Blockchain-hash equivalent
                        </span>
                    </CardFooter>
                </Card>

                <div className="text-center">
                    <Button variant="ghost" className="text-slate-500 hover:text-primary" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Return to Academy Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
