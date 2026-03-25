import { useState, useEffect } from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

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

// ─── Motor EmbedPDF ────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string {
    if (!url) return '';
    
    // Se for Google Drive
    if (url.includes('drive.google.com')) {
        const id = url.match(/\/file\/d\/(.+?)\//)?.[1] || url.match(/id=(.+?)(&|$)/)?.[1];
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
    }

    // Para Cloudinary e outros, usamos o motor do Google Docs para garantir o Embed no mobile
    // Isso evita o erro de "Falha ao carregar documento PDF"
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

export default function PdfViewer({ url, title, onClose, labels }: PdfViewerProps) {
    const embedUrl = getEmbedUrl(url);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Bloqueia Scroll do Fundo
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const timer = setTimeout(() => {
            if (!loaded) setError(true);
        }, 15000); // 15 segundos para carregar

        return () => { 
            document.body.style.overflow = 'unset'; 
            clearTimeout(timer);
        };
    }, [loaded]);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col h-[100dvh] animate-in fade-in duration-300">
            {/* Top Bar Fixa */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/20 p-2 rounded-xl">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display font-black text-xs md:text-sm truncate uppercase tracking-tight">
                        {title}
                    </h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-full transition-all active:scale-95"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Area do Embed PDF */}
            <div className="flex-1 relative bg-white overflow-hidden">
                {!loaded && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                            {labels.loadingPdf}...
                        </p>
                    </div>
                )}

                {error && !loaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-8 text-center animate-in zoom-in-95">
                        <div className="bg-amber-50 p-6 rounded-full border border-amber-100 mb-6 font-bold text-amber-600">
                            V2.0
                        </div>
                        <h3 className="font-display font-black text-xl text-slate-900 mb-2">O arquivo não abriu?</h3>
                        <p className="text-slate-500 text-sm mb-8 px-4 leading-relaxed">
                            Pode ser cache do seu navegador. Tente limpar o histórico ou usar o botão abaixo para abrir via Google.
                        </p>
                        
                        <div className="flex flex-col w-full gap-3 max-w-xs">
                            <a 
                                href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir via Google Docs
                            </a>
                            <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-full py-4 text-slate-400 font-bold text-sm"
                            >
                                Abrir Link Direto
                            </a>
                        </div>
                    </div>
                )}

                <iframe
                    src={embedUrl}
                    className={`w-full h-full border-none transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onLoad={() => setLoaded(true)}
                    title={title}
                    allow="autoplay"
                />
            </div>
            
            {/* Barra de Ações Mobile (Opcional - Adicione se quiser o botão de download no fundo) */}
            <div className="bg-white border-t border-slate-100 p-4 shrink-0 safe-area-bottom md:hidden">
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm active:scale-95 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                </a>
            </div>
        </div>
    );
}
