import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { ChevronLeft, Download, PlayCircle, Info, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import PdfViewer from '../../components/PdfViewer';

export default function ClassView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const classes = useStore((state) => state.classes);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const { t } = useTranslation();
    const [videoError, setVideoError] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const lesson = classes.find(c => c.id === id);

    // Render description text with clickable links
    const renderDescription = (text: string): React.ReactNode[] => {
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
            if (match[1] && match[2]) {
                parts.push(<a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">{match[1]}</a>);
            } else if (match[3]) {
                parts.push(<a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">{match[3]}</a>);
            }
            lastIndex = linkRegex.lastIndex;
        }
        if (lastIndex < text.length) parts.push(text.substring(lastIndex));
        return parts;
    };

    // Get the thumbnail preview URL from a Cloudinary PDF
    const getPdfThumbnail = (url: string) => {
        if (!url) return null;
        // Google Drive: no thumbnail available via API without auth
        if (url.includes('drive.google.com')) return null;
        if (!url.includes('cloudinary.com')) return null;
        try {
            const clean = url.replace('/raw/upload/', '/image/upload/');
            const [base, file] = clean.split('/upload/');
            if (!file) return null;
            return `${base}/upload/pg_1,w_800,h_600,c_fill,f_jpg,q_auto/${file.replace(/\.pdf$/i, '.jpg')}`;
        } catch {
            return null;
        }
    };

    const isGoogleDriveUrl = (url: string) => url?.includes('drive.google.com');

    // Ensure the PDF URL is accessed as image resource type for better compatibility
    const getPdfViewUrl = (url: string) => {
        if (!url) return '';
        return url.replace('/raw/upload/', '/image/upload/');
    };

    useEffect(() => {
        if (classes.length === 0) fetchInitialData();
    }, [classes.length, fetchInitialData]);

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                    <Info className="text-text-dim w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-text-main">{t('classNotFound')}</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold hover:underline">
                    {t('backToHome')}
                </button>
            </div>
        );
    }

    const isPdf = lesson.type === 'pdf';
    const isVideo = lesson.type === 'video';
    const isDrivePdf = isPdf && isGoogleDriveUrl(lesson.cloudinaryUrl);
    const thumbnail = isPdf && !isDrivePdf ? getPdfThumbnail(lesson.cloudinaryUrl) : null;

    return (
        <>
            {/* ─── Main Page ─── */}
            <div className="max-w-6xl mx-auto px-4 md:px-0 pt-6 pb-20 animate-fade-up">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-all font-bold text-sm mb-8 group"
                >
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-surface-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary/5 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">{t('back')}</span>
                </button>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* ─── Media Area ─── */}
                    <section className="relative aspect-video bg-black rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-black/10 flex items-center justify-center">

                        {/* VIDEO */}
                        {isVideo && lesson.cloudinaryUrl && !videoError ? (
                            <video
                                src={lesson.cloudinaryUrl}
                                className="w-full h-full bg-black object-contain"
                                controls
                                controlsList="nodownload"
                                autoPlay
                                playsInline
                                preload="auto"
                                poster={lesson.coverUrl}
                                onError={() => setVideoError(true)}
                            />

                        ) : isVideo && videoError ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white/60 gap-4 p-8 text-center">
                                <PlayCircle className="w-14 h-14 opacity-30" />
                                <p className="font-bold text-sm">Erro ao carregar vídeo.</p>
                                {lesson.cloudinaryUrl && (
                                    <a href={lesson.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm">
                                        Abrir vídeo externamente
                                    </a>
                                )}
                            </div>

                        ) : isPdf && lesson.cloudinaryUrl ? (
                            /* PDF THUMBNAIL → click opens modal */
                            <div
                                onClick={() => setShowPdfModal(true)}
                                className="relative w-full h-full cursor-pointer group/pdf flex items-center justify-center bg-gray-900"
                            >
                                {/* Thumbnail or background */}
                                {thumbnail ? (
                                    <img src={thumbnail} alt="Prévia do PDF"
                                        className="w-full h-full object-cover opacity-50 group-hover/pdf:opacity-70 transition-opacity duration-500"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className={`absolute inset-0 ${isDrivePdf ? 'bg-gradient-to-br from-blue-900 to-slate-900' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`} />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover/pdf:bg-black/20 transition-all flex flex-col items-center justify-center p-8 text-center gap-4">
                                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 group-hover/pdf:scale-110 transition-transform ring-4 ring-white/10">
                                        <FileText className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-xl md:text-2xl font-display font-bold">{lesson.title}</h3>
                                        {isDrivePdf && (
                                            <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">Google Drive · Abertura Rápida</p>
                                        )}
                                        <span className="inline-block mt-3 bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest ring-1 ring-white/30 group-hover/pdf:bg-primary transition-all">
                                            Toque para abrir
                                        </span>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            /* DEFAULT: link/text */
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-700/20" />
                                <div className="relative z-10 flex flex-col items-center p-8 text-center text-white gap-6">
                                    <PlayCircle className="w-16 h-16 opacity-60" />
                                    <h3 className="text-xl md:text-2xl font-display font-bold">{lesson.title}</h3>
                                    {lesson.cloudinaryUrl && (
                                        <a
                                            href={lesson.cloudinaryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/40 hover:scale-105 transition-all"
                                        >
                                            Acessar Conteúdo
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ─── Description & Attachments ─── */}
                    <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-premium border border-surface-100 overflow-hidden">
                        <div className="p-7 md:p-10">
                            <h2 className="text-2xl font-display font-extrabold text-text-main mb-6">Descrição</h2>

                            {lesson.description && (
                                <div className="prose prose-slate max-w-none w-full mb-8">
                                    <p className="text-text-muted text-[1.05rem] leading-relaxed whitespace-pre-line font-medium">
                                        {renderDescription(lesson.description)}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-text-dim text-sm font-semibold mb-8 border-b border-surface-50 pb-8">
                                <Calendar className="w-4 h-4" />
                                <span>Última atualização: {format(new Date(lesson.createdAt), 'dd/MM/yyyy')}</span>
                            </div>

                            {lesson.attachmentUrl && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-display font-extrabold text-text-main">Anexos</h3>
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
                                            <p className="text-xs text-text-dim font-bold uppercase tracking-wider mt-1">Download disponível</p>
                                        </div>
                                        <Download className="w-5 h-5 text-text-dim group-hover:text-primary transition-colors" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Footer */}
                    <div className="flex items-center justify-between px-8 py-6 bg-surface-50/50 rounded-2xl border border-surface-100/50">
                        <div className="flex items-center gap-3">
                            <Info className="text-primary w-5 h-5 opacity-60" />
                            <span className="text-xs text-text-muted font-medium">Esta aula é parte integrante do seu treinamento exclusivo.</span>
                        </div>
                        <div className="flex items-center gap-2 text-success text-[10px] font-bold uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            Disponível
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF FULLSCREEN VIEWER */}
            {showPdfModal && lesson?.cloudinaryUrl && (
                <PdfViewer
                    url={getPdfViewUrl(lesson.cloudinaryUrl)}
                    title={lesson.title}
                    onClose={() => setShowPdfModal(false)}
                />
            )}
        </>
    );
}
