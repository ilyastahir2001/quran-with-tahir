import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function MFAVerify() {
    const { toast } = useToast();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [verificationCode, setVerificationCode] = useState("");
    const [verifying, setVerifying] = useState(false);

    // Get factorId from state (passed from AuthContext redirect)
    const factorId = location.state?.factorId;

    if (!factorId) {
        navigate("/login");
        return null;
    }

    const handleVerify = async () => {
        if (!verificationCode) return;
        try {
            setVerifying(true);
            await AuthService.challengeAndVerifyMFA(factorId, verificationCode);

            toast({
                title: "Verified",
                description: "Welcome back!",
            });

            // Redirect to intended destination or dashboard
            const from = location.state?.from || "/";
            navigate(from, { replace: true });
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Security Code</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Enter the 6-digit code from your authenticator app to complete the login process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <Input
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center text-4xl h-20 tracking-widest font-mono font-bold border-2 focus-visible:ring-primary"
                            maxLength={6}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                        />

                        <Button
                            className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20"
                            onClick={handleVerify}
                            disabled={verifying || verificationCode.length < 6}
                        >
                            {verifying ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex justify-center">
                        <Button variant="ghost" size="sm" onClick={async () => {
                            await signOut();
                            navigate("/login");
                        }} className="text-muted-foreground hover:text-primary">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
