import { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Download } from 'lucide-react';

interface PdfViewerProps {
    url: string;
    title: string;
    onClose: () => void;
    labels: {
        loadingPdf: string;
        previewUnavailable: string;
        previewUnavailableDesc: string;
        openPdfBrowser: string;
    };
}

// ─── Funções de Auxílio ──────────────────────────────────────────────────────

function getRawPdfUrl(url: string): string {
    if (!url) return '';
    return url;
}

function getEmbedUrl(url: string): string {
    if (!url) return '';
    
    // Google Drive
    if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/file\/d\/(.+?)\//)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1];
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    // Cloudinary ou Vercel (Embed Direto)
    return url;
}

// ─── Componente Principal ───────────────────────────────────────────────────

export default function PdfViewer({ url, title, onClose, labels }: PdfViewerProps) {
    const embedUrl = getEmbedUrl(url);
    const rawUrl = getRawPdfUrl(url);
    const [loaded, setLoaded] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loaded) setTimedOut(true);
        }, 12000); // 12 segundos para timeout
        return () => clearTimeout(timer);
    }, [loaded]);

    // Bloqueia Scroll do Fundo
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col h-[100dvh] animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/20 p-2 rounded-xl">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display font-black text-sm truncate uppercase tracking-tight">
                        {title}
                    </h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-full transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Viewer */}
            <div className="flex-1 relative bg-white">
                {!loaded && !timedOut && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{labels.loadingPdf}</p>
                    </div>
                )}

                {timedOut && !loaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-8 text-center">
                        <div className="bg-amber-50 p-6 rounded-full border border-amber-100 mb-6">
                            <FileText className="w-12 h-12 text-amber-500" />
                        </div>
                        <h3 className="font-display font-black text-xl text-slate-900 mb-2">{labels.previewUnavailable}</h3>
                        <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Tente abrir o arquivo diretamente no navegador ou via Google docs abaixo.</p>
                        
                        <div className="flex flex-col w-full gap-3 max-w-xs">
                            <a 
                                href={`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir via Google Docs
                            </a>
                            <a 
                                href={rawUrl} 
                                download
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold active:scale-95 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Arquivo
                            </a>
                        </div>
                    </div>
                )}

                <iframe
                    src={embedUrl}
                    className={`w-full h-full border-none transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onLoad={() => setLoaded(true)}
                />
            </div>
        </div>
    );
}
