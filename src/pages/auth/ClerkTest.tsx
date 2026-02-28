import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
    useAuth,
} from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase-clerk";

export default function ClerkTest() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [supabaseStatus, setSupabaseStatus] = useState<string>("Waiting for Clerk to load...");

    // Quick test to see if we can get a Supabase client configured with the Clerk token
    useEffect(() => {
        const testSupabaseIntegration = async () => {
            if (!isLoaded) return;

            if (!isSignedIn) {
                setSupabaseStatus("Waiting for user to sign in...");
                return;
            }

            try {
                setSupabaseStatus("Fetching Clerk JWT token...");
                const token = await getToken({ template: "supabase" });
                if (token) {
                    const supabase = createSupabaseClient(token);
                    setSupabaseStatus("✅ Supabase client ready with Clerk JWT token");
                } else {
                    setSupabaseStatus("❌ No Clerk token available");
                }
            } catch (err) {
                setSupabaseStatus("⚠️ Error requesting token: " + (err as Error).message);
            }
        };

        testSupabaseIntegration();
    }, [getToken, isLoaded, isSignedIn]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-slate-100">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Clerk + Supabase</h1>
                <p className="text-slate-500 mb-8">Authentication Testing Environment</p>

                <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200 min-h-[160px] flex items-center justify-center">
                    <SignedOut>
                        <div className="flex flex-col gap-4 w-full">
                            <p className="text-slate-600 font-medium mb-2">Please sign in to continue</p>
                            <div className="flex justify-center gap-4">
                                <SignInButton mode="modal">
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm">
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 font-medium py-2 px-6 rounded-lg transition-colors shadow-sm">
                                        Sign Up
                                    </button>
                                </SignUpButton>
                            </div>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="p-2 border-2 border-indigo-100 rounded-full">
                                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-16 h-16" } }} />
                            </div>
                            <p className="text-emerald-600 font-medium bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                                You are successfully signed in!
                            </p>
                        </div>
                    </SignedIn>
                </div>

                <div className="text-left bg-slate-800 rounded-lg p-4 font-mono text-sm overflow-hidden">
                    <p className="text-slate-400 mb-1 text-xs uppercase tracking-wide font-semibold">Supabase State</p>
                    <p className={`${supabaseStatus.includes('✅') ? 'text-emerald-400' : supabaseStatus.includes('❌') ? 'text-amber-400' : 'text-slate-300'}`}>
                        {supabaseStatus}
                    </p>
                </div>

                <div className="mt-8 text-sm text-slate-400">
                    This test page is isolated from the main application to ensure safe verification.
                </div>
            </div>
        </div>
    );
}
