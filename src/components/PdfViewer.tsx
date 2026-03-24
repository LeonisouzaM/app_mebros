import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut } from 'lucide-react';

// Use the bundled worker from the CDN that matches the installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
}

export default function PdfViewer({ url, title, onClose }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(false);
    }, []);

    const onDocumentLoadError = useCallback(() => {
        setLoading(false);
        setError(true);
    }, []);

    // Compute width to fill the screen (minus padding) — mobile first
    const pageWidth = Math.min(window.innerWidth - 16, 900);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col" style={{ overscrollBehavior: 'contain' }}>

            {/* ── Top Bar ── */}
            <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-white font-bold text-sm truncate max-w-[200px] md:max-w-xs">{title}</span>
                    {numPages > 0 && (
                        <span className="text-white/40 text-xs font-bold hidden sm:block">
                            — {currentPage}/{numPages}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom controls (desktop) */}
                    <button
                        onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))}
                        className="hidden md:flex w-9 h-9 bg-white/5 hover:bg-white/10 text-white rounded-xl items-center justify-center transition-all"
                        title="Reduzir"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setScale(s => Math.min(2.5, +(s + 0.25).toFixed(2)))}
                        className="hidden md:flex w-9 h-9 bg-white/5 hover:bg-white/10 text-white rounded-xl items-center justify-center transition-all"
                        title="Ampliar"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ── PDF Content ── */}
            <div className="flex-1 overflow-auto bg-slate-800" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="flex flex-col items-center py-4 px-2 gap-4">

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-white/50">
                            <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest">Carregando PDF...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col items-center gap-6 py-20 text-center px-8">
                            <FileText className="w-16 h-16 text-white/20" />
                            <div>
                                <p className="text-white font-bold mb-2">Não foi possível carregar o PDF</p>
                                <p className="text-white/50 text-sm">Tente abrir no seu navegador diretamente.</p>
                            </div>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                            >
                                Abrir PDF
                            </a>
                        </div>
                    )}

                    {/* PDF Pages */}
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={null}
                        error={null}
                    >
                        <Page
                            pageNumber={currentPage}
                            width={pageWidth}
                            scale={scale}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            className="shadow-2xl"
                            loading={
                                <div className="w-full bg-white flex items-center justify-center" style={{ height: Math.round(pageWidth * 1.414) }}>
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                                </div>
                            }
                        />
                    </Document>
                </div>
            </div>

            {/* ── Bottom Navigation ── */}
            {numPages > 0 && (
                <div className="w-full h-16 bg-slate-900 border-t border-white/10 flex items-center justify-between px-4 shrink-0">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 disabled:opacity-30 text-white rounded-xl font-bold text-sm hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="hidden sm:block">Anterior</span>
                    </button>

                    <div className="text-white text-sm font-bold bg-white/10 px-5 py-2 rounded-xl">
                        {currentPage} / {numPages}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                        disabled={currentPage === numPages}
                        className="flex items-center gap-2 px-4 py-2 bg-primary disabled:opacity-30 disabled:bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-primary-hover active:scale-95 transition-all"
                    >
                        <span className="hidden sm:block">Próxima</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
