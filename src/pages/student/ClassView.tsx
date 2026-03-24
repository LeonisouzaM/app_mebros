import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { ChevronLeft, Download, PlayCircle, Info, Calendar, FileText, Maximize2, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export default function ClassView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const classes = useStore((state) => state.classes);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const { t } = useTranslation();
    const [videoError, setVideoError] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const lesson = classes.find(c => c.id === id);

    const renderDescription = (text: string) => {
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
        
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            if (match[1] && match[2]) {
                // It's a markdown link: [match[1]](match[2])
                parts.push(
                    <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">
                        {match[1]}
                    </a>
                );
            } else if (match[3]) {
                // It's a raw URL
                parts.push(
                    <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">
                        {match[3]}
                    </a>
                );
            }

            lastIndex = linkRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    const getPdfPreviewUrl = (url: string) => {
        if (!url || !url.includes('cloudinary.com')) return null;
        try {
            // Fix for PDFs that were uploaded as 'raw'. We try to access them as 'image' to get the preview.
            const cleanUrl = url.replace('/raw/upload/', '/image/upload/');
            const parts = cleanUrl.split('/upload/');
            if (parts.length !== 2) return null;
            
            // Generate a high-quality preview of the first page (pg_1)
            return `${parts[0]}/upload/pg_1,c_fill,h_1000,w_750,f_auto,q_auto/${parts[1].replace('.pdf', '.jpg')}`;
        } catch (e) {
            return null;
        }
    };

    const getCleanPdfUrl = (url: string) => {
        if (!url) return '';
        // Ensure PDFs are accessed via 'image' resource type for better browser compatibility
        return url.replace('/raw/upload/', '/image/upload/');
    };

    useEffect(() => {
        if (classes.length === 0) {
            fetchInitialData();
        }
    }, [classes.length, fetchInitialData]);

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                    <Info className="text-text-dim w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-text-main">{t('classNotFound')}</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-primary font-bold hover:underline"
                >
                    {t('backToHome')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0 pt-6 pb-20 animate-fade-up">
            {/* Header / Navigation */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-all font-bold text-sm mb-8 group"
            >
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-surface-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary/5 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">{t('back')}</span>
            </button>

            {/* Single Column Layout (Exactly as the reference image) */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Video/Player Area */}
                <section className="relative aspect-video bg-black rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group flex items-center justify-center ring-1 ring-black/10">
                    {lesson.type === 'video' && lesson.cloudinaryUrl && !videoError ? (
                        <video
                            src={lesson.cloudinaryUrl}
                            className="w-full h-full bg-black object-contain"
                            controls
                            controlsList="nodownload"
                            autoPlay
                            playsInline
                            preload="auto"
                            poster={lesson.coverUrl}
                            onError={(e) => {
                                console.error("Video loading error:", e);
                                setVideoError(true);
                            }}
                        />
                    ) : lesson.type === 'pdf' && lesson.cloudinaryUrl ? (
                        <div 
                            onClick={() => setShowPdfModal(true)}
                            className="relative w-full h-full cursor-pointer overflow-hidden group/pdf flex items-center justify-center bg-gray-900"
                        >
                            {/* PDF Preview / First Page */}
                            <img 
                                src={getPdfPreviewUrl(lesson.cloudinaryUrl) || lesson.coverUrl || "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1932&auto=format&fit=crop"} 
                                className="w-full h-full object-contain opacity-60 group-hover/pdf:scale-105 transition-all duration-700 blur-[2px] group-hover/pdf:blur-0"
                                alt="PDF Preview"
                            />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 group-hover/pdf:bg-black/20 transition-all flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-primary/40 group-hover/pdf:scale-110 transition-transform ring-4 ring-white/10">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <h3 className="text-white text-xl md:text-2xl font-display font-bold mb-2 shadow-sm">{lesson.title}</h3>
                                <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest ring-1 ring-white/30 group-hover/pdf:bg-primary group-hover/pdf:ring-primary transition-all">
                                    Acessar Material Completo
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 relative overflow-hidden">
                            {lesson.coverUrl ? (
                                <img src={lesson.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30" />
                            )}
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="relative z-10 flex flex-col items-center p-8 text-center text-white">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20">
                                    <PlayCircle className="w-10 h-10 md:w-12 md:h-12" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-display font-bold mb-4">{lesson.title}</h3>
                                {lesson.cloudinaryUrl ? (
                                    <a
                                        href={lesson.cloudinaryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/40 hover:scale-105 hover:bg-primary-hover transition-all"
                                    >
                                        {t('downloadFile') || 'Acessar Conteúdo'}
                                    </a>
                                ) : (
                                    <p className="text-white/70 font-medium font-bold uppercase tracking-widest">Postagem de Texto</p>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Unified Description & Attachments Box (Kiwify/Hotmart Style) */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-premium border border-surface-100 overflow-hidden">
                    <div className="p-7 md:p-10">
                        <h2 className="text-2xl font-display font-extrabold text-text-main mb-6">
                            Descrição
                        </h2>
                        
                        {lesson.description && (
                            <div className="prose prose-slate max-w-none w-full mb-8">
                                <p className="text-text-muted text-[1.05rem] leading-relaxed whitespace-pre-line font-medium">
                                    {renderDescription(lesson.description)}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-text-dim text-sm font-semibold mb-8 border-b border-surface-50 pb-8">
                            <Calendar className="w-4 h-4" />
                            <span>Última atualização: {format(new Date(lesson.createdAt), "dd/MM/yyyy")}</span>
                        </div>

                        {lesson.attachmentUrl && (
                            <div className="space-y-6 pt-2">
                                <h3 className="text-xl font-display font-extrabold text-text-main">
                                    Anexos
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <a
                                        href={lesson.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-5 md:p-6 bg-surface-50 border border-surface-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-text-main truncate group-hover:text-primary transition-colors">
                                                {lesson.attachmentUrl.split('/').pop() || 'Material de Apoio'}
                                            </h4>
                                            <p className="text-xs text-text-dim font-bold uppercase tracking-wider mt-1">
                                                Download disponível
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-surface-200 text-text-dim group-hover:text-primary group-hover:border-primary/30 group-hover:bg-white transition-all">
                                            <Download className="w-4 h-4" />
                                        </div>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Extra Class Info merged below for consistent premium look */}
                <div className="flex items-center justify-between px-8 py-6 bg-surface-50/50 rounded-2xl border border-surface-100/50">
                    <div className="flex items-center gap-3">
                        <Info className="text-primary w-5 h-5 opacity-60" />
                        <span className="text-xs text-text-muted font-medium">Esta aula é parte integrante do seu treinamento exclusivo.</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{lesson.type || 'link'}</span>
                        <div className="flex items-center gap-2 text-success text-[10px] font-bold uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            Concluída
                        </div>
                    </div>
                </div>
            </div>

            {/* Robust Fullscreen PDF Modal (Optimized for Mobile) */}
            {showPdfModal && lesson?.cloudinaryUrl && (
                <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                    {/* Header/Controls (Safe Area Aware) */}
                    <div className="w-full h-16 md:h-20 bg-slate-900 flex justify-between items-center px-4 md:px-8 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="truncate">
                                <h3 className="font-bold text-white text-sm md:text-base truncate leading-tight">{lesson.title}</h3>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Acesso Seguro</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPdfModal(false)}
                            className="w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"
                            title="Fechar"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Viewer Wrapper (Native Embed + Fail-Safe Access) */}
                    <div className="w-full flex-1 bg-white relative flex flex-col items-center justify-center">
                        {/* 
                            We use <object> which is often more reliable than <iframe> for PDFs.
                            If it fails, the fallback buttons below take over.
                        */}
                        <object
                            data={getCleanPdfUrl(lesson.cloudinaryUrl)}
                            type="application/pdf"
                            className="w-full h-full z-10"
                        >
                            {/* Native Fallback inside Object */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-6 p-8 text-center">
                                <FileText className="w-16 h-16 text-primary/30 mb-2" />
                                <h4 className="text-text-main font-bold">Quase lá!</h4>
                                <p className="text-sm text-text-muted">Seu material está pronto para ser visualizado.</p>
                                <a
                                    href={getCleanPdfUrl(lesson.cloudinaryUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Ver PDF Completo
                                </a>
                            </div>
                        </object>

                        {/* Forced UI Button for Mobile (Shows above object if needed) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 md:hidden bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-primary/20 flex flex-col items-center gap-3">
                             <p className="text-[10px] font-bold text-text-main uppercase tracking-widest text-center">
                                Problemas com a visualização?
                             </p>
                             <a
                                href={getCleanPdfUrl(lesson.cloudinaryUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs flex items-center gap-2"
                             >
                                <ExternalLink className="w-4 h-4" />
                                Abrir Manualmente
                             </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
