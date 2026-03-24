import { useState, useEffect, useRef } from 'react';
import { X, FileText, Download } from 'lucide-react';

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
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
    return `${base}/upload/pg_${page},w_900,f_webp,q_auto/${filePathWithExt}`;
}

// ─── Google Drive Viewer ──────────────────────────────────────────────────────

function GoogleDriveViewer({ embedUrl, title, url, onClose }: {
    embedUrl: string; title: string; url: string; onClose: () => void;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
            {/* Top Bar */}
            <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">{title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl flex items-center justify-center transition-all"
                        title="Abrir no Google Drive"
                    >
                        <Download className="w-4 h-4" />
                    </a>
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
            <div className="flex-1 relative bg-white">
                {!loaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-100 z-10">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                        <p className="text-slate-500 text-sm font-bold">Carregando PDF...</p>
                    </div>
                )}
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-none"
                    title={title}
                    allow="autoplay"
                    onLoad={() => setLoaded(true)}
                />
            </div>
        </div>
    );
}

// ─── Cloudinary Image-Based Viewer ───────────────────────────────────────────

function CloudinaryViewer({ url, title, onClose }: {
    url: string; title: string; onClose: () => void;
}) {
    const [pages, setPages] = useState<number[]>([1]);
    const [failedPage, setFailedPage] = useState<number | null>(null);
    const [firstPageFailed, setFirstPageFailed] = useState(false);

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
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">{title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl flex items-center justify-center transition-all">
                        <Download className="w-4 h-4" />
                    </a>
                    <button onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-800" style={{ WebkitOverflowScrolling: 'touch' }}>
                {firstPageFailed ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center px-8 max-w-sm mx-auto">
                        <FileText className="w-16 h-16 text-white/20" />
                        <div>
                            <p className="text-white font-bold mb-2">Prévia indisponível</p>
                            <p className="text-white/50 text-sm">Faça um novo upload pelo painel Admin ou use um link do Google Drive.</p>
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold w-full text-center">
                            Abrir PDF no navegador
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-0.5 py-2 px-2">
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
                                        Fim · {failedPage - 1} págs.
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
        <div ref={ref} className="w-full max-w-2xl mx-auto">
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

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const driveEmbedUrl = getGoogleDriveEmbedUrl(url);

    if (driveEmbedUrl) {
        // Fast path: Google Drive viewer (works instantly on all devices)
        return <GoogleDriveViewer embedUrl={driveEmbedUrl} title={title} url={url} onClose={onClose} />;
    }

    // Fallback: Cloudinary image-based viewer
    return <CloudinaryViewer url={url} title={title} onClose={onClose} />;
}
