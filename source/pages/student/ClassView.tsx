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

    const isGoogleDriveUrl = (url: string) => url?.includes('drive.google.com');

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

    return (
        <>
            {/* ─── Main Page ─── */}
            <div className="max-w-6xl mx-auto px-4 md:px-0 pt-6 pb-32 animate-fade-up">
                {/* Back Button */}
                <header className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all font-black text-xs uppercase tracking-widest group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-premium border border-slate-100 flex items-center justify-center group-hover:scale-105 group-hover:shadow-primary/10 transition-all">
                            <ChevronLeft className="w-6 h-6" />
                        </div>
                        <span className="group-hover:translate-x-1 transition-transform">{t('back')}</span>
                    </button>

                    <div className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100/50">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {t('available')}
                    </div>
                </header>

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* ─── Media Area ─── */}
                    <section className="relative aspect-video bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl shadow-primary/5 border border-white/40 ring-1 ring-slate-100 flex items-center justify-center">

                        {/* VIDEO */}
                        {isVideo && lesson.cloudinaryUrl && !videoError ? (
                            <video
                                src={lesson.cloudinaryUrl}
                                className="w-full h-full bg-slate-900 object-contain"
                                controls
                                controlsList="nodownload"
                                autoPlay
                                playsInline
                                preload="auto"
                                poster={lesson.coverUrl}
                                onError={() => setVideoError(true)}
                            />

                        ) : isVideo && videoError ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white/60 gap-4 p-8 text-center">
                                <PlayCircle className="w-14 h-14 opacity-20" />
                                <p className="font-bold text-sm">{t('videoLoadError')}</p>
                                {lesson.cloudinaryUrl && (
                                    <a href={lesson.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="btn-primary py-2 px-6 text-xs">
                                        {t('openVideoExternal')}
                                    </a>
                                )}
                            </div>

                        ) : isPdf && lesson.cloudinaryUrl ? (
                            /* PDF THUMBNAIL → click opens modal */
                            <div
                                onClick={() => setShowPdfModal(true)}
                                className="relative w-full h-full cursor-pointer group/pdf flex items-center justify-center bg-slate-900"
                            >
                                <div className={`absolute inset-0 ${isDrivePdf ? 'bg-gradient-to-br from-blue-900/60 to-slate-900' : 'bg-gradient-to-br from-primary/30 to-slate-900'}`} />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover/pdf:bg-black/20 transition-all flex flex-col items-center justify-center p-8 text-center gap-6">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl group-hover/pdf:scale-110 transition-transform ring-4 ring-white/5">
                                        <FileText className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-2xl md:text-3xl font-display font-black tracking-tight">{lesson.title}</h3>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                            {isDrivePdf ? 'Google Drive PDF' : 'Documento PDF'}
                                        </p>
                                        <span className="inline-block mt-6 px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 group-hover/pdf:bg-primary-hover transition-all">
                                            {t('tapToOpen')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            /* DEFAULT / PLACEHOLDER */
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                                <div className="relative z-10 flex flex-col items-center p-8 text-center text-white gap-6">
                                    <Info className="w-16 h-16 opacity-20" />
                                    <h3 className="text-2xl font-display font-black tracking-tight">{lesson.title}</h3>
                                    {lesson.cloudinaryUrl && (
                                        <a
                                            href={lesson.cloudinaryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                        >
                                            {t('accessContent')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ─── Description Area ─── */}
                    <div className="card-modern overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">{t('description')}</h2>
                            </div>

                            {lesson.description && (
                                <div className="mb-10">
                                    <p className="text-slate-600 text-[16px] leading-[1.8] whitespace-pre-line font-medium">
                                        {renderDescription(lesson.description)}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest border-t border-slate-50 pt-8">
                                <Calendar className="w-4 h-4 text-primary opacity-50" />
                                <span>{t('lastUpdated')}: {format(new Date(lesson.createdAt), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Attachments Area ─── */}
                    {lesson.attachmentUrl && (
                        <div className="card-modern p-8 md:p-12">
                            <h3 className="text-xl font-display font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
                                <Download className="w-5 h-5 text-primary" />
                                {t('attachments')}
                            </h3>
                            <a
                                href={lesson.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-[24px] hover:border-primary/20 hover:bg-white transition-all shadow-sm group"
                            >
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors text-sm">
                                        {lesson.attachmentUrl.split('/').pop() || t('supportMaterial')}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{t('downloadAvailable')}</p>
                                </div>
                                <Download className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                            </a>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="text-center pb-10">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">{t('classFooterNote')}</p>
                    </div>
                </div>
            </div>

            {/* PDF FULLSCREEN VIEWER */}
            {showPdfModal && lesson?.cloudinaryUrl && (
                <PdfViewer
                    url={lesson.cloudinaryUrl}
                    title={lesson.title}
                    onClose={() => setShowPdfModal(false)}
                    labels={{
                        loadingPdf: t('loadingPdf'),
                        previewUnavailable: t('previewUnavailable'),
                        previewUnavailableDesc: t('previewUnavailableDesc'),
                        openPdfBrowser: t('openPdfBrowser'),
                        endOfDoc: t('endOfDoc'),
                        pages: t('pages'),
                    }}
                />
            )}
        </>
    );
}
