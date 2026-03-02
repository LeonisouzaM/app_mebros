import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/store';
import { MessageCircle, Clock, Send, Smile, Image as ImageIcon, Heart, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';

export default function Community() {
    const { t, language } = useTranslation();
    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const currentProductId = useStore((state) => state.currentProductId);
    const fetchComments = useStore((state) => state.fetchComments);
    const addComment = useStore((state) => state.addComment);
    const removeComment = useStore((state) => state.removeComment);
    const likeComment = useStore((state) => state.likeComment);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const comments = useStore((state) => state.comments);
    const user = useStore((state) => state.currentUser);
    const products = useStore((state) => state.products);
    const setCurrentProductId = useStore((state) => state.setCurrentProductId);

    const adminEmails = ['admin@admin.com', 'certificacionsuporte@proton.me', 'aluno@teste.com'];
    const isAdmin = user?.role === 'admin' || (user?.email && adminEmails.includes(user.email));

    const [newComment, setNewComment] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [targetProductId, setTargetProductId] = useState<string>('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        if (replyingTo) {
            setReplyText(prev => prev + emojiData.emoji);
        } else {
            setNewComment(prev => prev + emojiData.emoji);
        }
        setShowEmojiPicker(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === 'seu_cloud_name') {
            alert('Cloudinary não configurado corretamente no .env');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                setImageUrl(data.secure_url);
            } else {
                alert(data.error?.message || 'Erro no upload');
            }
        } catch (err) {
            console.error('Erro upload:', err);
            alert('Falha na conexão com Cloudinary');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (currentProductId) {
            fetchComments(currentProductId);
            setTargetProductId(currentProductId);
        }
    }, [currentProductId, fetchComments]);

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        const pid = isAdmin ? targetProductId : currentProductId;
        if (!newComment.trim() || !user || !pid) return;

        addComment({
            userName: user.name || user.email,
            userPhoto: user.photo || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`,
            userEmail: user.email,
            text: newComment,
            imageUrl: imageUrl || undefined,
            productId: pid
        });
        setNewComment('');
        setImageUrl('');
    };

    const handlePostReply = (parentId: string) => {
        const pid = currentProductId;
        if (!replyText.trim() || !user || !pid) return;

        addComment({
            userName: user.name || user.email,
            userPhoto: user.photo || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`,
            userEmail: user.email,
            text: replyText,
            productId: pid,
            parentId: parentId
        });
        setReplyText('');
        setReplyingTo(null);
    };

    if (!currentProductId && !isAdmin) {
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
                {(isAdmin || (user?.accessibleProducts && user.accessibleProducts.length > 1)) && (
                    <div className="flex flex-col items-end gap-2">
                        <div className="min-w-[200px]">
                            <label className="block text-[10px] font-bold text-primary uppercase mb-1">
                                {isAdmin ? 'Ver Comunidade de:' : 'Mudar Comunidade:'}
                            </label>
                            <select
                                value={currentProductId || ''}
                                onChange={(e) => setCurrentProductId(e.target.value)}
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Selecione o produto...</option>
                                {products.filter(p => isAdmin || user?.accessibleProducts?.some(ap => String(ap) === String(p.id))).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => fetchInitialData()}
                                className="text-[10px] text-gray-400 hover:text-primary transition-colors flex items-center gap-1 font-bold uppercase"
                            >
                                🔄 Recarregar Dados
                            </button>
                        )}
                    </div>
                )}
            </header>

            {!currentProductId && isAdmin ? (
                <div className="bg-blue-50 p-8 rounded-2xl text-center border border-blue-100 mb-8">
                    <p className="text-primary font-medium">Selecione um produto acima para ver e postar na comunidade.</p>
                </div>
            ) : (
                <>
                    <form onSubmit={handlePostComment} className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-surface-200">
                        <div className="flex gap-4">
                            <img
                                src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3B82F6&color=fff`}
                                alt="Me"
                                className="w-12 h-12 rounded-full shadow-sm border border-surface-100"
                            />
                            <div className="flex-1 space-y-4">
                                {isAdmin && (
                                    <div className="mb-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Postar para o Produto:</label>
                                        <select
                                            value={targetProductId}
                                            onChange={(e) => setTargetProductId(e.target.value)}
                                            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-xs bg-surface-50 focus:ring-2 focus:ring-primary outline-none font-semibold"
                                            required
                                        >
                                            <option value="">Selecione para onde postar...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={isAdmin ? "Escreva algo como administrador..." : "O que você está pensando?"}
                                    className="w-full px-4 py-3 border border-surface-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-none text-sm min-h-[100px]"
                                />

                                {imageUrl && (
                                    <div className="relative w-max">
                                        <img src={imageUrl} alt="Upload preview" className="h-32 w-auto max-w-[200px] object-contain rounded-xl border border-surface-200 shadow-sm" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl('')}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-center relative gap-4">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="p-2.5 text-gray-400 hover:text-primary transition-all flex items-center justify-center rounded-xl hover:bg-surface-100 active:scale-95"
                                            title="Anexar imagem"
                                        >
                                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-2.5 text-gray-400 hover:text-primary transition-all flex items-center justify-center rounded-xl hover:bg-surface-100 active:scale-95"
                                            title="Inserir emoji"
                                        >
                                            <Smile className="w-5 h-5" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-full left-0 mb-4 z-50">
                                                <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                                                <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-surface-200 scale-95 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
                                                    <EmojiPicker
                                                        onEmojiClick={onEmojiClick}
                                                        theme={Theme.LIGHT}
                                                        lazyLoadEmojis={true}
                                                        searchPlaceholder="Buscar emoji..."
                                                        previewConfig={{ showPreview: false }}
                                                        width={320}
                                                        height={400}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isUploading}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-8 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                                    >
                                        <Send className="w-4 h-4" />
                                        {isAdmin ? 'Publicar Comunicado' : 'Publicar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {comments.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-surface-200">
                            <div className="bg-surface-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="text-gray-300 w-8 h-8" />
                            </div>
                            <p className="text-text-muted font-medium">{t('noComments')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">
                            {comments.map((comment) => (
                                <article key={comment.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-surface-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={comment.userPhoto}
                                                alt={comment.userName}
                                                className="w-12 h-12 rounded-full border-2 border-surface-100 shadow-sm object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col mb-1">
                                                    <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                                                        {comment.userName}
                                                    </h3>
                                                    <span className="text-[11px] text-text-muted font-medium">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                                                    </span>
                                                </div>
                                                <div className="text-[15px] text-gray-800 leading-relaxed py-2 whitespace-pre-wrap">
                                                    {comment.text}
                                                </div>
                                                {comment.imageUrl && (
                                                    <div className="mt-3 rounded-2xl overflow-hidden border border-surface-100 bg-surface-50">
                                                        <img
                                                            src={comment.imageUrl}
                                                            alt="Post content"
                                                            className="w-full h-auto max-h-[500px] object-contain hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in"
                                                            onClick={() => window.open(comment.imageUrl, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {(isAdmin || user?.email === comment.userEmail) && (
                                                <button
                                                    onClick={() => removeComment(comment.id)}
                                                    className="text-gray-200 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-8 mt-4 pt-4 border-t border-surface-100">
                                            <button
                                                onClick={() => user?.email && likeComment(comment.id, user.email)}
                                                className={`flex items-center gap-2 text-xs font-bold transition-all active:scale-125 ${comment.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                            >
                                                <Heart className={`w-4 h-4 ${comment.hasLiked ? 'fill-current' : ''}`} />
                                                {comment.likesCount || 0}
                                            </button>
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                className={`flex items-center gap-2 text-xs font-bold transition-colors ${replyingTo === comment.id ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                {comment.replies?.length || 0}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies Section */}
                                    {((comment.replies && comment.replies.length > 0) || replyingTo === comment.id) && (
                                        <div className="bg-surface-50 p-6 border-t border-surface-100 space-y-5">
                                            {comment.replies?.map((reply: any) => (
                                                <div key={reply.id} className="flex gap-4 group/reply">
                                                    <img src={reply.userPhoto} className="w-8 h-8 rounded-full border border-surface-200 object-cover" />
                                                    <div className="flex-1 bg-white p-4 rounded-2xl border border-surface-200 shadow-sm relative group-hover/reply:border-primary/20 transition-colors">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <span className="text-xs font-bold text-gray-900">{reply.userName}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: dateLocale })}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-700 leading-relaxed">{reply.text}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {replyingTo === comment.id && (
                                                <div className="flex gap-4 pt-2">
                                                    <img src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3B82F6&color=fff`} className="w-9 h-9 rounded-full border border-surface-200 object-cover" />
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            autoFocus
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handlePostReply(comment.id)}
                                                            placeholder="Escreva sua resposta..."
                                                            className="flex-1 bg-white border border-surface-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all focus:border-transparent"
                                                        />
                                                        <button
                                                            disabled={!replyText.trim()}
                                                            onClick={() => handlePostReply(comment.id)}
                                                            className="bg-primary text-white p-2.5 rounded-2xl disabled:opacity-50 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
