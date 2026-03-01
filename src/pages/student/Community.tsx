import { useStore } from '../../store/store';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';

export default function Community() {
    const { t, language } = useTranslation();
    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const currentProductId = useStore((state) => state.currentProductId);
    const comments = useStore((state) => state.comments).filter(c => c.productId === currentProductId || (!c.productId && currentProductId === 'default'));

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
                        <MessageCircle className="text-primary h-6 w-6" />
                        {t('community')}
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        {t('communityDesc')}
                    </p>
                </div>
            </header>

            {comments.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                    <p className="text-text-muted">{t('noComments')}</p>
                </div>
            ) : (
                <div className="space-y-6 pb-12">
                    {comments.map((comment) => (
                        <article key={comment.id} className="bg-white rounded-2xl p-5 shadow-sm border border-surface-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <img
                                    src={comment.userPhoto}
                                    alt={comment.userName}
                                    className="w-12 h-12 rounded-full border-2 border-surface-100 shadow-sm"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {comment.userName}
                                        </h3>
                                        <div className="flex items-center text-xs text-text-muted bg-surface-50 px-2 py-1 rounded-md">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                                        </div>
                                    </div>
                                    <div className="bg-surface-50 p-4 rounded-xl text-sm text-gray-800 leading-relaxed">
                                        {comment.text}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
