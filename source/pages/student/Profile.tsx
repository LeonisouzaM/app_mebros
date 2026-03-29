import { useRef, useState } from 'react';
import { useStore } from '../../store/store';
import { LogOut, HelpCircle, Shield, Camera, Loader2, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Profile() {
    const { t } = useTranslation();
    const user = useStore((state) => state.currentUser);
    const logout = useStore((state) => state.logout);
    const updateProfile = useStore((state) => state.updateProfile);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === 'seu_cloud_name') {
            alert('Cloudinary não configurado.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                await updateProfile({ photo: data.secure_url });
            } else {
                alert('Erro no upload da imagem.');
            }
        } catch (err) {
            console.error('Erro upload:', err);
            alert('Falha na conexão com o servidor de imagens.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="pt-8 px-4 md:px-0 pb-32 animate-fade-up">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm">
                    <Shield className="w-3.5 h-3.5" />
                    Membro VIP Premium
                </div>
                <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                    Seu Perfil
                </h1>
                <p className="text-slate-500 mt-2 font-medium text-sm">
                    Gerencie suas preferências e segurança da conta.
                </p>
            </header>

            <div className="card-modern p-10 md:p-16 text-center overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16" />
                
                <div className="relative inline-block mb-10">
                    <div className="relative group">
                        <img
                            src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=A855F7&color=fff`}
                            alt={user?.name}
                            className="w-32 h-32 rounded-[32px] border-4 border-white shadow-2xl object-cover ring-1 ring-slate-100/50 group-hover:scale-105 transition-transform duration-500"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <Camera className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                            )}
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />

                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>

                <div className="mb-12 relative z-10">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight mb-2">{user?.name}</h2>
                    <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                        {user?.email}
                    </div>
                </div>

                <div className="grid gap-4 max-w-sm mx-auto relative z-10">
                    <button className="flex items-center justify-between bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-premium transition-all duration-500 group">
                        <div className="flex items-center gap-4 font-black text-[11px] uppercase tracking-widest text-slate-700 group-hover:text-primary transition-colors">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                                <HelpCircle className="w-6 h-6 text-primary opacity-60" />
                            </div>
                            Suporte ao Aluno
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1" />
                    </button>

                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-between bg-red-50/50 p-6 rounded-[24px] border border-red-100 hover:bg-red-500 hover:text-white transition-all duration-500 group"
                    >
                        <div className="flex items-center gap-4 font-black text-[11px] uppercase tracking-widest text-red-500 group-hover:text-white transition-colors">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-red-50 group-hover:scale-110 transition-transform">
                                <LogOut className="w-6 h-6 text-red-400 group-hover:text-white" />
                            </div>
                            {t('logout')}
                        </div>
                    </button>
                </div>
            </div>

            <div className="mt-12 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Versão 2.4.0 • Plataforma Oficial
            </div>
        </div>
    );
}
