import { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import { MessageCircle, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';

export default function Community() {
    const { t, language } = useTranslation();
    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const currentProductId = useStore((state) => state.currentProductId);
    const fetchComments = useStore((state) => state.fetchComments);
    const addComment = useStore((state) => state.addComment);
    const comments = useStore((state) => state.comments);
    const user = useStore((state) => state.currentUser);

    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (currentProductId) {
            fetchComments(currentProductId);
        }
    }, [currentProductId, fetchComments]);

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !currentProductId) return;

        addComment({
            userName: user.name || user.email,
            userPhoto: user.photo || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`,
            text: newComment,
            productId: currentProductId
        });
        setNewComment('');
    };

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

            <form onSubmit={handlePostComment} className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
                <div className="flex gap-4">
                    <img
                        src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3B82F6&color=fff`}
                        alt="Me"
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 space-y-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Partilhe algo com a comunidade..."
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-none text-sm"
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="flex items-center gap-2 py-2 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                            >
                                <Send className="w-4 h-4" />
                                Publicar
                            </button>
                        </div>
                    </div>
                </div>
            </form>

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
