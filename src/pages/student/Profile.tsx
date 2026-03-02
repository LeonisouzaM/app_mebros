import { useStore } from '../../store/store';
import { LogOut, Mail, HelpCircle, Shield } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Profile() {
    const { t } = useTranslation();
    const user = useStore((state) => state.currentUser);
    const logout = useStore((state) => state.logout);

    return (
        <div className="pt-8 px-4 md:px-0 animate-fade-up">
            <header className="mb-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Shield className="w-3 h-3" />
                    Conta Premium
                </div>
                <h1 className="text-3xl font-display font-extrabold text-text-main">
                    {t('myProfile')}
                </h1>
                <p className="text-text-muted mt-2 font-medium">
                    Gerencie suas informações e configurações de conta.
                </p>
            </header>

            <div className="card-premium p-10 md:p-12 text-center bg-white">
                <div className="relative inline-block mb-6">
                    <img
                        src={user?.photo}
                        alt={user?.name}
                        className="w-32 h-32 rounded-[2rem] border-4 border-primary/20 shadow-xl object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-display font-bold text-text-main mb-1">{user?.name}</h2>
                    <div className="flex items-center justify-center gap-2 text-text-muted font-medium">
                        <Mail className="w-4 h-4 text-primary/50" />
                        {user?.email}
                    </div>
                </div>

                <div className="grid gap-4 max-w-sm mx-auto">
                    <button className="flex items-center justify-between bg-surface-50 p-5 rounded-2xl border border-surface-100 hover:bg-white hover:border-primary/30 hover:shadow-premium transition-all duration-300 group">
                        <div className="flex items-center gap-4 font-bold text-text-main">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-surface-100 group-hover:scale-110 transition-transform">
                                <HelpCircle className="w-5 h-5 text-primary" />
                            </div>
                            Central de Suporte
                        </div>
                    </button>

                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-between bg-error/5 p-5 rounded-2xl border border-error/10 hover:bg-error hover:text-white transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4 font-bold text-error group-hover:text-white">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-error/10 group-hover:scale-110 transition-transform">
                                <LogOut className="w-5 h-5 text-error" />
                            </div>
                            {t('logout')}
                        </div>
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">
                Versão 2.4.0 • Acesso Seguro
            </div>
        </div>
    );
}
