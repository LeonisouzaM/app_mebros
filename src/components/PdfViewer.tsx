import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { Worker, Viewer, SpecialZoomLevel, type LocalizationMap } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

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

function getGoogleDriveEmbedUrl(url: string): string | null {
    const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    const openIdMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openIdMatch) return `https://drive.google.com/file/d/${openIdMatch[1]}/preview`;
    return null;
}

function getRawPdfUrl(url: string): string {
    if (!url) return '';
    
    // Simplificamos para usar a URL original do banco. 
    // Muitas vezes, forçar /raw/upload causa erros de permissão se o arquivo foi carregado como 'image' ou 'auto'.
    return url;
}

// ─── Pt-BR Localization ──────────────────────────────────────────────────────

const ptBR: LocalizationMap = {
    core: {
        download: 'Baixar',
        print: 'Imprimir',
        search: 'Pesquisar',
        zoom: 'Zoom',
        nextPage: 'Próxima página',
        previousPage: 'Página anterior',
        fullScreen: 'Tela cheia',
        enterPassword: 'Digite a senha',
    },
    defaultLayout: {
        toolbar: {
            download: 'Baixar arquivo',
            print: 'Imprimir arquivo',
            fullScreen: 'Ver em tela cheia',
            search: 'Pesquisar',
            zoom: 'Zoom',
        }
    }
};

// ─── iOS Scroll Lock ─────────────────────────────────────────────────────────

function useScrollLock(onClose?: () => void) {
    useEffect(() => {
        const scrollY = window.scrollY;
        const body = document.body;
        const prevStyle = {
            position: body.style.position,
            top: body.style.top,
            width: body.style.width,
            overflow: body.style.overflow,
            overscrollBehavior: body.style.overscrollBehavior
        };

        // Prevent scrolling and "bounce" on mobile
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        body.style.overscrollBehavior = 'none';

        // Handle Android/Mobile Back Button (popstate)
        const handlePopState = (e: PopStateEvent) => {
            if (onClose) {
                e.preventDefault();
                onClose();
            }
        };

        // Push a state to detect back button
        window.history.pushState({ pdfOpen: true }, '');
        window.addEventListener('popstate', handlePopState);

        return () => {
            Object.assign(body.style, prevStyle);
            window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior });
            window.removeEventListener('popstate', handlePopState);
            
            // Clean up the history state if we close via the UI (Close button)
            if (window.history.state?.pdfOpen) {
                window.history.back();
            }
        };
    }, [onClose]);
}

// ─── Shared Components ───────────────────────────────────────────────────────

function ViewerTopBar({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div className="w-full h-14 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 shrink-0 z-[101]">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                </div>
                <span className="text-white font-semibold text-sm truncate">{title}</span>
            </div>
            <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}

// ─── Google Drive Fallback ───────────────────────────────────────────────────

function GoogleDriveViewer({ embedUrl, title, onClose, preloaded, labels }: {
    embedUrl: string; title: string; onClose: () => void; preloaded?: boolean;
    labels: PdfViewerProps['labels'];
}) {
    useScrollLock(onClose);
    const [loaded, setLoaded] = useState(preloaded ?? false);
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!loaded) {
            const timer = setTimeout(() => setTimedOut(true), 12000);
            return () => clearTimeout(timer);
        }
    }, [loaded]);

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col h-[100dvh] animate-in fade-in duration-300">
            <ViewerTopBar title={title} onClose={onClose} />
            <div className="flex-1 relative bg-white">
                {!loaded && !timedOut && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-bold text-sm">{labels.loadingPdf}</p>
                    </div>
                )}
                <iframe
                    src={embedUrl}
                    className={`w-full h-full border-none transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setLoaded(true)}
                />
            </div>
        </div>
    );
}

// ─── React PDF Viewer (Core) ─────────────────────────────────────────────────

function ReactPdfViewer({ url, title, onClose, labels }: {
    url: string; title: string; onClose: () => void;
    labels: PdfViewerProps['labels'];
}) {
    useScrollLock(onClose);
    const [loadError, setLoadError] = useState(false);
    const rawUrl = getRawPdfUrl(url);

    // Initialiaze the default layout plugin
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [], // Hide sidebar for cleaner look
    });

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col h-[100dvh] animate-in fade-in duration-300">
            <ViewerTopBar title={title} onClose={onClose} />
            
            <div className="flex-1 overflow-hidden bg-slate-100">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    {loadError ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-6 bg-white">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                                <FileText className="w-10 h-10 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-slate-900 font-display font-black text-xl">{labels.previewUnavailable}</h3>
                                <p className="text-slate-500 text-sm max-w-xs font-medium">Este arquivo pode ter restrições de acesso ou ser muito pesado para o celular.</p>
                            </div>
                            
                            <div className="flex flex-col w-full gap-3 max-w-sm px-4">
                                {/* Botão para o visualizador do Google (mais compatível) */}
                                <a 
                                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn-primary w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                >
                                    Abrir com Visualizador Google
                                </a>

                                <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-6 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">
                                    {labels.openPdfBrowser}
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full">
                            <Viewer
                                fileUrl={rawUrl}
                                plugins={[defaultLayoutPluginInstance]}
                                theme="light"
                                localization={ptBR}
                                defaultScale={SpecialZoomLevel.PageFit}
                                onDocumentLoad={() => setLoadError(false)}
                                //@ts-ignore
                                onException={(e) => {
                                    console.error('PDF Load Error:', e);
                                    // Se der 401 ou erro de rede, ativamos o fallback
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

export default function PdfViewer(props: PdfViewerProps) {
    const driveEmbedUrl = getGoogleDriveEmbedUrl(props.url);

    if (driveEmbedUrl) {
        return <GoogleDriveViewer {...props} embedUrl={driveEmbedUrl} />;
    }

    return <ReactPdfViewer {...props} />;
}
