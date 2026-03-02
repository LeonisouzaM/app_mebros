import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { LogIn, Download } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const loginWithApi = useStore((state) => state.loginWithApi);
    const navigate = useNavigate();

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("O navegador ainda não autorizou a instalação. Para testar o App, certifique-se de acessar pelo celular (Chrome ou Safari) ou pelo Chrome no Windows quando o site estiver no ar em HTTPS.");
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email) {
            setError('Por favor, digite seu e-mail.');
            setIsLoading(false);
            return;
        }

        try {
            const success = await loginWithApi(email);
            if (success) {
                const user = useStore.getState().currentUser;
                navigate(user?.role === 'admin' ? '/admin' : '/');
            } else {
                setError('E-mail não autorizado ou compra não aprovada.');
            }
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-blue-500/10">
                <div className="flex justify-center mb-2">
                    <button
                        onClick={handleInstallClick}
                        className="bg-[#1e2432] hover:bg-[#2a3143] text-white flex items-center justify-center gap-2 py-2 px-6 rounded-xl font-medium shadow-sm transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Instalar App
                    </button>
                </div>

                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-50 flex items-center justify-center rounded-full mb-4 shadow-sm border border-blue-100">
                        <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                        Acesso Exclusivo
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Entre com seu e-mail da Hotmart
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <div>
                            <label htmlFor="email" className="sr-only">E-mail address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm shadow-sm"
                                placeholder="Seu e-mail cadastrado"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-blue-500/30 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Verificando...
                                </span>
                            ) : 'Entrar na Área de Membros'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
