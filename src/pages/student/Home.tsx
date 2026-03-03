import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { PlayCircle, Download, ChevronLeft, ChevronRight, Lock, Sparkles, BookOpen } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchParams } from 'react-router-dom';

export default function Home() {
    const { t, language } = useTranslation();

    const dateLocale = language === 'en' ? enUS : language === 'es' ? es : ptBR;
    const classes = useStore((state) => state.classes);
    const user = useStore((state) => state.currentUser);
    const products = useStore((state) => state.products);
    const systemBanners = useStore((state) => state.systemBanners);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const isLoading = useStore((state) => state.isLoading);
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
        // Permite o produto se o ID dele OU o hotmartId dele estiver na lista de acessos do aluno
        return accessibleProductIds.some(accessId =>
            String(accessId) === String(p.id) ||
            (p.hotmartId && String(accessId) === String(p.hotmartId))
        );
    });

    const urlProductId = searchParams.get('p') || searchParams.get('product') || searchParams.get('produto');
    const visibleProducts = urlProductId
        ? allowedProducts.filter(p => p.id === urlProductId)
        : allowedProducts;

    useEffect(() => {
        if (visibleProducts.length === 1) {
            setCurrentProductId(visibleProducts[0].id);
        }
    }, [visibleProducts, setCurrentProductId]);

    if (isLoading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Carregando seus conteúdos...</p>
            </div>
        );
    }

    const activeBanners = (visibleProducts.length === 1 && visibleProducts[0].banners && visibleProducts[0].banners.length > 0)
        ? visibleProducts[0].banners
        : systemBanners.filter(b => b && b.trim() !== '');

    useEffect(() => {
        setCurrentBannerIndex(0);
        if (!activeBanners || activeBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [activeBanners]);

    const nextBanner = () => {
        if (!activeBanners.length) return;
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
    };

    const prevBanner = () => {
        if (!activeBanners.length) return;
        setCurrentBannerIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    return (
        <div className="space-y-10 pb-20 animate-fade-up px-4 md:px-0">
            {/* Welcome Section */}
            <section className="relative overflow-hidden pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                {t('welcome')}
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-main">
                            Olá, <span className="text-primary">{user?.name?.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-text-muted mt-2 max-w-lg font-medium">
                            Continue sua jornada de aprendizado. Você tem <span className="text-text-main font-bold">{visibleProducts.length}</span> {visibleProducts.length === 1 ? 'produto disponível' : 'produtos disponíveis'}.
                        </p>
                    </div>
                </div>
            </section>

            {/* Premium Carousel */}
            {activeBanners.length > 0 && (
                <section className="relative w-full group">
                    <div className="relative h-56 md:h-80 w-full overflow-hidden rounded-[2.5rem] shadow-premium border border-white/20">
                        {activeBanners.map((banner, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                                    }`}
                            >
                                <img src={banner} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                        ))}

                        {activeBanners.length > 1 && (
                            <>
                                <button
                                    onClick={prevBanner}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextBanner}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                                    {activeBanners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentBannerIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentBannerIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}

            {visibleProducts.length === 0 ? (
                <div className="card-premium p-12 text-center bg-white/50 border-dashed">
                    <div className="bg-surface-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="text-text-dim w-10 h-10" />
                    </div>
                    <p className="text-text-muted text-lg font-medium">Nenhum conteúdo disponível no momento.</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {visibleProducts.map(product => {
                        const productClasses = classes
                            .filter(c => c.productId === product.id || (!c.productId && product.id === 'default'))
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                        if (productClasses.length === 0 && visibleProducts.length > 1) return null;

                        return (
                            <section key={product.id} className="relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                            <PlayCircle className="text-primary h-6 w-6" />
                                        </div>
                                        <h2 className="text-2xl font-display font-bold text-text-main tracking-tight">
                                            {visibleProducts.length > 1 ? product.name : t('recentClasses')}
                                        </h2>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-surface-100 mx-6 hidden sm:block"></div>
                                    <span className="text-xs font-bold text-text-dim uppercase tracking-widest">
                                        {productClasses.length} {productClasses.length === 1 ? 'Aula' : 'Aulas'}
                                    </span>
                                </div>

                                {productClasses.length === 0 ? (
                                    <div className="card-premium p-10 text-center">
                                        <p className="text-text-muted font-medium">{t('noClasses')}</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                        {productClasses.map((item) => {
                                            const isLocked = item.unlockDate ? isAfter(startOfDay(new Date(item.unlockDate)), startOfDay(new Date())) : false;

                                            return (
                                                <article
                                                    key={item.id}
                                                    className="card-premium group flex flex-col h-full bg-white overflow-hidden"
                                                >
                                                    {/* Media Container */}
                                                    <div className="relative aspect-video overflow-hidden bg-surface-50">
                                                        {isLocked ? (
                                                            <>
                                                                {(item.coverUrl || item.cloudinaryUrl) && (
                                                                    <img
                                                                        className="w-full h-full object-cover blur-[2px] opacity-40"
                                                                        src={item.coverUrl || (item.cloudinaryUrl.includes('image') || (!item.cloudinaryUrl.includes('.pdf') && !item.cloudinaryUrl.includes('video')) ? item.cloudinaryUrl : '')}
                                                                        alt={item.title}
                                                                    />
                                                                )}
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-slate-900/10">
                                                                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl flex flex-col items-center border border-white/50">
                                                                        <Lock className="w-6 h-6 text-text-main mb-2" />
                                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-text-main">Acesso Bloqueado</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                    src={item.coverUrl || item.cloudinaryUrl}
                                                                    alt={item.title}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                                        <PlayCircle className="w-8 h-8 text-primary fill-current" />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-6 flex flex-col flex-1">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="bg-surface-50 text-[10px] font-bold text-text-dim px-2 py-1 rounded-md uppercase tracking-wider">
                                                                    {format(new Date(item.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-display font-bold text-text-main leading-tight mb-2 group-hover:text-primary transition-colors">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-sm text-text-muted line-clamp-2 font-medium">
                                                                {item.description}
                                                            </p>
                                                        </div>

                                                        <div className="mt-6 pt-5 border-t border-surface-50">
                                                            {isLocked ? (
                                                                <div className="flex items-center gap-2 text-xs font-bold text-text-dim">
                                                                    <Lock className="w-3.5 h-3.5" />
                                                                    Vence em {format(new Date(item.unlockDate!), "dd/MM/yyyy", { locale: dateLocale })}
                                                                </div>
                                                            ) : (
                                                                <a
                                                                    href={item.cloudinaryUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary-light text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all duration-300 active:scale-95"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    {item.buttonText ? item.buttonText : t('accessMaterial')}
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
