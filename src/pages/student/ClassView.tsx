import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { ChevronLeft, Download, PlayCircle, Info, Calendar } from 'lucide-react';
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
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-all font-bold text-sm mb-8 group"
            >
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-surface-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary/5 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">{t('back')}</span>
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area (Video/Player) */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 group flex items-center justify-center ring-1 ring-black/10">
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
                            <iframe 
                                src={`${lesson.cloudinaryUrl}#toolbar=0`} 
                                className="w-full h-full min-h-[60vh] bg-white rounded-3xl"
                                title={lesson.title}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 relative overflow-hidden">
                                {lesson.coverUrl ? (
                                    <img src={lesson.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30" />
                                )}
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="relative z-10 flex flex-col items-center p-8 text-center">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20">
                                        <PlayCircle className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-white text-2xl font-display font-bold mb-4">{lesson.title}</h3>
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
                                        <p className="text-white/70 font-medium">Conteúdo em texto abaixo</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Unified Description & Attachments Box (Kiwify/Hotmart Style) */}
                    <div className="bg-white rounded-[2rem] shadow-premium border border-surface-100 overflow-hidden">
                        <div className="p-8 md:p-10">
                            <h2 className="text-2xl font-display font-extrabold text-text-main mb-6 flex items-center gap-3">
                                Descrição
                            </h2>
                            
                            {lesson.description && (
                                <div className="prose prose-slate max-w-none w-full overflow-hidden mb-8">
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
                                <div className="space-y-6">
                                    <h3 className="text-xl font-display font-extrabold text-text-main">
                                        Anexos
                                    </h3>
                                    <a
                                        href={lesson.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 md:p-5 bg-surface-50 border border-surface-100 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-text-main truncate group-hover:text-primary transition-colors">
                                                {lesson.attachmentUrl.split('/').pop() || 'Material de Apoio'}
                                            </h4>
                                            <p className="text-xs text-text-dim font-bold uppercase tracking-wider mt-1">
                                                Material Complementar
                                            </p>
                                        </div>
                                        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-surface-200 text-text-dim group-hover:text-primary group-hover:border-primary/30 group-hover:bg-white transition-all">
                                            <Download className="w-4 h-4" />
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Navigation or Additional Info) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-surface-100">
                        <h3 className="text-xl font-display font-extrabold text-text-main mb-6 flex items-center gap-3">
                            <Info className="text-primary w-6 h-6" />
                            Sobre a aula
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-surface-50">
                                <span className="text-text-muted text-sm font-semibold">Formato</span>
                                <span className="bg-gray-100 px-3 py-1 rounded-lg text-text-main text-[0.7rem] font-black uppercase tracking-widest">{lesson.type || 'link'}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-text-muted text-sm font-semibold">Status</span>
                                <span className="text-success text-sm font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    Concluída
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-surface-50">
                            <p className="text-xs text-text-dim leading-relaxed font-medium">
                                Esta aula faz parte do treinamento exclusivo. Em caso de dúvidas, utilize a área de comentários.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
