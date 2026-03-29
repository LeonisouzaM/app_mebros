import { useEffect } from 'react';
import { useStore } from '../../store/store';
import { Rss, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';

export default function Feed() {
    const { t, language } = useTranslation();
    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const currentProductId = useStore((state) => state.currentProductId);
    const fetchFeed = useStore((state) => state.fetchFeed);
    const feedPosts = useStore((state) => state.feedPosts);

    const renderDescription = (text?: string) => {
        if (!text) return null;
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
        
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            if (match[1] && match[2]) {
                parts.push(
                    <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all" onClick={(e) => e.stopPropagation()}>
                        {match[1]}
                    </a>
                );
            } else if (match[3]) {
                parts.push(
                    <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all" onClick={(e) => e.stopPropagation()}>
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

    const products = useStore((state) => state.products);
    const user = useStore((state) => state.currentUser);
    const isAdmin = user?.role === 'admin';
    const accessibleProductsList = isAdmin
        ? products
        : products.filter(p =>
            user?.accessibleProducts?.includes(p.id) || (p.hotmartId && user?.accessibleProducts?.includes(p.hotmartId))
        );
    const activeProductId = currentProductId || (!isAdmin && accessibleProductsList.length === 1 ? accessibleProductsList[0].id : null);

    useEffect(() => {
        if (activeProductId) {
            fetchFeed(activeProductId);
        }
    }, [activeProductId, fetchFeed]);

    if (!activeProductId && !isAdmin) {
        return (
            <div className="pt-6 px-4 md:px-0">
                <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                    <p className="text-text-muted text-lg font-bold">{t('selectProductFirst')}</p>
                </div>
            </div>
        );
    }

    if (!activeProductId && isAdmin) {
         return (
             <div className="pt-6 px-4 md:px-0">
                 <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                     <p className="text-text-muted text-lg font-bold">Por favor, acesse a página inicial e selecione um curso para visualizar seu mural.</p>
                 </div>
             </div>
         );
    }

    return (
        <div className="pt-6 px-4 md:px-0 pb-32 animate-fade-up">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-3">
                        {t('notices')}
                    </span>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                        Atualizações recentes
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                        Fique por dentro de tudo que acontece no curso.
                    </p>
                </div>
            </header>

            {feedPosts.length === 0 ? (
                <div className="card-modern p-12 text-center bg-white/50 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Rss className="text-slate-300 w-8 h-8" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{t('noNotices')}</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-100 ml-4 md:ml-6 space-y-10 pb-12">
                    {feedPosts.map((post) => (
                        <article key={post.id} className="relative pl-8 md:pl-12 group animate-fade-up">
                            {/* Timeline dot */}
                            <div className="absolute w-5 h-5 bg-white rounded-full -left-[11px] top-2 ring-4 ring-primary/5 shadow-premium flex items-center justify-center overflow-hidden border border-slate-100 group-hover:scale-125 transition-transform duration-300">
                                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            </div>

                            <div className="card-modern group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary opacity-50" />
                                                {format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: dateLocale })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-slate-600 text-[15px] whitespace-pre-wrap leading-relaxed font-medium">
                                        {renderDescription(post.description)}
                                    </div>

                                    {post.imageUrl && (
                                        <div className="mt-8 rounded-[24px] overflow-hidden shadow-2xl shadow-black/5 border border-white/40 ring-1 ring-slate-100/50">
                                            <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-1000" />
                                        </div>
                                    )}
                                </div>
                                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        Oficial da área de membros
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
