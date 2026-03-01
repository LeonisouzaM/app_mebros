import { Outlet, NavLink } from 'react-router-dom';
import { UploadCloud, Rss, MessageSquare, Users, LogOut, Package } from 'lucide-react';
import { useStore } from '../store/store';

export default function AdminLayout() {
    const logout = useStore((state) => state.logout);
    const user = useStore((state) => state.currentUser);

    const navItems = [
        { to: '/admin/products', icon: Package, label: 'Meus Produtos' },
        { to: '/admin/content', icon: UploadCloud, label: 'Upload de Conteúdo' },
        { to: '/admin/feed', icon: Rss, label: 'Gestão do Feed' },
        { to: '/admin/community', icon: MessageSquare, label: 'Comunidade' },
        { to: '/admin/students', icon: Users, label: 'Gestão de Alunos' },
    ];

    return (
        <div className="flex bg-surface-50 h-screen w-full overflow-hidden">
            {/* Sidebar for Admin */}
            <aside className="w-64 bg-white border-r border-surface-200 flex flex-col shadow-sm">
                <div className="p-6 border-b border-surface-200">
                    <h1 className="text-xl font-bold text-primary">Painel Admin</h1>
                    <p className="text-sm text-text-muted mt-1">{user?.name}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-blue-50 text-primary shadow-sm border border-blue-100'
                                    : 'text-text-muted hover:text-text-main hover:bg-surface-100'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-surface-200">
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
