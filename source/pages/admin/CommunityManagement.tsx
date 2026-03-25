import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { MessageSquare, UserPlus, Trash2, Smile } from 'lucide-react';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';

export default function CommunityManagement() {
    const addComment = useStore((state) => state.addComment);
    const removeComment = useStore((state) => state.removeComment);
    const products = useStore((state) => state.products);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const fetchComments = useStore((state) => state.fetchComments);
    const comments = useStore((state) => state.comments);

    const [userName, setUserName] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [text, setText] = useState('');
    const [productId, setProductId] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setText(prev => prev + emojiData.emoji);
        setShowEmojis(false);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (productId) {
            fetchComments(productId);
        }
    }, [productId, fetchComments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName || !text || !productId) return;

        const photoUrl = userPhoto || `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=3B82F6&color=fff`;

        addComment({
            userName,
            userPhoto: photoUrl,
            text,
            productId
        });

        setUserName('');
        setUserPhoto('');
        setText('');
        // We keep productId selected for multiple posts
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="text-primary h-6 w-6" />
                    Simular Comunidade
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    Crie comentários como se fossem outros alunos (Social Proof).
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="productId" className="block text-sm font-semibold text-gray-700 mb-1">
                            Para qual Curso/Produto?
                        </label>
                        <select
                            id="productId"
                            required
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary transition-all bg-surface-50"
                        >
                            <option value="">Selecione o produto...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 mb-1">
                                Nome do Usuário Virtual
                            </label>
                            <input
                                id="userName"
                                type="text"
                                required
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                                placeholder="Ex: Maria Silva"
                            />
                        </div>
                        <div>
                            <label htmlFor="userPhoto" className="block text-sm font-semibold text-gray-700 mb-1">
                                URL da Foto (Opcional)
                            </label>
                            <input
                                id="userPhoto"
                                type="url"
                                value={userPhoto}
                                onChange={(e) => setUserPhoto(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                                placeholder="https://exemplo.com/foto.jpg"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="text" className="block text-sm font-semibold text-gray-700 mb-1">
                            Comentário
                        </label>
                        <div className="relative">
                            <textarea
                                id="text"
                                rows={4}
                                required
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-y"
                                placeholder="O curso está incrível! Muito obrigado..."
                            />
                            <div className="absolute right-2 bottom-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojis(!showEmojis)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-surface-100 rounded-lg"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                {showEmojis && (
                                    <div className="absolute right-0 bottom-full mb-2 z-50">
                                        <div className="fixed inset-0" onClick={() => setShowEmojis(false)} />
                                        <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-surface-200">
                                            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={300} height={350} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-md shadow-blue-500/30 text-white bg-primary hover:bg-primary-hover font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                        >
                            <UserPlus className="w-4 h-4" />
                            Postar Comentário
                        </button>
                    </div>
                </div>
            </form>

            {/* Preview Section */}
            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Preview do Avatar</h3>
                {userName ? (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-surface-200 w-max">
                        <img
                            src={userPhoto || `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=3B82F6&color=fff`}
                            alt="Preview"
                            className="w-12 h-12 rounded-full shadow-sm object-cover flex-shrink-0"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{userName}</p>
                            <p className="text-xs text-text-muted">Apenas um preview</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">Digite um nome para visualizar o avatar gerado.</p>
                )}
            </div>

            {/* Comment List Section */}
            {productId && (
                <div className="mt-12 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-primary h-5 w-5" />
                        Comentários Existentes ({comments.length})
                    </h3>

                    {comments.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl text-center border border-dashed border-gray-300">
                            <p className="text-sm text-gray-400">Nenhum comentário para este produto ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="bg-white p-4 rounded-2xl border border-surface-200 flex items-start gap-4">
                                    <img src={comment.userPhoto} alt={comment.userName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm">{comment.userName}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                                <button
                                                    onClick={() => removeComment(comment.id)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
