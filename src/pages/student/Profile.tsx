import { useStore } from '../../store/store';
import { User, LogOut, Mail, HelpCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Profile() {
    const { t } = useTranslation();
    const user = useStore((state) => state.currentUser);
    const logout = useStore((state) => state.logout);

    return (
        <div className="pt-6 px-4 md:px-0">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="text-primary h-6 w-6" />
                        {t('myProfile')}
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        Gerencie suas informações.
                    </p>
                </div>
            </header>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-200 text-center">
                <div className="relative inline-block mb-4">
                    <img
                        src={user?.photo}
                        alt={user?.name}
                        className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-md"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <div className="flex items-center justify-center gap-2 text-text-muted mb-8">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                    <button className="w-full flex items-center justify-between bg-surface-50 p-4 rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors group">
                        <div className="flex items-center gap-3 font-semibold text-gray-700">
                            <HelpCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            Suporte
                        </div>
                    </button>

                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100 hover:bg-red-100 transition-colors group"
                    >
                        <div className="flex items-center gap-3 font-semibold text-red-600">
                            <LogOut className="w-5 h-5 text-red-500 group-hover:-translate-x-1 transition-transform" />
                            {t('logout')}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
