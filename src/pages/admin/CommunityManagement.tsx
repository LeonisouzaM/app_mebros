import { useState } from 'react';
import { useStore } from '../../store/store';
import { MessageSquare, UserPlus } from 'lucide-react';

export default function CommunityManagement() {
    const addComment = useStore((state) => state.addComment);
    const [userName, setUserName] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName || !text) return;

        const photoUrl = userPhoto || `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=3B82F6&color=fff`;

        addComment({ userName, userPhoto: photoUrl, text });
        setUserName('');
        setUserPhoto('');
        setText('');
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
                        <textarea
                            id="text"
                            rows={4}
                            required
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-y"
                            placeholder="O curso está incrível! Muito obrigado..."
                        />
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
                            className="w-12 h-12 rounded-full shadow-sm"
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
        </div>
    );
}
