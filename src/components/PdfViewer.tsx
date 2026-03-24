import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
}

/**
 * Converts a Cloudinary PDF URL to a specific page image URL.
 * Works for both 'image' and 'raw' resource types.
 * Cloudinary's pg_ transformation renders the PDF server-side and returns a high-quality image.
 * This avoids ALL CORS/iframe/mobile issues entirely.
 */
function getPageImageUrl(pdfUrl: string, page: number): string {
    if (!pdfUrl) return '';

    // Normalize: ensure we're going through the 'image' delivery pipeline
    const normalized = pdfUrl
        .replace('/raw/upload/', '/image/upload/')
        .replace('/video/upload/', '/image/upload/');

    const parts = normalized.split('/upload/');
    if (parts.length !== 2) return pdfUrl;

    const [base, filePath] = parts;

    // Remove any existing transformation parameters before adding ours
    const filePathClean = filePath.replace(/^v\d+\//, match => match); // keep version

    // Build the Cloudinary transformation:
    // pg_{n}  = render page N of the PDF
    // w_900   = 900px wide (fits any phone portrait screen)
    // f_webp  = serve as WebP for smaller file size
    // q_auto  = automatic quality optimization
    const transformation = `pg_${page},w_900,f_webp,q_auto`;

    // Replace .pdf extension with .jpg (Cloudinary needs this for the transformation pipeline)
    const filePathWithExt = filePathClean.replace(/\.pdf$/i, '.jpg');

    return `${base}/upload/${transformation}/${filePathWithExt}`;
}

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState<number | null>(null); // unknown until we hit a 404
    const [isLastPage, setIsLastPage] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasFailed, setHasFailed] = useState(false);

    // Update image src whenever page changes
    useEffect(() => {
        const newSrc = getPageImageUrl(url, currentPage);
        setImgSrc(newSrc);
        setIsLoading(true);
        setHasFailed(false);
    }, [url, currentPage]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasFailed(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        if (currentPage === 1) {
            // First page failed — PDF might not be uploaded as 'image' type
            setHasFailed(true);
        } else {
            // Page N failed — we reached the last page
            setIsLastPage(true);
            setTotalPages(currentPage - 1);
            setCurrentPage(prev => Math.max(1, prev - 1));
        }
    };

    const goNext = () => {
        if (!isLastPage) setCurrentPage(p => p + 1);
    };

    const goPrev = () => {
        if (currentPage > 1) {
            setIsLastPage(false);
            setCurrentPage(p => p - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col" style={{ overscrollBehavior: 'contain' }}>

            {/* ── Top Bar ── */}
            <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-white font-semibold text-sm truncate">{title}</span>
                    {totalPages && (
                        <span className="text-white/40 text-xs font-bold ml-1 hidden sm:block">
                            ({currentPage}/{totalPages})
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <a
                        href={url}
                        download
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

            {/* ── Page Display ── */}
            <div
                className="flex-1 overflow-y-auto bg-slate-800 flex flex-col items-center py-4 px-2"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {/* Failed to load (first page) */}
                {hasFailed && (
                    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center px-8 max-w-sm">
                        <FileText className="w-16 h-16 text-white/20" />
                        <div>
                            <p className="text-white font-bold mb-2 text-lg">Prévia indisponível</p>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Este PDF foi hospedado em um formato antigo. Por favor,{' '}
                                <strong className="text-primary">faça um novo upload</strong> pelo painel Admin para ativar a visualização.
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
                )}

                {/* Page Image */}
                {!hasFailed && (
                    <div className="w-full max-w-2xl relative">
                        {/* Loading Skeleton */}
                        {isLoading && (
                            <div
                                className="w-full bg-white/5 rounded-lg flex items-center justify-center"
                                style={{ minHeight: '60vh' }}
                            >
                                <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}

                        {/* The PDF page rendered as an image by Cloudinary */}
                        <img
                            key={`${url}-${currentPage}`}
                            src={imgSrc}
                            alt={`Página ${currentPage}`}
                            className={`w-full h-auto rounded-lg shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-0 absolute top-0' : 'opacity-100'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                    </div>
                )}
            </div>

            {/* ── Bottom Navigation ── */}
            {!hasFailed && (
                <div className="w-full h-16 bg-slate-900 border-t border-white/10 flex items-center justify-between px-4 shrink-0">
                    <button
                        onClick={goPrev}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 disabled:opacity-25 text-white rounded-xl font-bold text-sm hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="hidden sm:block">Anterior</span>
                    </button>

                    <div className="text-white/60 text-sm font-bold tabular-nums">
                        {totalPages ? `${currentPage} / ${totalPages}` : `Página ${currentPage}`}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={isLastPage || currentPage === totalPages}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary disabled:opacity-25 disabled:bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-primary-hover active:scale-95 transition-all"
                    >
                        <span className="hidden sm:block">Próxima</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
