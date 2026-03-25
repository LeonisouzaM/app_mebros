import { useState, useEffect, useRef, useCallback } from 'react';
import { X, FileText } from 'lucide-react';
import { PDFViewer } from '@embedpdf/react-pdf-viewer';

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
    preloaded?: boolean;
    labels: {
        loadingPdf: string;
        previewUnavailable: string;
        previewUnavailableDesc: string;
        openPdfBrowser: string;
        endOfDoc: string;
        pages: string;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Detect if a URL is a Google Drive link and extract the embed URL */
function getGoogleDriveEmbedUrl(url: string): string | null {
    const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    const openIdMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openIdMatch) {
        return `https://drive.google.com/file/d/${openIdMatch[1]}/preview`;
    }
    return null;
}

/** Ensure Cloudinary URL points to the raw PDF (not the image transform) */
function getRawPdfUrl(url: string): string {
    if (!url) return '';
    // Revert any image-upload transforms back to raw
    return url
        .replace('/image/upload/', '/raw/upload/')
        .replace('/video/upload/', '/raw/upload/');
}

// ─── iOS PWA-safe scroll lock / unlock ────────────────────────────────────────

function useScrollLock() {
    useEffect(() => {
        const scrollY = window.scrollY;
        const body = document.body;
        const prevPosition = body.style.position;
        const prevTop = body.style.top;
        const prevWidth = body.style.width;
        const prevOverflow = body.style.overflow;

        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';

        return () => {
            body.style.overflow = prevOverflow;
            body.style.position = prevPosition;
            body.style.top = prevTop;
            body.style.width = prevWidth;
            window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
        };
    }, []);
}

// ─── Shared Top Bar ───────────────────────────────────────────────────────────

function ViewerTopBar({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span className="text-white font-semibold text-sm truncate">{title}</span>
            </div>
            <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0 ml-2"
                aria-label="Fechar"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

// ─── Google Drive Viewer (iframe) ─────────────────────────────────────────────

function GoogleDriveViewer({ embedUrl, title, onClose, preloaded, labels }: {
    embedUrl: string; title: string; onClose: () => void; preloaded?: boolean;
    labels: PdfViewerProps['labels'];
}) {
    useScrollLock();
    const [loaded, setLoaded] = useState(preloaded ?? false);
    const [timedOut, setTimedOut] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        return () => {
            if (iframeRef.current) {
                try { iframeRef.current.src = 'about:blank'; } catch (e) { /* ignore */ }
            }
        };
    }, []);

    useEffect(() => {
        if (!loaded) {
            const timer = setTimeout(() => {
                if (!loaded) setTimedOut(true);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [loaded]);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col">
            <ViewerTopBar title={title} onClose={onClose} />

            <div className="flex-1 relative bg-white overflow-hidden">
                {!loaded && !timedOut && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-100 z-10">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                        <p className="text-slate-500 text-sm font-bold">{labels.loadingPdf}</p>
                    </div>
                )}
                {timedOut && !loaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-100 z-20 p-8 text-center">
                        <FileText className="w-16 h-16 text-slate-300" />
                        <div>
                            <p className="text-slate-800 font-bold mb-2">{labels.previewUnavailable}</p>
                            <p className="text-slate-500 text-sm">{labels.previewUnavailableDesc}</p>
                        </div>
                        <a
                            href={embedUrl.replace('/preview', '/view')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold w-full max-w-xs shadow-lg"
                        >
                            {labels.openPdfBrowser}
                        </a>
                        <button onClick={onClose} className="text-sm text-slate-400 font-bold hover:text-slate-600">
                            Voltar
                        </button>
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className={`absolute inset-0 w-full h-full border-none transform-gpu transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    title={title}
                    allow="autoplay"
                    onLoad={() => { setLoaded(true); setTimedOut(false); }}
                />
            </div>
        </div>
    );
}

// ─── EmbedPDF Viewer (Cloudinary / Direct URL) ────────────────────────────────

function EmbedPdfViewer({ url, title, onClose, labels }: {
    url: string; title: string; onClose: () => void;
    labels: PdfViewerProps['labels'];
}) {
    useScrollLock();
    const [loadError, setLoadError] = useState(false);
    const rawUrl = getRawPdfUrl(url);

    // Handle Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (loadError) {
        return (
            <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col">
                <ViewerTopBar title={title} onClose={onClose} />
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center bg-slate-800">
                    <FileText className="w-16 h-16 text-white/20" />
                    <div>
                        <p className="text-white font-bold mb-2">{labels.previewUnavailable}</p>
                        <p className="text-white/50 text-sm">{labels.previewUnavailableDesc}</p>
                    </div>
                    <a
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-bold w-full max-w-xs text-center"
                    >
                        {labels.openPdfBrowser}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col">
            <ViewerTopBar title={title} onClose={onClose} />

            {/* EmbedPDF renders the actual PDF via PDFium (WebAssembly) */}
            <div className="flex-1 overflow-hidden">
                <PDFViewer
                    config={{
                        src: rawUrl,
                        theme: { preference: 'light' },
                    }}
                    style={{ width: '100%', height: '100%' }}
                    onError={() => setLoadError(true)}
                />
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function PdfViewer({ url, title, onClose, preloaded, labels }: PdfViewerProps) {
    const driveEmbedUrl = getGoogleDriveEmbedUrl(url);

    if (driveEmbedUrl) {
        return (
            <GoogleDriveViewer
                embedUrl={driveEmbedUrl}
                title={title}
                onClose={onClose}
                preloaded={preloaded}
                labels={labels}
            />
        );
    }

    // EmbedPDF for all direct/Cloudinary PDF URLs
    return (
        <EmbedPdfViewer
            url={url}
            title={title}
            onClose={onClose}
            labels={labels}
        />
    );
}
