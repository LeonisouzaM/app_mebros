import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { PlayCircle, Download, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';

export default function Home() {
    const { t, language } = useTranslation();

    // Select the correct locale for date-fns
    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const classes = useStore((state) => state.classes);
    const user = useStore((state) => state.currentUser);
    const products = useStore((state) => state.products);
    const systemBanners = useStore((state) => state.systemBanners);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const setCurrentProductId = useStore((state) => state.setCurrentProductId);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const accessibleProductIds = user?.accessibleProducts || [];
    const isMaster = user?.role === 'admin' || user?.email === 'aluno@teste.com';
    const [searchParams] = useSearchParams();

    const allowedProducts = products.filter(p => {
        if (isMaster) return true;
        // Default product fallback se for id 'default'
        if (p.id === 'default' && accessibleProductIds.includes('default')) return true;
        // Check regular hotmart access (Convert everything to string for safety)
        if (!p.hotmartId) return false;
        return accessibleProductIds.some(id => String(id) === String(p.hotmartId));
    });

    // Check if a specific product was requested via URL (e.g., ?p=123)
    const urlProductId = searchParams.get('p') || searchParams.get('product') || searchParams.get('produto');
    const visibleProducts = urlProductId
        ? allowedProducts.filter(p => p.id === urlProductId)
        : allowedProducts;

    useEffect(() => {
        // Se só tiver 1 produto (cenário comum), define ele como atual para o idioma trocar
        if (visibleProducts.length === 1) {
            setCurrentProductId(visibleProducts[0].id);
        }
    }, [visibleProducts, setCurrentProductId]);

    useEffect(() => {
        if (!systemBanners || systemBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % systemBanners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [systemBanners]);

    const nextBanner = () => {
        if (!systemBanners) return;
        setCurrentBannerIndex(prev => (prev + 1) % systemBanners.length);
    };

    const prevBanner = () => {
        if (!systemBanners) return;
        setCurrentBannerIndex(prev => (prev - 1 + systemBanners.length) % systemBanners.length);
    };

    return (
        <div className="space-y-6 pt-6 px-4 md:px-0">
            <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-surface-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}, {user?.name}!</h1>
                    <p className="text-sm text-text-muted">Acesse seus conteúdos abaixo</p>
                </div>
                <img
                    src={user?.photo}
                    alt={user?.name}
                    className="w-12 h-12 rounded-full border-2 border-primary shadow-sm hidden md:block"
                />
            </header>

            {systemBanners && systemBanners.length > 0 && (
                <section className="relative w-full h-48 md:h-64 lg:h-80 bg-surface-100 rounded-3xl overflow-hidden shadow-sm border border-surface-200 group">
                    {systemBanners.map((banner, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <img src={banner} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}

                    {systemBanners.length > 1 && (
                        <>
                            <button
                                onClick={prevBanner}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextBanner}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {systemBanners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentBannerIndex(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}

            {visibleProducts.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                    <p className="text-text-muted">Você ainda não tem acesso aos produtos ou nenhuma aula foi disponibilizada.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {visibleProducts.map(product => {
                        const productClasses = classes
                            .filter(c => c.productId === product.id || (!c.productId && product.id === 'default'))
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                        if (productClasses.length === 0 && visibleProducts.length > 1) return null; // Skip empty products if there are many

                        return (
                            <section key={product.id}>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <PlayCircle className="text-primary h-6 w-6" />
                                    {visibleProducts.length > 1 ? product.name : t('recentClasses')}
                                </h2>

                                {productClasses.length === 0 ? (
                                    <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-surface-200">
                                        <p className="text-text-muted">{t('noClasses')}</p>
                                        <p className="text-sm text-gray-400 mt-2">{t('adminNotPosted')}</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                                        {productClasses.map((item) => {
                                            const isLocked = item.unlockDate ? isAfter(startOfDay(new Date(item.unlockDate)), startOfDay(new Date())) : false;

                                            return (
                                                <article
                                                    key={item.id}
                                                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-surface-200 hover:shadow-md transition-shadow group relative"
                                                >
                                                    <div className="aspect-video bg-surface-100 relative flex items-center justify-center border-b border-surface-200">
                                                        {isLocked ? (
                                                            <>
                                                                {item.coverUrl || item.cloudinaryUrl ? (
                                                                    <img
                                                                        className="w-full h-full object-cover opacity-90"
                                                                        src={item.coverUrl || (item.cloudinaryUrl.includes('image') || (!item.cloudinaryUrl.includes('.pdf') && !item.cloudinaryUrl.includes('video')) ? item.cloudinaryUrl : '')}
                                                                        alt={item.title}
                                                                        onError={(e) => {
                                                                            // Se erro na preview, põe um fundo neutro
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div className="absolute inset-0 flex items-center justify-center z-40 bg-gray-900/30">
                                                                    <div className="bg-black/50 text-white rounded-full p-4 shadow-lg backdrop-blur-md flex flex-col items-center">
                                                                        <Lock className="w-8 h-8 fill-current text-white mb-1" />
                                                                        <span className="text-[10px] font-bold tracking-widest uppercase">Trancado</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : item.coverUrl ? (
                                                            <>
                                                                <img
                                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                                    src={item.coverUrl}
                                                                    alt={item.title}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="bg-primary/90 text-white rounded-full p-4 shadow-lg backdrop-blur-sm">
                                                                        <PlayCircle className="w-8 h-8 fill-current text-blue-100" />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (item.cloudinaryUrl.toLowerCase().includes('.pdf') || item.cloudinaryUrl.includes('/raw/') || item.cloudinaryUrl.includes('drive.google.com/file/d/')) ? (
                                                            <iframe
                                                                src={item.cloudinaryUrl.includes('drive.google.com')
                                                                    ? item.cloudinaryUrl.replace(/\/view.*$/, '/preview')
                                                                    : item.cloudinaryUrl}
                                                                title={`PDF: ${item.title}`}
                                                                className="w-full h-full border-0 bg-white"
                                                            />
                                                        ) : item.cloudinaryUrl.includes('video') || item.cloudinaryUrl.endsWith('.mp4') || item.cloudinaryUrl.endsWith('.webm') ? (
                                                            <video
                                                                controls
                                                                className="w-full h-full object-contain bg-black"
                                                                src={item.cloudinaryUrl}
                                                            />
                                                        ) : (
                                                            <>
                                                                <img
                                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                                    src={item.cloudinaryUrl}
                                                                    alt={item.title}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="bg-primary/90 text-white rounded-full p-4 shadow-lg backdrop-blur-sm">
                                                                        <PlayCircle className="w-8 h-8 fill-current text-blue-100" />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="p-3 sm:p-5">
                                                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                                                            <h3 className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                                                                {item.title}
                                                            </h3>
                                                        </div>
                                                        <p className="text-[10px] sm:text-sm text-text-muted mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                                                            {item.description}
                                                        </p>

                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-surface-100 gap-2">
                                                            <span className="text-[9px] sm:text-xs text-gray-400 font-medium">
                                                                {format(new Date(item.createdAt), "dd/MM/yy", { locale: dateLocale })}
                                                            </span>

                                                            {isLocked ? (
                                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 cursor-not-allowed">
                                                                    <Lock className="w-4 h-4" />
                                                                    Disponível em {format(new Date(item.unlockDate!), "dd/MM/yyyy", { locale: dateLocale })}
                                                                </div>
                                                            ) : (
                                                                <a
                                                                    href={item.cloudinaryUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors z-20 relative"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    {item.buttonText ? item.buttonText : ((item.cloudinaryUrl.toLowerCase().includes('.pdf') || item.cloudinaryUrl.includes('drive.google.com')) ? t('fullScreen') : t('accessMaterial'))}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            )
                                        })}
                                    </div>
                                )}
                            </section>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
