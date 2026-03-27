import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/store';
import { MessageCircle, Send, Smile, Image as ImageIcon, Heart, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
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

    // isAdmin é determinado exclusivamente pelo role vindo do banco de dados
    const isAdmin = user?.role === 'admin';

    // Produtos que o aluno tem acesso; admins veem todos
    const accessibleProductsList = isAdmin
        ? products
        : products.filter(p =>
            user?.accessibleProducts?.includes(p.id)
        );

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
        } else if (!isAdmin && accessibleProductsList.length === 1) {
            // Aluno com apenas 1 curso: seleciona automaticamente
            setTargetProductId(accessibleProductsList[0].id);
            fetchComments(accessibleProductsList[0].id);
        }
    }, [currentProductId, fetchComments, accessibleProductsList.length]);

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        const pid = targetProductId || currentProductId;
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
        <div className="pt-6 px-4 md:px-0 pb-32 animate-fade-up">
            <header className="mb-8">
                <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                    {language === 'es' ? 'Comunidad' : t('community')} <span className="text-primary inline-block opacity-80">💬</span>
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                    {language === 'es' ? 'Mira lo que otros estudiantes están compartiendo.' : t('communityDesc')}
                </p>
            </header>

            {!currentProductId && isAdmin ? (
                <div className="card-modern p-10 text-center bg-primary/5 border-primary/10 mb-8">
                    <p className="text-primary font-bold text-sm">Selecione um produto acima para ver e postar na comunidade.</p>
                </div>
            ) : (
                <>
                    {/* Posting Area */}
                    <div className="card-modern p-6 mb-10 overflow-visible relative">
                        <div className="flex gap-4">
                            <img
                                src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=A855F7&color=fff`}
                                alt="Me"
                                className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-sm object-cover flex-shrink-0"
                            />
                            <div className="flex-1 space-y-4">
                                {accessibleProductsList.length > 1 && (
                                    <div className="mb-2">
                                        <select
                                            value={targetProductId}
                                            onChange={(e) => setTargetProductId(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        >
                                            <option value="">Postar para o Produto...</option>
                                            {accessibleProductsList.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={language === 'es' ? '¿Qué estás pensando?' : t('whatAreYouThinking')}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[20px] focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all resize-none text-[15px] min-h-[100px] text-slate-700 font-medium"
                                />

                                {imageUrl && (
                                    <div className="relative w-max group/img">
                                        <img src={imageUrl} alt="Upload preview" className="h-40 w-auto max-w-full object-cover rounded-2xl border border-slate-100 shadow-md transition-transform group-hover/img:scale-[1.02]" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl('')}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition-all active:scale-90"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-center relative gap-4">
                                    <div className="flex items-center gap-2">
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
                                            className="p-3 text-slate-400 hover:text-primary transition-all flex items-center justify-center rounded-2xl hover:bg-slate-50 active:scale-90"
                                            title="Anexar imagem"
                                        >
                                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-3 text-slate-400 hover:text-primary transition-all flex items-center justify-center rounded-2xl hover:bg-slate-50 active:scale-90"
                                            title="Inserir emoji"
                                        >
                                            <Smile className="w-6 h-6" />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-full left-0 mb-4 z-[100]">
                                                <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                                                <div className="relative shadow-2xl rounded-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
                                                    <EmojiPicker
                                                        onEmojiClick={onEmojiClick}
                                                        theme={Theme.LIGHT}
                                                        lazyLoadEmojis={true}
                                                        searchPlaceholder="Buscar emoji..."
                                                        previewConfig={{ showPreview: false }}
                                                        width={300}
                                                        height={400}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || isUploading}
                                        className="py-3 px-10 bg-gradient-to-r from-primary to-primary-hover text-white rounded-[20px] font-black text-sm uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-primary/20 active:scale-95"
                                    >
                                        {language === 'es' ? 'Publicar' : isAdmin ? 'Comunicado' : t('publish')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feed Area */}
                    {comments.length === 0 ? (
                        <div className="card-modern p-16 text-center bg-white/50 border-dashed flex flex-col items-center">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="text-slate-200 w-10 h-10" />
                            </div>
                            <p className="text-slate-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-tighter">
                                {language === 'es' ? 'Aún no hay comentarios en la comunidad.' : t('noComments')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {comments.map((comment) => (
                                <article key={comment.id} className="card-modern overflow-hidden">
                                    <div className="p-6">
                                        {/* Post Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={comment.userPhoto}
                                                    alt={comment.userName}
                                                    className="w-11 h-11 rounded-full border-2 border-slate-50 shadow-sm object-cover"
                                                />
                                                <div>
                                                    <h3 className="text-[15px] font-black text-slate-900 leading-tight">
                                                        {comment.userName}
                                                    </h3>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 block">
                                                        {format(new Date(comment.createdAt), "d MMM, HH:mm", { locale: dateLocale })}
                                                    </span>
                                                </div>
                                            </div>
                                            {(isAdmin || user?.email === comment.userEmail) && (
                                                <button
                                                    onClick={() => removeComment(comment.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-2.5 rounded-2xl hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Post Content */}
                                        <div className="text-[15px] text-slate-600 leading-relaxed font-medium mb-6 whitespace-pre-wrap">
                                            {comment.text}
                                        </div>

                                        {comment.imageUrl && (
                                            <div className="mb-6 rounded-3xl overflow-hidden border border-slate-100 shadow-sm" onClick={() => window.open(comment.imageUrl, '_blank')}>
                                                <img
                                                    src={comment.imageUrl}
                                                    alt="Post media"
                                                    className="w-full h-auto max-h-[500px] object-contain bg-slate-50"
                                                />
                                            </div>
                                        )}

                                        {/* Interaction Bar */}
                                        <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                            <button
                                                onClick={() => likeComment(comment.id)}
                                                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all active:scale-125 ${comment.hasLiked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-50'}`}
                                            >
                                                <Heart className={`w-5 h-5 ${comment.hasLiked ? 'fill-current' : ''}`} />
                                                <span className="text-sm font-black">{comment.likesCount || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all ${replyingTo === comment.id ? 'text-primary bg-primary/5' : 'text-slate-400 hover:bg-slate-50'}`}
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                <span className="text-sm font-black">{comment.replies?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Replies Section */}
                                    {((comment.replies && comment.replies.length > 0) || replyingTo === comment.id) && (
                                        <div className="bg-slate-50/50 p-6 border-t border-slate-50 space-y-5">
                                            {comment.replies?.map((reply: any) => (
                                                <div key={reply.id} className="flex gap-4">
                                                    <img src={reply.userPhoto} className="w-9 h-9 rounded-full border border-white shadow-sm object-cover flex-shrink-0" />
                                                    <div className="flex-1 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <span className="text-[13px] font-black text-slate-900">{reply.userName}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{format(new Date(reply.createdAt), "HH:mm", { locale: dateLocale })}</span>
                                                        </div>
                                                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{reply.text}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {replyingTo === comment.id && (
                                                <div className="flex gap-4 pt-2">
                                                    <img 
                                                        src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=A855F7&color=fff`} 
                                                        className="w-9 h-9 rounded-full border border-white shadow-sm object-cover flex-shrink-0" 
                                                    />
                                                    <div className="flex-1 flex gap-2">
                                                        <input
                                                            autoFocus
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handlePostReply(comment.id)}
                                                            placeholder={t('writeReply')}
                                                            className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                        />
                                                        <button
                                                            disabled={!replyText.trim()}
                                                            onClick={() => handlePostReply(comment.id)}
                                                            className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-30"
                                                        >
                                                            <Send className="w-5 h-5" />
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
