import { useState, useEffect, useRef } from 'react';
import { X, FileText, Download } from 'lucide-react';

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
}

function getPageImageUrl(pdfUrl: string, page: number): string {
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

// Pre-generate URLs for pages 1..maxPages, stop rendering once an image 404s
const MAX_PAGES = 60;

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
    const [pages, setPages] = useState<number[]>([1]); // pages to render
    const [failedPage, setFailedPage] = useState<number | null>(null);
    const [firstPageFailed, setFirstPageFailed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handlePageLoad = (page: number) => {
        // Successfully loaded — queue the next page if we haven't hit the limit
        if (page < MAX_PAGES && failedPage === null) {
            setPages(prev => prev.includes(page + 1) ? prev : [...prev, page + 1]);
        }
    };

    const handlePageError = (page: number) => {
        if (page === 1) {
            setFirstPageFailed(true);
        } else {
            setFailedPage(page);
        }
    };

    const visiblePages = pages.filter(p => failedPage === null || p < failedPage);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col" style={{ overscrollBehavior: 'contain' }}>

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
                        title="Baixar PDF"
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

            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-slate-800"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {firstPageFailed ? (
                    /* First page failed: old 'raw' upload */
                    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center px-8 max-w-sm mx-auto">
                        <FileText className="w-16 h-16 text-white/20" />
                        <div>
                            <p className="text-white font-bold mb-2 text-lg">Prévia indisponível</p>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Este PDF foi hospedado em um formato antigo.
                                Por favor, <strong className="text-primary">faça um novo upload</strong> pelo painel Admin para ativar a visualização.
                            </p>
                        </div>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all w-full text-center"
                        >
                            Abrir PDF no navegador
                        </a>
                    </div>
                ) : (
                    /* All pages stacked vertically, infinite scroll */
                    <div className="flex flex-col items-center gap-0.5 py-2 px-2">
                        {visiblePages.map(page => (
                            <PdfPage
                                key={page}
                                src={getPageImageUrl(url, page)}
                                page={page}
                                onLoad={() => handlePageLoad(page)}
                                onError={() => handlePageError(page)}
                            />
                        ))}

                        {/* End of document (or still loading) */}
                        {failedPage !== null && failedPage > 1 && (
                            <div className="py-10 text-center">
                                <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-6 py-3">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                                        Fim do documento · {failedPage - 1} {failedPage - 1 === 1 ? 'página' : 'páginas'}
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

/* Individual Page — lazy loaded when in viewport */
function PdfPage({ src, page, onLoad, onError }: { src: string; page: number; onLoad: () => void; onError: () => void }) {
    const [visible, setVisible] = useState(page === 1); // first page loads immediately
    const [loaded, setLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // IntersectionObserver: load image only when near viewport (lazy)
    useEffect(() => {
        if (visible) return;
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { rootMargin: '400px' } // start loading 400px before visible
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div ref={ref} className="w-full max-w-2xl mx-auto">
            {/* Placeholder skeleton while not yet visible or loading */}
            {(!visible || !loaded) && (
                <div
                    className="w-full bg-white/5 rounded-sm flex items-center justify-center"
                    style={{ minHeight: page === 1 ? '70vh' : '60vh' }}
                >
                    {visible && (
                        <div className="w-7 h-7 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
                    )}
                </div>
            )}
            {visible && (
                <img
                    src={src}
                    alt={`Página ${page}`}
                    className={`w-full h-auto shadow-lg ${loaded ? 'block' : 'hidden'}`}
                    onLoad={() => { setLoaded(true); onLoad(); }}
                    onError={onError}
                    style={{ imageRendering: 'auto' }}
                />
            )}
        </div>
    );
}
