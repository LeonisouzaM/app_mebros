import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { Viewer, Worker, SpecialZoomLevel, type LocalizationMap } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// `@react-pdf-viewer/locales` doesn't expose a package entrypoint (no main/exports),
// so we import the JSON locale file directly to keep Vite/Rollup builds working.
import ptPT from '@react-pdf-viewer/locales/lib/pt_PT.json';

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

export default function PdfViewer({ url, title, onClose, labels }: PdfViewerProps) {
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [],
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-sm flex flex-col h-[100dvh] animate-in fade-in duration-300">
            {/* Glass Header */}
            <div className="glass-effect px-4 py-3 flex items-center justify-between shrink-0 z-10 mx-4 mt-4 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 leading-tight">
                        <h2 className="font-display font-black text-[11px] md:text-sm truncate uppercase tracking-widest text-slate-800">
                            {title}
                        </h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Visualizador Seguro</span>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all active:scale-90 shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-hidden bg-white/50 m-4 rounded-[32px] shadow-2xl relative border border-white/20">
                {isLoading && !loadError && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md gap-4">
                        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin shadow-lg shadow-primary/10" />
                        <div className="text-center">
                            <p className="text-slate-800 text-xs font-black uppercase tracking-widest">
                               Preparando Documento...
                            </p>
                        </div>
                    </div>
                )}

                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    {loadError ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-8 bg-white animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center border border-amber-100 shadow-xl shadow-amber-500/10 transition-transform hover:rotate-12">
                                <FileText className="w-10 h-10 text-amber-500" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-slate-900 font-display font-black text-2xl tracking-tight leading-tight">{labels.previewUnavailable}</h3>
                                <p className="text-slate-500 text-sm max-w-[280px] font-medium mx-auto px-4">Este arquivo pode ser muito grande ou complexo para este visualizador no celular.</p>
                            </div>
                            <div className="flex flex-col w-full gap-4 max-w-sm px-4">
                                <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center gap-2">
                                    Abrir com Visualizador Google
                                </a>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="w-full py-4 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
                                    {labels.openPdfBrowser}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full rounded-[30px] overflow-hidden">
                            <Viewer
                                fileUrl={url}
                                plugins={[defaultLayoutPluginInstance]}
                                theme="light"
                                localization={ptPT as unknown as LocalizationMap}
                                defaultScale={SpecialZoomLevel.PageFit}
                                onDocumentLoad={() => {
                                    setIsLoading(false);
                                    setLoadError(false);
                                }}
                                //@ts-ignore
                                onException={() => {
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
