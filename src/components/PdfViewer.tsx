import { useState, useEffect, useRef, useCallback } from 'react';
import { X, FileText, ZoomIn, ZoomOut } from 'lucide-react';

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
    // Matches patterns like:
    //   https://drive.google.com/file/d/FILE_ID/view
    //   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    //   https://drive.google.com/open?id=FILE_ID
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

/** Get Cloudinary page image URL */
function getCloudinaryPageUrl(pdfUrl: string, page: number): string {
    if (!pdfUrl) return '';
    const normalized = pdfUrl
        .replace('/raw/upload/', '/image/upload/')
        .replace('/video/upload/', '/image/upload/');
    const parts = normalized.split('/upload/');
    if (parts.length !== 2) return '';
    const [base, filePath] = parts;
    const filePathWithExt = filePath.replace(/\.pdf$/i, '.jpg');
    return `${base}/upload/pg_${page},w_800,f_webp,q_auto/${filePathWithExt}`;
}

// ─── Google Drive Viewer ──────────────────────────────────────────────────────

function GoogleDriveViewer({ embedUrl, title, onClose, preloaded, labels }: {
    embedUrl: string; title: string; onClose: () => void; preloaded?: boolean;
    labels: PdfViewerProps['labels'];
}) {
    const [loaded, setLoaded] = useState(preloaded ?? false);
    const [timedOut, setTimedOut] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Cleanup iframe on unmount to release resources
        return () => {
            if (iframeRef.current) {
                try { iframeRef.current.src = 'about:blank'; } catch(e) {}
            }
        };
    }, []);

    useEffect(() => {
        if (!loaded) {
            const timer = setTimeout(() => {
                if (!loaded) setTimedOut(true);
            }, 10000); // 10s fallback
            return () => clearTimeout(timer);
        }
    }, [loaded]);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col">
            {/* Top Bar */}
            <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">{title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Google Drive iframe */}
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
                        <a href={embedUrl.replace('/preview', '/view')} target="_blank" rel="noopener noreferrer"
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold w-full max-w-xs shadow-lg">
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

// ─── Cloudinary Image-Based Viewer ───────────────────────────────────────────

function CloudinaryViewer({ url, title, onClose, labels }: {
    url: string; title: string; onClose: () => void; labels: PdfViewerProps['labels'];
}) {
    const [pages, setPages] = useState<number[]>([1]);
    const [failedPage, setFailedPage] = useState<number | null>(null);
    const [firstPageFailed, setFirstPageFailed] = useState(false);
    
    // Zoom State
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Pinch to zoom state
    const pinchStartRef = useRef<number>(0);
    const initialZoomRef = useRef<number>(1);
    const rafRef = useRef<number | null>(null);
    
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleZoomReset = () => setZoom(1);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
            pinchStartRef.current = dist;
            initialZoomRef.current = zoom;
        }
    }, [zoom]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && pinchStartRef.current > 0) {
            // Throttle via requestAnimationFrame to prevent excessive re-renders on mobile
            if (rafRef.current !== null) return;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
            const ratio = dist / pinchStartRef.current;
            const newZoom = Math.min(Math.max(initialZoomRef.current * ratio, 0.5), 3);
            rafRef.current = requestAnimationFrame(() => {
                setZoom(newZoom);
                rafRef.current = null;
            });
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        pinchStartRef.current = 0;
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const handlePageLoad = (page: number) => {
        if (page < 60 && failedPage === null) {
            setPages(prev => prev.includes(page + 1) ? prev : [...prev, page + 1]);
        }
    };

    const handlePageError = (page: number) => {
        if (page === 1) setFirstPageFailed(true);
        else setFailedPage(page);
    };

    const visiblePages = pages.filter(p => failedPage === null || p < failedPage);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
            <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden mr-4">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">{title}</span>
                </div>
                
                {/* Zoom Controls Overlay (Top Desktop / Mobile Responsive) */}
                {!firstPageFailed && (
                    <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1">
                        <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Zoom -">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button onClick={handleZoomReset} className="px-2.5 py-1 text-[10px] text-white/50 font-bold hover:text-white border-x border-white/5" title="Restaurar">
                            {Math.round(zoom * 100)}%
                        </button>
                        <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Zoom +">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div 
                ref={containerRef}
                className="flex-1 overflow-auto bg-slate-800 touch-pan-x touch-pan-y" 
                style={{ WebkitOverflowScrolling: 'touch' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {firstPageFailed ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center px-8 max-w-sm mx-auto">
                        <FileText className="w-16 h-16 text-white/20" />
                        <div>
                            <p className="text-white font-bold mb-2">{labels.previewUnavailable}</p>
                            <p className="text-white/50 text-sm">{labels.previewUnavailableDesc}</p>
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold w-full text-center">
                            {labels.openPdfBrowser}
                        </a>
                    </div>
                ) : (
                    <div 
                        className="flex flex-col items-center gap-0.5 py-4 px-2 bg-slate-800 min-h-full transition-transform duration-75 origin-top"
                        style={{ width: `${Math.max(100, 100 * zoom)}%`, minWidth: '100%' }}
                    >
                        {visiblePages.map(page => (
                            <PdfPageImage
                                key={page}
                                src={getCloudinaryPageUrl(url, page)}
                                page={page}
                                onLoad={() => handlePageLoad(page)}
                                onError={() => handlePageError(page)}
                            />
                        ))}
                        {failedPage !== null && failedPage > 1 && (
                            <div className="py-10 text-center">
                                <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-6 py-3">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                                        {labels.endOfDoc} · {failedPage - 1} {labels.pages}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function PdfPageImage({ src, page, onLoad, onError }: {
    src: string; page: number; onLoad: () => void; onError: () => void;
}) {
    const [visible, setVisible] = useState(page === 1);
    const [loaded, setLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible) return;
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { rootMargin: '400px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div ref={ref} className="w-full mx-auto">
            {(!visible || !loaded) && (
                <div className="w-full bg-white/5 rounded-sm flex items-center justify-center" style={{ minHeight: page === 1 ? '70vh' : '60vh' }}>
                    {visible && <div className="w-7 h-7 border-4 border-white/10 border-t-primary rounded-full animate-spin" />}
                </div>
            )}
            {visible && (
                <img
                    src={src}
                    alt={`Página ${page}`}
                    className={`w-full h-auto shadow-lg ${loaded ? 'block' : 'hidden'}`}
                    onLoad={() => { setLoaded(true); onLoad(); }}
                    onError={onError}
                />
            )}
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function PdfViewer({ url, title, onClose, preloaded, labels }: PdfViewerProps) {
    // Lock body scroll — iOS PWA-safe technique
    useEffect(() => {
        const scrollY = window.scrollY;
        const body = document.body;
        const originalPosition = body.style.position;
        const originalTop = body.style.top;
        const originalWidth = body.style.width;
        const originalOverflow = body.style.overflow;

        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';

        return () => {
            body.style.overflow = originalOverflow;
            body.style.position = originalPosition;
            body.style.top = originalTop;
            body.style.width = originalWidth;
            // Restore scroll position
            window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
        };
    }, []);

    const driveEmbedUrl = getGoogleDriveEmbedUrl(url);

    if (driveEmbedUrl) {
        return <GoogleDriveViewer embedUrl={driveEmbedUrl} title={title} onClose={onClose} preloaded={preloaded} labels={labels} />;
    }

    // Fallback: Cloudinary image-based viewer
    return <CloudinaryViewer url={url} title={title} onClose={onClose} labels={labels} />;
}
