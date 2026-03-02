import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Rss, Send, Trash2, Calendar, Smile, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';

export default function FeedManagement() {
    const addFeedPost = useStore((state) => state.addFeedPost);
    const removeFeedPost = useStore((state) => state.removeFeedPost);
    const fetchFeed = useStore((state) => state.fetchFeed);
    const feedPosts = useStore((state) => state.feedPosts);
    const products = useStore((state) => state.products);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [productId, setProductId] = useState('');
    const [showTitleEmojis, setShowTitleEmojis] = useState(false);
    const [showDescEmojis, setShowDescEmojis] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset || '');

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                setImageUrl(data.secure_url);
            }
        } catch (err) {
            console.error('Erro upload:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const onTitleEmojiClick = (emojiData: EmojiClickData) => {
        setTitle(prev => prev + emojiData.emoji);
        setShowTitleEmojis(false);
    };

    const onDescEmojiClick = (emojiData: EmojiClickData) => {
        setDescription(prev => prev + emojiData.emoji);
        setShowDescEmojis(false);
    };

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !productId) return;

        addFeedPost({ title, description, imageUrl, productId });
        setTitle('');
        setDescription('');
        setImageUrl('');
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Rss className="text-primary h-6 w-6" />
                    Gestão do Feed
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    Publique avisos e atualizações para todos os alunos.
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

                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                            Título do Aviso
                        </label>
                        <div className="relative">
                            <input
                                id="title"
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 pr-12"
                                placeholder="Ex: Nova aula liberada!"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <button
                                    type="button"
                                    onClick={() => setShowTitleEmojis(!showTitleEmojis)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-surface-100 rounded-lg"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                {showTitleEmojis && (
                                    <div className="absolute right-0 top-full mt-2 z-50">
                                        <div className="fixed inset-0" onClick={() => setShowTitleEmojis(false)} />
                                        <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-surface-200">
                                            <EmojiPicker onEmojiClick={onTitleEmojiClick} theme={Theme.LIGHT} width={300} height={350} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                            Conteúdo do Aviso
                        </label>
                        <div className="relative">
                            <textarea
                                id="description"
                                rows={3}
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-y"
                                placeholder="Digite todos os detalhes da atualização..."
                            />
                            <div className="absolute right-2 bottom-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDescEmojis(!showDescEmojis)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-surface-100 rounded-lg"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                {showDescEmojis && (
                                    <div className="absolute right-0 bottom-full mb-2 z-50">
                                        <div className="fixed inset-0" onClick={() => setShowDescEmojis(false)} />
                                        <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-surface-200">
                                            <EmojiPicker onEmojiClick={onDescEmojiClick} theme={Theme.LIGHT} width={300} height={350} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Anexar Foto (Opcional)
                        </label>
                        <div className="flex items-center gap-4">
                            <label className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-all
                                ${imageUrl ? 'border-success text-success bg-success/5' : 'border-surface-200 text-text-muted hover:border-primary hover:text-primary'}
                            `}>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                <span className="text-sm font-medium">{imageUrl ? 'Trocar Foto' : 'Adicionar Foto'}</span>
                            </label>

                            {imageUrl && (
                                <div className="relative group">
                                    <img src={imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-surface-200" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl('')}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="flex items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-md shadow-blue-500/30 text-white bg-primary hover:bg-primary-hover font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                        >
                            <Send className="w-4 h-4 ml-1" />
                            Publicar no Feed
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 px-2">Avisos Publicados</h2>
                <div className="grid gap-4">
                    {feedPosts.map((post) => {
                        const product = products.find(p => p.id === post.productId);
                        return (
                            <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-surface-200 flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary px-2 py-0.5 rounded-full">
                                            {product?.name || post.productId}
                                        </span>
                                        <span className="text-xs text-text-muted flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(post.createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{post.title}</h3>
                                    <p className="text-sm text-text-muted mt-1 leading-relaxed line-clamp-2">{post.description}</p>
                                    {post.imageUrl && (
                                        <img src={post.imageUrl} alt={post.title} className="mt-3 w-40 h-24 object-cover rounded-xl border border-surface-100" />
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFeedPost(post.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover aviso"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
