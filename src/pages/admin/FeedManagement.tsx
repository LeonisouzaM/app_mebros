import { useState } from 'react';
import { useStore } from '../../store/store';
import { Rss, Send } from 'lucide-react';

export default function FeedManagement() {
    const addFeedPost = useStore((state) => state.addFeedPost);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        addFeedPost({ title, description });
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
                            rows={5}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-y"
                            placeholder="Digite todos os detalhes da atualização..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-md shadow-blue-500/30 text-white bg-primary hover:bg-primary-hover font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                        >
                            <Send className="w-4 h-4 ml-1" />
                            Publicar Aviso
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
