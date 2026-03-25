import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { LogIn, Download, MessageCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
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
            setShowInstallModal(true);
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
        <>
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
                                <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover p-1" />
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

            {/* Install Tutorial Modal */}
            {showInstallModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowInstallModal(false)} />
                    <div className="relative bg-white rounded-[2.5rem] p-6 md:p-8 max-w-[420px] w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20">
                        <div className="text-center space-y-5">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Como instalar</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                                    Siga os passos abaixo para adicionar o App diretamente à sua tela de início.
                                </p>
                            </div>
                            
                            {/* Larger Video Container */}
                            <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl aspect-[9/16] max-h-[58vh] mx-auto relative bg-slate-100 ring-1 ring-slate-200">
                                <video 
                                    src="/ezgif-6f29e7a5fd545037.mp4" 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="w-full h-full object-cover scale-105"
                                />
                            </div>

                            <button 
                                onClick={() => setShowInstallModal(false)}
                                className="btn-primary w-full py-4 text-base shadow-xl shadow-primary/30 font-bold"
                            >
                                Entendi, obrigado!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Support WhatsApp - Floating Button */}
            <a
                href="https://wa.me/5517981980763"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-4 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:shadow-hover hover:scale-110 transition-all z-[999] group flex items-center justify-center"
                aria-label="Suporte WhatsApp"
            >
                <MessageCircle className="w-7 h-7" />
                <span className="hidden md:block absolute right-full mr-3 bg-white text-[#25D366] px-3 py-1.5 rounded-xl text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#25D366]/10">
                    Precisa de ajuda?
                </span>
            </a>
        </>
    );
}
