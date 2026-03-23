import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { ChevronLeft, Download, FileText, PlayCircle, Info, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export default function ClassView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const classes = useStore((state) => state.classes);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const { t } = useTranslation();
    const [videoError, setVideoError] = useState(false);

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
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-bold text-sm mb-8 group"
            >
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-surface-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronLeft className="w-5 h-5" />
                </div>
                {t('back')}
            </button>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Content Area (Video/Player) */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group flex items-center justify-center">
                        {lesson.type === 'video' && lesson.cloudinaryUrl && !videoError ? (
                            <video
                                src={lesson.cloudinaryUrl}
                                className="w-full h-full bg-black object-contain"
                                controls
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
                            <iframe 
                                src={`${lesson.cloudinaryUrl}#toolbar=0`} 
                                className="w-full h-full min-h-[60vh] bg-white rounded-[2.5rem]"
                                title={lesson.title}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-900 relative">
                                {lesson.coverUrl ? (
                                    <img src={lesson.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20" />
                                )}
                                <div className="relative z-10 flex flex-col items-center p-6 text-center">
                                    <PlayCircle className="w-16 h-16 md:w-20 md:h-20 text-white mb-4 drop-shadow-lg" />
                                    <h3 className="text-white text-xl md:text-2xl font-bold drop-shadow-md">{lesson.title}</h3>
                                    {lesson.cloudinaryUrl ? (
                                        <a
                                            href={lesson.cloudinaryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-6 px-8 py-3 bg-white text-primary rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                                        >
                                            {t('downloadFile') || 'Acessar Conteúdo'}
                                        </a>
                                    ) : (
                                        <p className="text-white/80 mt-2 font-medium">Conteúdo em texto abaixo</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-premium border border-surface-200">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(lesson.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                            {lesson.type === 'video' && (
                                <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    {t('videoClass')}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-main leading-tight mb-4">
                            {lesson.title}
                        </h1>

                        {lesson.description && (
                            <div className="prose prose-slate max-w-none w-full overflow-hidden break-words">
                                <p className="text-text-muted text-lg leading-relaxed whitespace-pre-line font-medium break-words">
                                    {renderDescription(lesson.description)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Material & Info) */}
                <div className="lg:col-span-1 space-y-6">
                    {lesson.attachmentUrl && (
                        <div className="card-premium p-8 bg-primary/5 border-primary/20">
                            <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                <FileText className="text-primary w-5 h-5" />
                                {t('supportMaterial')}
                            </h3>
                            <p className="text-sm text-text-muted mb-6 font-medium">
                                {t('downloadSupportMaterial')}
                            </p>
                            <a
                                href={lesson.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] transition-all"
                            >
                                <Download className="w-5 h-5" />
                                {t('downloadPdf')}
                            </a>
                        </div>
                    )}

                    <div className="card-premium p-8 bg-white border-surface-200">
                        <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                            <Info className="text-primary w-5 h-5" />
                            {t('aboutClass')}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-surface-100">
                                <span className="text-text-muted text-sm font-medium">{t('format')}</span>
                                <span className="text-text-main text-sm font-bold uppercase">{lesson.type || 'link'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-surface-100">
                                <span className="text-text-muted text-sm font-medium">{t('status')}</span>
                                <span className="text-success text-sm font-bold flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                    {t('completed')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
