import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Share, PlusSquare } from 'lucide-react';
import { toast } from 'sonner';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
        }

        // Capture the install prompt for Android/Desktop
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check for iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
            // Show iOS prompt after a delay, or based on user action (simulated here with delay)
            setTimeout(() => setShowIOSPrompt(true), 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success("Thank you for installing the Digital Quran Academy App!");
        }
        setDeferredPrompt(null);
    };

    if (isStandalone) return null;

    return (
        <>
            {/* Android / Desktop Prompt */}
            {deferredPrompt && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">Install App</h3>
                            <p className="text-sm opacity-90 mt-1">
                                Install our app for a better experience, offline access, and instant updates.
                            </p>
                        </div>
                        <button onClick={() => setDeferredPrompt(null)} className="p-1 hover:bg-primary-foreground/10 rounded" title="Dismiss install prompt" aria-label="Dismiss install prompt">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <Button
                        className="w-full mt-4 bg-white text-primary hover:bg-white/90 font-bold"
                        onClick={handleInstallClick}
                    >
                        Add to Home Screen
                    </Button>
                </div>
            )}

            {/* iOS Prompt */}
            {showIOSPrompt && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-6 pb-8 z-50 animate-in slide-in-from-bottom-10 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg">Install for iOS</h3>
                        <button onClick={() => setShowIOSPrompt(false)} className="p-1 hover:bg-muted rounded text-muted-foreground" title="Close iOS install instructions" aria-label="Close iOS install instructions">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="space-y-4 text-sm text-foreground">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted p-2 rounded-lg"><Share className="h-5 w-5 text-blue-500" /></div>
                            <span>1. Tap the <strong>Share</strong> button in your browser bar.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-muted p-2 rounded-lg"><PlusSquare className="h-5 w-5 text-foreground" /></div>
                            <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
