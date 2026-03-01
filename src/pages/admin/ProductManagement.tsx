import { useState } from 'react';
import { useStore } from '../../store/store';
import { Package, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProductManagement() {
    const products = useStore((state) => state.products);
    const addProduct = useStore((state) => state.addProduct);
    const updateProduct = useStore((state) => state.updateProduct);
    const removeProduct = useStore((state) => state.removeProduct);
    const systemBanners = useStore((state) => state.systemBanners);
    const updateSystemBanners = useStore((state) => state.updateSystemBanners);

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [language, setLanguage] = useState('pt');
    const [supportNumber, setSupportNumber] = useState('');
    const [banners, setBanners] = useState<string[]>([]);
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        if (isEditing) {
            updateProduct(isEditing, { name, description, coverUrl, language, banners, supportNumber });
            setSuccess('Produto atualizado com sucesso!');
        } else {
            addProduct({ name, description, coverUrl, language, banners, supportNumber });
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
        setBanners(product.banners || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setName('');
        setDescription('');
        setCoverUrl('');
        setLanguage('pt');
        setSupportNumber('');
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
                    Crie e edite as áreas de membros separadas (ex: Mounjaro Gelatina, Adestramento Canino).
                </p>
            </header>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-surface-200 pb-2">
                    Banners da Tela Inicial (Painel)
                </h2>
                <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                        Estas imagens aparecerão no carrossel logo abaixo de "Olá, Aluno Teste!" antes do aluno escolher um produto. (Resolução ideal: 1920x400)
                    </p>
                    <div className="space-y-2">
                        {systemBanners.map((banner, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="url"
                                    value={banner}
                                    onChange={(e) => {
                                        const newBanners = [...systemBanners];
                                        newBanners[index] = e.target.value;
                                        updateSystemBanners(newBanners);
                                    }}
                                    className="flex-1 px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary transition-all bg-surface-50"
                                    placeholder="Link da imagem do banner..."
                                />
                                <button
                                    type="button"
                                    onClick={() => updateSystemBanners(systemBanners.filter((_, i) => i !== index))}
                                    className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => updateSystemBanners([...systemBanners, ''])}
                            className="text-sm font-semibold flex items-center gap-1 text-primary hover:text-primary-hover transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Banner Frontal
                        </button>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">URL da Imagem de Capa (Opcional)</label>
                        <input
                            type="url"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Link de uma imagem bonita (estilo Netflix)"
                        />
                    </div>
                    <div>
                        {/* Banners do produto foram movidos para a tela inicial, mas se quiser manter no produto, descomente aqui */}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
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
                                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{product.description || 'Sem descrição.'}</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-surface-200 text-gray-600 text-[10px] font-bold rounded-md">
                                        Idioma: {product.language === 'en' ? 'Inglês' : product.language === 'es' ? 'Espanhol' : 'Português'}
                                    </span>
                                </div>
                                <div className="mt-4 pt-3 border-t border-surface-200 flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-gray-400 font-medium">
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
