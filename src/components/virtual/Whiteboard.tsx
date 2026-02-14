import React, { useRef, useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

// Lazy-load Excalidraw to reduce initial bundle size
const Excalidraw = lazy(() =>
    import('@excalidraw/excalidraw').then((mod) => ({
        default: mod.Excalidraw,
    })),
);

interface WhiteboardProps {
    isTeacher: boolean;
    sessionId: string;
    onSaveSnapshot?: (blob: Blob) => Promise<void>;
}

export function Whiteboard({
    isTeacher,
    sessionId,
    onSaveSnapshot,
}: WhiteboardProps) {
    const [exporting, setExporting] = useState(false);
    const excalidrawRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleExport = async () => {
        if (!excalidrawRef.current || !onSaveSnapshot) return;

        try {
            setExporting(true);
            const { exportToBlob } = await import('@excalidraw/excalidraw');
            const elements = excalidrawRef.current.getSceneElements();
            const appState = excalidrawRef.current.getAppState();
            const files = excalidrawRef.current.getFiles();

            const blob = await exportToBlob({
                elements,
                appState: { ...appState, exportWithDarkMode: false },
                files,
                mimeType: 'image/png',
            });

            await onSaveSnapshot(blob);
        } catch (err) {
            console.error('Whiteboard export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            {isTeacher && (
                <div className="flex items-center justify-end p-2 border-b">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-1" />
                        )}
                        Save Snapshot
                    </Button>
                </div>
            )}

            {/* Excalidraw Canvas */}
            <div className="flex-1 min-h-0">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Loading whiteboard…
                        </div>
                    }
                >
                    <Excalidraw
                        ref={excalidrawRef}
                        theme="light"
                        UIOptions={{
                            canvasActions: {
                                saveToActiveFile: false,
                                loadScene: false,
                                export: false,
                            },
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
}
