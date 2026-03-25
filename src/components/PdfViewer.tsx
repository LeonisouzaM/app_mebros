import { useState, useEffect } from 'react';
import { X, FileText, Search, ZoomIn, ZoomOut, Download, AlertCircle, ChevronDown, ChevronUp, Maximize2, ExternalLink } from 'lucide-react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { ptBR } from '@react-pdf-viewer/localization';

// Import Styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
    labels: {
        loadingPdf: string;
        previewUnavailable: string;
        previewUnavailableDesc: string;
        openPdfBrowser: string;
        [key: string]: string;
    };
}

// ─── Componente Principal (De Volta ao Profissional) ────────────────────────

export default function PdfViewer({ url, title, onClose, labels }: PdfViewerProps) {
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialiaze the default layout plugin
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [], // UI Limpa sem sidebar
    });

    // Bloqueia Scroll do Fundo
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col h-[100dvh] animate-in fade-in duration-300">
            {/* Header / Top Bar */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 z-10 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/20 p-2 rounded-xl">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-slate-800 rounded-full transition-all active:scale-90"
                        aria-label="Fecar visualizador"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-hidden bg-white relative">
                {isLoading && !loadError && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white gap-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Preparando Documento...</p>
                    </div>
                )}

                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    {loadError ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-6 bg-white animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                                <FileText className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-slate-900 font-display font-black text-xl leading-tight">{labels.previewUnavailable}</h3>
                                <p className="text-slate-500 text-sm max-w-xs font-medium px-4">Seu celular pode ter dificuldades com o visualizador avançado para este PDF.</p>
                            </div>
                            
                            <div className="flex flex-col w-full gap-3 max-w-sm px-4">
                                {/* Fallback: Visualizador do Google */}
                                <a 
                                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn-primary w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all py-4"
                                >
                                    Abrir com Visualizador Google
                                </a>

                                <a href={url} target="_blank" rel="noopener noreferrer" className="w-full py-4 px-6 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all text-center">
                                    {labels.openPdfBrowser}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full">
                            <Viewer
                                fileUrl={url}
                                plugins={[defaultLayoutPluginInstance]}
                                theme="light"
                                localization={ptBR}
                                defaultScale={SpecialZoomLevel.PageFit}
                                onDocumentLoad={() => {
                                    setIsLoading(false);
                                    setLoadError(false);
                                }}
                                //@ts-ignore
                                onException={(e) => {
                                    console.error('ERRO PDF:', e.message);
                                    setIsLoading(false);
                                    setLoadError(true);
                                }}
                            />
                        </div>
                    )}
                </Worker>
            </div>
        </div>
    );
}
