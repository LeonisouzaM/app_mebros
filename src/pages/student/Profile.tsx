import { useRef, useState } from 'react';
import { useStore } from '../../store/store';
import { LogOut, Mail, HelpCircle, Shield, Camera, Loader2 } from 'lucide-react';
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
                    <div className="relative group">
                        <img
                            src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3B82F6&color=fff`}
                            alt={user?.name}
                            className="w-32 h-32 rounded-[2.5rem] border-4 border-primary/20 shadow-xl object-cover"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <Camera className="w-8 h-8 text-white" />
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

                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full border-4 border-white shadow-lg flex items-center justify-center">
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
