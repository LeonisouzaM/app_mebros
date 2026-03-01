import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Home, Rss, MessageSquare, User, MessageCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/store';

export default function StudentLayout() {
    const { t } = useTranslation();

    const user = useStore((state) => state.currentUser);
    const currentProductId = useStore((state) => state.currentProductId);
    const products = useStore((state) => state.products);

    // Find if the current selected product has a whatsapp support number
    const currentProduct = currentProductId ? products.find(p => p.id === currentProductId) : null;
    const whatsappNumber = currentProduct?.supportNumber || (products.length === 1 ? products[0].supportNumber : null); // If only one product or selected

    if (!user || user.role !== 'student') {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { to: '/', icon: Home, label: t('dashboard') },
        { to: '/feed', icon: Rss, label: t('feed') },
        { to: '/community', icon: MessageSquare, label: t('community') },
        { to: '/profile', icon: User, label: t('profile') },
    ];

    return (
        <div className="min-h-screen bg-surface-50 pb-20 md:pb-0">
            <main className="max-w-4xl mx-auto md:p-6 w-full h-full">
                <Outlet />
            </main>

            {/* Bottom Nav Bar (Mobile-first) */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-surface-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 md:sticky md:bottom-auto md:top-0 md:shadow-sm">
                <div className="max-w-4xl mx-auto px-2">
                    <div className="flex justify-between md:justify-start md:space-x-8">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center w-full py-3 md:py-4 transition-colors relative ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'fill-blue-50/50' : ''}`} />
                                        <span className="text-[10px] md:text-xs font-semibold">{item.label}</span>
                                        {isActive && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full hidden md:block" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>
            {/* Floating WhatsApp Button */}
            {whatsappNumber && (
                <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-[84px] right-4 md:bottom-8 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50 group flex items-center justify-center"
                    aria-label="Contact Support via WhatsApp"
                >
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                        Falar com Suporte
                    </span>
                </a>
            )}
        </div>
    );
}
