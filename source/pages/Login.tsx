import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { LogIn, Download, MessageCircle, Mail, Shield } from 'lucide-react';

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
            <div className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center py-12 px-4 overflow-hidden font-inter">
                {/* Modern Background Decor */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03)_0%,transparent_70%)] -z-10" />

                {/* Install Button - Minimalist Tablet Style */}
                <div className="mb-12 animate-fade-up">
                    <button
                        onClick={handleInstallClick}
                        className="bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 flex items-center justify-center gap-2.5 py-3 px-8 rounded-full font-black shadow-xl shadow-black/[0.03] transition-all duration-300 text-[10px] uppercase tracking-[0.2em] border border-white/60 group"
                    >
                        <Download className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                        Instalar Aplicativo
                    </button>
                </div>

                <div className="max-w-md w-full animate-fade-up transition-all duration-1000">
                    {/* The Card - Real Glassmorphism */}
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white flex flex-col gap-10 relative">
                        {/* Premium Accent Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-40" />
                        
                        <div className="text-center space-y-6">
                            <div className="relative mx-auto h-24 w-24">
                                <div className="absolute inset-0 bg-primary/20 rounded-[32px] blur-2xl opacity-40 animate-pulse" />
                                <div className="relative h-full w-full bg-white flex items-center justify-center rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden p-3 ring-1 ring-slate-100/50">
                                    <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-display font-black tracking-tight text-slate-950">
                                    Bem-vindo
                                </h1>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                    Acesse sua área de membros
                                </p>
                            </div>
                        </div>

                        <form className="space-y-8" onSubmit={handleLogin}>
                            <div className="space-y-3">
                                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                    E-mail institucional
                                </label>
                                <div className="relative group">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full px-6 py-5 bg-white/50 border border-slate-100 text-slate-900 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all font-bold placeholder:text-slate-300 text-sm shadow-sm"
                                        placeholder="Seu e-mail de compra"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-[11px] font-black text-red-500 bg-red-50/50 backdrop-blur-sm p-5 rounded-[24px] border border-red-100/50 text-center animate-shake uppercase tracking-widest">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full overflow-hidden group h-[68px] rounded-[28px] bg-primary text-white font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:bg-slate-200 disabled:shadow-none"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex items-center justify-center gap-4">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Verificando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Entrar Agora</span>
                                            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="pt-4 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-loose">
                                Utilize o e-mail cadastrado <br /> na sua compra Hotmart
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="mt-16 text-center animate-fade-up">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                        <Shield className="w-3 h-3" /> 2026 • Seguro
                    </p>
                </footer>
            </div>

            {/* Install Tutorial Modal - Ultramodern */}
            {showInstallModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowInstallModal(false)} />
                    <div className="relative bg-white/90 backdrop-blur-2xl rounded-[32px] md:rounded-[48px] p-6 md:p-8 max-w-[420px] w-full h-[90vh] md:h-auto md:max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden border border-white flex flex-col">
                        <div className="text-center flex-shrink-0 mb-4 md:mb-6">
                            <span className="bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest inline-block border border-primary/10 mb-2 md:mb-3">Tutorial</span>
                            <h3 className="text-2xl md:text-3xl font-display font-black text-slate-950 tracking-tight mb-2">Instalar Aplicativo</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] px-2 leading-relaxed">
                                Siga os passos abaixo para adicionar à tela de início
                            </p>
                        </div>
                        
                        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
                            <div className="h-full max-w-full relative overflow-hidden border-4 md:border-[8px] border-white shadow-xl bg-slate-100 rounded-[28px] md:rounded-[36px] flex items-center justify-center inline-block">
                                <video 
                                    src="/tutorial.mp4" 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="h-full w-auto object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex-shrink-0 mt-4 md:mt-6">
                            <button 
                                onClick={() => setShowInstallModal(false)}
                                className="bg-primary text-white w-full py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Entendi, vamos lá!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Support - Clean Style */}
            <a
                href="https://wa.me/5517981980763"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-6 bg-[#25D366] text-white p-5 rounded-[30px] shadow-2xl shadow-green-500/30 hover:scale-110 active:scale-95 transition-all z-[999] group border border-white/20"
                aria-label="Suporte WhatsApp"
            >
                <div className="relative flex items-center justify-center">
                    <MessageCircle className="w-7 h-7" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <span className="hidden md:block absolute right-full mr-4 bg-white/90 backdrop-blur-md text-slate-800 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white translate-x-4 group-hover:translate-x-0">
                    Precisa de suporte?
                </span>
            </a>
        </>
    );
}
