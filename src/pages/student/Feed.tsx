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

    useEffect(() => {
        if (currentProductId) {
            fetchFeed(currentProductId);
        }
    }, [currentProductId, fetchFeed]);

    if (!currentProductId) {
        return (
            <div className="pt-6 px-4 md:px-0">
                <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                    <p className="text-text-muted text-lg font-bold">{t('selectProductFirst')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-6 px-4 md:px-0">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Rss className="text-primary h-6 w-6" />
                        {t('notices')}
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        {t('latestUpdates')}
                    </p>
                </div>
            </header>

            {feedPosts.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                    <p className="text-text-muted">{t('noNotices')}</p>
                </div>
            ) : (
                <div className="relative border-l border-surface-200 ml-4 md:ml-6 space-y-8 pb-12">
                    {feedPosts.map((post) => (
                        <article key={post.id} className="relative pl-6 md:pl-8 group">
                            {/* Timeline dot */}
                            <div className="absolute w-4 h-4 bg-primary rounded-full -left-[8px] top-1 ring-4 ring-white shadow-sm group-hover:scale-125 transition-transform" />

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-200 transition-all hover:shadow-md hover:border-blue-100">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center text-xs font-medium text-primary bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: dateLocale })}
                                    </div>
                                </div>
                                <div className="text-text-muted text-sm whitespace-pre-wrap leading-relaxed">
                                    {renderDescription(post.description)}
                                </div>
                                {post.imageUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-surface-100 shadow-sm">
                                        <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[400px] object-cover" />
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
