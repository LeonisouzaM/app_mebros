import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Rss, Send, Trash2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function FeedManagement() {
    const addFeedPost = useStore((state) => state.addFeedPost);
    const removeFeedPost = useStore((state) => state.removeFeedPost);
    const fetchFeed = useStore((state) => state.fetchFeed);
    const feedPosts = useStore((state) => state.feedPosts);
    const products = useStore((state) => state.products);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [productId, setProductId] = useState('');

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !productId) return;

        addFeedPost({ title, description, productId });
        setTitle('');
        setDescription('');
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
                        <input
                            id="title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Ex: Nova aula liberada!"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                            Conteúdo do Aviso
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-y"
                            placeholder="Digite todos os detalhes da atualização..."
                        />
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
                                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{post.title}</h3>
                                    <p className="text-sm text-text-muted mt-1 leading-relaxed line-clamp-2">{post.description}</p>
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
