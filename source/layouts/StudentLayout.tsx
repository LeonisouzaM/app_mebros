import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Home as HomeIcon, Rss, MessageSquare, User, MessageCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/store';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function StudentLayout() {
    usePushNotifications();
    const { t } = useTranslation();
    const user = useStore((state) => state.currentUser);
    const currentProductId = useStore((state) => state.currentProductId);
    const products = useStore((state) => state.products);

    const currentProduct = currentProductId ? products.find(p => p.id === currentProductId) : null;
    const whatsappNumber = currentProduct?.supportNumber || (products.length === 1 ? products[0].supportNumber : null);

    if (!user || user.role !== 'student') {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { to: '/', icon: HomeIcon, label: t('dashboard') },
        { to: '/feed', icon: Rss, label: t('feed') },
        { to: '/community', icon: MessageSquare, label: t('community') },
        { to: '/profile', icon: User, label: t('profile') },
    ];

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-0 font-sans">
            {/* Nav Header (Desktop) */}
            <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-[60] hidden md:block">
                <nav className="glass-effect rounded-2xl px-6 py-4 flex items-center justify-between shadow-premium border-white/40">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <img src="/logo.svg" alt="Logo" className="w-9 h-9 rounded-xl shadow-lg shadow-primary/20 object-cover border border-white/50" />
                            <span className="font-display font-bold text-lg tracking-tight text-text-main">Membros PRO</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 text-sm font-semibold transition-all duration-300 relative group ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full opacity-0 group-[.active]:opacity-100 group-[.active]:w-full" />
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-text-main leading-none">{user.name}</p>
                            <span className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Premium</span>
                        </div>
                        <img
                            src={user.photo}
                            alt={user.name}
                            className="w-10 h-10 rounded-full border-2 border-primary/20 shadow-sm object-cover flex-shrink-0"
                        />

                    </div>
                </nav>
            </header>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-[85px] bg-white border-t border-slate-100 z-50 md:hidden flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${isActive
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`h-6 w-6 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
                                <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_10px_rgba(168,85,247,0.4)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

            </nav>

            <main className="max-w-5xl mx-auto md:pt-28 md:px-6 w-full min-h-screen">
                <Outlet />
            </main>

            {whatsappNumber && (
                <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-hover hover:scale-110 transition-all z-40 group animate-fade-up"
                    aria-label="Contact Support"
                >
                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                </a>
            )}
        </div>
    );
}
