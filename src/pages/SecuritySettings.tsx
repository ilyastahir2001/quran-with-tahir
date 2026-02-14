import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck, ShieldAlert, KeyRound, Copy, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface MFAFactor {
    id: string;
    factor_type: string;
    status: string;
    created_at: string;
}

export default function SecuritySettings() {
    const { toast } = useToast();
    const [factors, setFactors] = useState<MFAFactor[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollData, setEnrollData] = useState<{ id: string; totp: { qr_code: string; secret: string } } | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchFactors();
    }, []);

    const fetchFactors = async () => {
        try {
            setLoading(true);
            const allFactors = await AuthService.listFactors();
            setFactors(allFactors as MFAFactor[]);
        } catch (error: unknown) {
            console.error("Failed to fetch MFA factors:", error);
        } finally {
            setLoading(false);
        }
    };

    const startEnrollment = async () => {
        try {
            setEnrolling(true);
            const data = await AuthService.enrollMFA();
            setEnrollData(data as { id: string; totp: { qr_code: string; secret: string } });
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Enrollment Failed",
                description: error instanceof Error ? error.message : "Could not start 2FA enrollment.",
            });
        } finally {
            setEnrolling(false);
        }
    };

    const finalizeEnrollment = async () => {
        if (!enrollData?.id || !verificationCode) return;
        try {
            setVerifying(true);
            await AuthService.verifyMFA(enrollData.id, verificationCode);
            toast({
                title: "2FA Enabled",
                description: "Your account is now protected with Two-Factor Authentication.",
            });
            setEnrollData(null);
            setVerificationCode("");
            await fetchFactors();
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error instanceof Error ? error.message : "The code you entered is invalid.",
            });
        } finally {
            setVerifying(false);
        }
    };

    const unenroll = async (factorId: string) => {
        try {
            if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return;
            await AuthService.unenrollMFA(factorId);
            toast({
                title: "2FA Disabled",
                description: "Two-Factor Authentication has been removed from your account.",
            });
            await fetchFactors();
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to disable 2FA.",
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Secret key copied to clipboard.",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isEnabled = factors.length > 0;

    return (
        <div className="container max-w-2xl py-8">
            <Card className="border-t-4 border-t-primary shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Security Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Manage your account security and authentication methods.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-muted">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {isEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isEnabled
                                        ? "Currently enabled. Your account has an extra layer of protection."
                                        : "Not enabled. Add an extra layer of security to your account."}
                                </p>
                            </div>
                        </div>
                        {!isEnabled && !enrollData && (
                            <Button onClick={startEnrollment} disabled={enrolling}>
                                {enrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                                Enable 2FA
                            </Button>
                        )}
                        {isEnabled && (
                            <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => unenroll(factors[0].id)}>
                                Disable
                            </Button>
                        )}
                    </div>

                    {enrollData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pt-4 border-t border-dashed">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-xl text-primary">Setup Authenticator</h4>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                                    </p>
                                </div>

                                <div className="p-6 bg-white rounded-2xl shadow-inner border-2 border-primary/20 bg-gradient-to-b from-white to-gray-50">
                                    <QRCodeSVG
                                        value={enrollData.totp.qr_code}
                                        size={200}
                                        level="H"
                                        includeMargin
                                    />
                                </div>

                                <div className="w-full space-y-2 text-left">
                                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Manual Entry Key</label>
                                    <div className="flex gap-2">
                                        <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all border border-muted-foreground/10">
                                            {enrollData.totp.secret}
                                        </code>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(enrollData.totp.secret)} className="shrink-0">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="w-full space-y-4 pt-4">
                                    <div className="space-y-2 text-left">
                                        <label className="text-sm font-semibold">Verification Code</label>
                                        <Input
                                            placeholder="6-digit code from your app"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="text-center text-2xl tracking-widest h-14 font-bold"
                                            maxLength={6}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" className="flex-1" onClick={() => setEnrollData(null)}>Cancel</Button>
                                        <Button className="flex-1" onClick={finalizeEnrollment} disabled={verifying || verificationCode.length < 6}>
                                            {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                            Verify & Activate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isEnabled && factors.map((factor) => (
                        <div key={factor.id} className="p-4 rounded-xl border border-primary/10 bg-primary/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Authenticator App</p>
                                        <p className="text-xs text-muted-foreground">Successfully enrolled</p>
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                    TOTP
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <p className="text-center mt-6 text-sm text-muted-foreground">
                Stay safe! Two-factor authentication keeps your personal information and student data secure.
            </p>
        </div>
    );
}
