import { useState, useMemo, useEffect } from 'react';
import { useStore, type ClassItem } from '../../store/store';
import { 
    BookOpen, 
    Sparkles, 
    ChevronLeft, 
    ChevronRight, 
    PlayCircle, 
    FileText,
    Info
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export default function Home() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlProductId = searchParams.get('p');
    const { t } = useTranslation();
    const products = useStore((state) => state.products);
    const classes = useStore((state) => state.classes);
    const user = useStore((state) => state.currentUser);
    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const setCurrentProductId = useStore((state) => state.setCurrentProductId);

    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);

    // Sync URL Product ID with Store for Community/Feed compatibility
    useEffect(() => {
        setCurrentProductId(urlProductId);
    }, [urlProductId, setCurrentProductId]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const allowedProducts = useMemo(() => {
        return products.filter(p => 
            user?.accessibleProducts?.includes(p.id) || 
            (p.hotmartId && user?.accessibleProducts?.includes(p.hotmartId))
        );
    }, [products, user?.accessibleProducts]);

    const visibleProducts = useMemo(() => {
        return allowedProducts.filter(p => p.id); // Simple filter
    }, [allowedProducts]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].pageY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        if (window.scrollY === 0 && diff > 0) {
            setPullDistance(Math.min(diff * 0.4, 80));
        }
    };

    const handleTouchEnd = () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            fetchInitialData().finally(() => {
                setIsRefreshing(false);
                setPullDistance(0);
            });
        } else {
            setPullDistance(0);
        }
    };

    const renderLessonList = (moduleClasses: ClassItem[]) => {
        return (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-100 ml-2">
                {moduleClasses.map((item) => (
                    <Link
                        key={item.id}
                        to={`/class/${item.id}`}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-premium transition-all group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                {item.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors text-left uppercase tracking-tight">
                                    {item.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left block">
                                    {item.type === 'video' ? 'Vídeo Aula' : 'Material PDF'}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </Link>
                ))}
            </div>
        );
    };

    const renderModuleList = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;

        const productClasses = classes.filter(c => c.productId === productId);
        // Group by moduleName
        const modulesMap: Record<string, ClassItem[]> = {};
        productClasses.forEach(c => {
            const mName = c.moduleName || 'Geral';
            if (!modulesMap[mName]) modulesMap[mName] = [];
            modulesMap[mName].push(c);
        });

        const moduleNames = Object.keys(modulesMap);

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest">
                        <ChevronLeft className="w-3 h-3" /> {t('back')}
                    </button>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                        {product.name}
                    </span>
                </div>
                
                <h2 className="text-3xl font-display font-black text-slate-950 tracking-tight mb-8">
                    Conteúdo do Curso
                </h2>

                <div className="grid gap-4">
                    {moduleNames.length === 0 ? (
                        <div className="card-modern p-12 text-center bg-white/50 border-dashed border-slate-200">
                             <Info className="text-slate-300 w-8 h-8 mx-auto mb-4" />
                             <p className="text-slate-500 text-sm font-medium">Nenhuma aula cadastrada para este produto.</p>
                        </div>
                    ) : (
                        moduleNames.map((mName, idx) => (
                            <div key={idx} className="card-modern p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                                            {mName}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            {modulesMap[mName].length} Aulas
                                        </p>
                                    </div>
                                </div>
                                {renderLessonList(modulesMap[mName])}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderDescription = (text?: string) => {
        if (!text) return null;
        return (
            <div className="line-clamp-2 text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                {text}
            </div>
        );
    };

    return (
        <div
            className="space-y-8 pb-32 animate-fade-up px-4 md:px-0 relative pt-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to Refresh Indicator */}
            <div
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center transition-all duration-200 pointer-events-none z-[100]"
                style={{
                    top: `${pullDistance - 40}px`,
                    opacity: pullDistance / 40,
                }}
            >
                <div className="w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center border border-slate-100">
                    <Sparkles className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
            </div>

            {!urlProductId ? (
                <>
                    {/* Personalized Header Section */}
                    <section className="flex items-center justify-between mb-2">
                        <div>
                             <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-3">
                                Área de Membros
                            </span>
                            <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                                Olá, {user?.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium text-sm">
                                Continue sua jornada de aprendizado hoje.
                            </p>
                        </div>
                        <div className="relative">
                            <img 
                                src={user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100"} 
                                alt="Profile" 
                                className="w-12 h-12 rounded-full border-2 border-white shadow-premium object-cover" 
                            />
                        </div>
                    </section>

                    {visibleProducts.length === 0 ? (
                        <div className="card-modern p-12 text-center bg-white/50 border-dashed border-slate-200">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="text-slate-300 w-8 h-8" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Nenhum conteúdo disponível no momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <h2 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
                                Seus Produtos
                            </h2>
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {visibleProducts.map(product => (
                                    <Link key={product.id} to={`/?p=${product.id}`} className="card-modern group flex flex-col h-full overflow-hidden border-none ring-1 ring-slate-100">
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 p-3">
                                            {product.coverUrl ? (
                                                <img 
                                                    src={product.coverUrl}
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105 shadow-sm" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                                                    <BookOpen className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-1 text-left">
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                                {product.name}
                                            </h3>
                                            {renderDescription(product.description)}
                                            
                                            <div className="mt-auto pt-6 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Sparkles className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium</span>
                                                </div>
                                                <div className="px-6 py-2.5 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                                    Acessar
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                renderModuleList(urlProductId)
            )}
        </div>
    );
}
