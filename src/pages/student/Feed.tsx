import { useStore } from '../../store/store';
import { Rss, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';

export default function Feed() {
    const { t, language } = useTranslation();
    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const currentProductId = useStore((state) => state.currentProductId);
    const feedPosts = useStore((state) => state.feedPosts).filter(p => p.productId === currentProductId || (!p.productId && currentProductId === 'default'));

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
                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateLocale })}
                                    </div>
                                </div>
                                <div className="text-text-muted text-sm whitespace-pre-wrap leading-relaxed">
                                    {post.description}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
