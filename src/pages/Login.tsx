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
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("Use o Chrome ou Safari no celular para instalar o App de estudos.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
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
                setError('E-mail não autorizado ou assinatura inativa.');
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col justify-center items-center py-12 px-4 overflow-hidden">
            {/* Ambient Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] -z-10" />

            {/* Install Button */}
            <div className="mb-8 animate-fade-up">
                <button
                    onClick={handleInstallClick}
                    className="glass-effect hover:bg-white text-text-main flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl font-bold shadow-premium transition-all duration-300 text-xs uppercase tracking-widest border-white/60"
                >
                    <Download className="w-4 h-4 text-primary" />
                    Instalar Aplicativo
                </button>
            </div>

            <div className="max-w-md w-full animate-fade-up transition-all duration-500">
                <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-premium border border-surface-100 flex flex-col gap-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto h-20 w-20 bg-primary/5 flex items-center justify-center rounded-[2rem] shadow-xl shadow-primary/10 border border-white/50 rotate-3 transition-transform hover:rotate-0 overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover p-1" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-display font-display font-black tracking-tight text-text-main">
                                Bem-vindo
                            </h2>
                            <p className="text-sm font-medium text-text-muted">
                                Acesse sua área exclusiva de membros
                            </p>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-bold text-text-muted uppercase tracking-widest ml-1">
                                E-mail institucional
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full px-5 py-4 bg-surface-50 border border-surface-100 text-text-main rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-text-dim"
                                placeholder="exemplo@hotmart.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-xs font-bold text-error bg-error/5 p-4 rounded-2xl border border-error/10 text-center animate-fade-up">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-3 h-[58px]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verificando acesso...</span>
                                </>
                            ) : (
                                <>
                                    <span>Entrar na Plataforma</span>
                                    <LogIn className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-2 border-t border-surface-100 text-center">
                        <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest leading-relaxed">
                            Utilize o mesmo e-mail <br /> usado na sua compra na Hotmart
                        </p>
                    </div>
                </div>
            </div>

            <footer className="mt-12 text-center animate-fade-up">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">
                    &copy; 2026 Plataforma Premium
                </p>
            </footer>
        </div>
    );
}
