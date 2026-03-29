import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Package, Plus, Trash2, Edit2, CheckCircle2, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProductManagement() {
    const products = useStore((state) => state.products);
    const addProduct = useStore((state) => state.addProduct);
    const updateProduct = useStore((state) => state.updateProduct);
    const removeProduct = useStore((state) => state.removeProduct);
    const systemBanners = useStore((state) => state.systemBanners);
    const updateSystemBanners = useStore((state) => state.updateSystemBanners);
    const fetchProducts = useStore((state) => state.fetchProducts);
    const fetchBanners = useStore((state) => state.fetchBanners);

    useEffect(() => {
        fetchProducts();
        fetchBanners();
    }, []);

    // Local state for system banners to avoid frequent API calls
    const [editingBanners, setEditingBanners] = useState<string[]>([]);
    const [isUploadingBanner, setIsUploadingBanner] = useState<number | null>(null);

    const renderDescription = (text?: string) => {
        if (!text) return null;
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
        
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            if (match[1] && match[2]) {
                parts.push(
                    <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all" onClick={(e) => e.stopPropagation()}>
                        {match[1]}
                    </a>
                );
            } else if (match[3]) {
                parts.push(
                    <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all" onClick={(e) => e.stopPropagation()}>
                        {match[3]}
                    </a>
                );
            }

            lastIndex = linkRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    useEffect(() => {
        if (systemBanners) {
            setEditingBanners(systemBanners);
        }
    }, [systemBanners]);

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [language, setLanguage] = useState('pt');
    const [supportNumber, setSupportNumber] = useState('');
    const [hotmartId, setHotmartId] = useState('');
    const [banners, setBanners] = useState<string[]>([]);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        if (isEditing) {
            updateProduct(isEditing, { name, description, coverUrl, language, banners, supportNumber, hotmartId });
            setSuccess('Produto atualizado com sucesso!');
        } else {
            addProduct({ name, description, coverUrl, language, banners, supportNumber, hotmartId });
            setSuccess('Novo produto criado!');
        }

        cancelEdit();
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleEdit = (product: any) => {
        setIsEditing(product.id);
        setName(product.name);
        setDescription(product.description || '');
        setCoverUrl(product.coverUrl || '');
        setLanguage(product.language || 'pt');
        setSupportNumber(product.supportNumber || '');
        setHotmartId(product.hotmartId || '');
        setBanners(product.banners || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBannerUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        setIsUploadingBanner(index);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset || '');

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                const newBanners = [...editingBanners];
                newBanners[index] = data.secure_url;
                setEditingBanners(newBanners);
            }
        } catch (err) {
            console.error('Erro upload banner:', err);
        } finally {
            setIsUploadingBanner(null);
        }
    };

    const saveSystemBanners = () => {
        updateSystemBanners(editingBanners.filter(b => b.trim() !== ''));
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setName('');
        setDescription('');
        setCoverUrl('');
        setLanguage('pt');
        setSupportNumber('');
        setHotmartId('');
        setBanners([]);
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="text-primary h-6 w-6" />
                    Gerenciar Produtos
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    Crie e edite as áreas de membros separadas (ex: Curso de Inglês, Adestramento Canino).
                </p>
            </header>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-surface-200 pb-2">
                    Banners da Tela Inicial (Painel)
                </h2>
                <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                        Estas imagens aparecerão no carrossel da tela inicial. (Resolução ideal: 1080x650 para Mobile ou 1920x720 para Desktop)
                    </p>
                    <div className="space-y-3">
                        {editingBanners.map((banner, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-200">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="url"
                                        value={banner}
                                        onChange={(e) => {
                                            const newBanners = [...editingBanners];
                                            newBanners[index] = e.target.value;
                                            setEditingBanners(newBanners);
                                        }}
                                        className="w-full px-4 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary transition-all bg-white text-sm"
                                        placeholder="Link da imagem ou faça upload..."
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs font-bold text-text-muted hover:text-primary hover:border-primary cursor-pointer transition-all">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleBannerUpload(index, e)}
                                                disabled={isUploadingBanner !== null}
                                            />
                                            {isUploadingBanner === index ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                                            {banner ? 'Trocar Imagem' : 'Fazer Upload'}
                                        </label>
                                    <a href={banner} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-bold hover:underline truncate max-w-[150px]">Ver Imagem</a>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingBanners(editingBanners.filter((_, i) => i !== index))}
                                    className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors self-start sm:self-center"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingBanners([...editingBanners, ''])}
                                className="text-sm font-bold flex items-center gap-1.5 text-primary hover:text-primary-hover transition-colors bg-primary/5 px-4 py-2 rounded-xl"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Novo Banner
                            </button>

                            <button
                                type="button"
                                onClick={saveSystemBanners}
                                disabled={JSON.stringify(editingBanners) === JSON.stringify(systemBanners)}
                                className="flex items-center gap-2 py-2 px-6 bg-success text-white rounded-xl font-bold shadow-sm hover:bg-success-hover disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Salvar Banners
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-surface-200">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Ex: Como Adestrar meu Cachorro"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Imagem de Capa (Estilo Netflix)</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="url"
                                    value={coverUrl}
                                    onChange={(e) => setCoverUrl(e.target.value)}
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 text-sm"
                                    placeholder="Link da imagem ou faça upload..."
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 rounded-xl text-xs font-bold text-text-muted hover:text-primary hover:border-primary cursor-pointer transition-all shadow-sm">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setIsUploadingCover(true);
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
                                                try {
                                                    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
                                                    const data = await res.json();
                                                    if (data.secure_url) setCoverUrl(data.secure_url);
                                                } finally {
                                                    setIsUploadingCover(false);
                                                }
                                            }}
                                            disabled={isUploadingCover}
                                        />
                                        {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                        {coverUrl ? 'Trocar Capa' : 'Fazer Upload da Capa'}
                                    </label>
                                    {coverUrl && (
                                        <div className="h-10 w-16 rounded-lg overflow-hidden border border-surface-200 shadow-sm">
                                            <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-surface-100">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Banners Exclusivos deste Produto (Opcional)</label>
                        <p className="text-xs text-text-muted mb-4 italic">Se você adicionar banners aqui, eles substituirão os banners da tela inicial quando o aluno selecionar este produto. (Resolução ideal: 1080x650 Mobile / 1920x720 Desktop)</p>

                        <div className="space-y-3">
                            {banners.map((b, i) => (
                                <div key={i} className="flex gap-3 items-start bg-surface-50 p-3 rounded-2xl border border-surface-200">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="url"
                                            value={b}
                                            onChange={(e) => {
                                                const nb = [...banners];
                                                nb[i] = e.target.value;
                                                setBanners(nb);
                                            }}
                                            className="w-full px-4 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary bg-white text-sm"
                                            placeholder="Link da imagem..."
                                        />
                                        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs font-bold text-text-muted hover:text-primary hover:border-primary cursor-pointer transition-all">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '');
                                                    try {
                                                        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
                                                        const data = await res.json();
                                                        if (data.secure_url) {
                                                            const nb = [...banners];
                                                            nb[i] = data.secure_url;
                                                            setBanners(nb);
                                                        }
                                                    } catch (err) { console.error(err); }
                                                }}
                                            />
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            {b ? 'Trocar Imagem' : 'Fazer Upload'}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setBanners(banners.filter((_, idx) => idx !== i))}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setBanners([...banners, ''])}
                                className="text-xs font-bold flex items-center gap-1.5 text-primary hover:text-primary-hover transition-colors bg-primary/5 px-3 py-2 rounded-xl"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Adicionar Banner ao Produto
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Idioma da Interface do Produto</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                        >
                            <option value="pt">Português (Brasil)</option>
                            <option value="en">Inglês (EUA)</option>
                            <option value="es">Espanhol</option>
                        </select>
                        <p className="text-xs text-text-muted mt-1">
                            Altera textos como "Aulas Recentes", "Mural", etc para o aluno quando estiver dentro deste produto.
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-semibold text-gray-700">Descrição</label>
                            <button
                                type="button"
                                onClick={() => {
                                    const url = window.prompt('1. Cole o endereço do link (URL):');
                                    if (!url) return;
                                    const text = window.prompt('2. Qual texto deve aparecer clicável? (Ex: Saiba Mais)');
                                    if (!text) return;
                                    setDescription(prev => prev + ` [${text}](${url})`);
                                }}
                                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                                🔗 Inserir Link
                            </button>
                        </div>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-none"
                            placeholder="Pequeno resumo do que o aluno vai encontrar aqui..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp de Suporte (Opcional)</label>
                        <input
                            type="text"
                            value={supportNumber}
                            onChange={(e) => setSupportNumber(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Ex: 5511999999999"
                        />
                        <p className="text-xs text-text-muted mt-1">Coloque apenas números, com código do país e DDD (Ex: 55 para Brasil). Aparecerá um botão de WhatsApp para o aluno.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">ID do Produto na Hotmart (Para Webhook)</label>
                        <input
                            type="text"
                            value={hotmartId}
                            onChange={(e) => setHotmartId(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Ex: 16025479281"
                        />
                        <p className="text-xs text-text-muted mt-1">Isso liga este painel diretamente com a compra feita lá na Hotmart. Preencha com o número que está no histórico de webhooks.</p>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end mt-2 mb-4">
                            <button type="button" onClick={cancelEdit} className="text-sm text-text-muted hover:text-gray-900 underline">
                                Cancelar Edição
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${isEditing ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500' : 'bg-primary hover:bg-primary-hover focus:ring-primary'
                            }`}
                    >
                        {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Novo Produto'}
                    </button>

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in fade-in">
                            <CheckCircle2 className="w-5 h-5" />
                            {success}
                        </div>
                    )}
                </div>
            </form>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-surface-200 pb-2 flex items-center justify-between">
                    Produtos Cadastrados ({products.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <div key={product.id} className="bg-surface-50 rounded-2xl overflow-hidden border border-surface-200 hover:border-primary/50 transition-colors flex flex-col group">
                            {product.coverUrl ? (
                                <img src={product.coverUrl} alt={product.name} className="w-full h-32 object-cover bg-gray-200" />
                            ) : (
                                <div className="w-full h-32 bg-blue-100/50 flex items-center justify-center text-primary/40 font-bold">
                                    Sem Capa
                                </div>
                            )}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <div className="text-xs text-text-muted mt-1 line-clamp-2">{product.description ? renderDescription(product.description) : 'Sem descrição.'}</div>
                                    <span className="inline-block mt-2 px-2 py-1 bg-surface-200 text-gray-600 text-[10px] font-bold rounded-md">
                                        Idioma: {product.language === 'en' ? 'Inglês' : product.language === 'es' ? 'Espanhol' : 'Português'}
                                    </span>
                                </div>
                                <div className="mt-4 pt-3 border-t border-surface-200 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                        Cadastrado em {format(new Date(product.createdAt), 'dd/MM/yy', { locale: ptBR })}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeProduct(product.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Atenção: não apaga as aulas atreladas a ele automaticamente.">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && <p className="text-sm text-text-muted p-4">Nenhum produto cadastrado.</p>}
                </div>
            </div>
        </div>
    );
}
