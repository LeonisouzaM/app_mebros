import { useState } from 'react';
import { useStore } from '../../store/store';
import { Users, MailPlus, CheckCircle2 } from 'lucide-react';

export default function StudentManagement() {
    const users = useStore((state) => state.users);
    const addUser = useStore((state) => state.addUser);
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        if (users.find((u) => u.email === email)) {
            setError('Este e-mail já está cadastrado.');
            return;
        }

        addUser(email);
        setEmail('');
        setError('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-primary h-6 w-6" />
                    Gestão de Alunos
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    Libere o acesso para novos alunos (via e-mail da Hotmart).
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                            E-mail do Aluno
                        </label>
                        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                className="flex-1 px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                                placeholder="aluno@email.com"
                            />
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-md shadow-blue-500/30 text-white bg-primary hover:bg-primary-hover font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all md:w-auto"
                            >
                                <MailPlus className="w-5 h-5" />
                                Liberar Acesso
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Acesso liberado com sucesso!
                        </div>
                    )}
                </div>
            </form>

            <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-surface-200 pb-2">Alunos Liberados ({users.filter(u => u.role === 'student').length})</h2>
                <ul className="space-y-3">
                    {users
                        .filter((u) => u.role === 'student')
                        .map((user) => (
                            <li key={user.id} className="flex justify-between items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span className="font-medium text-gray-700">{user.email}</span>
                                </div>
                                <span className="text-xs font-semibold text-text-muted bg-surface-200 px-2 py-1 rounded-md">Ativo</span>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
