import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/store';
import { UploadCloud, CheckCircle2, FileUp, Loader2 } from 'lucide-react';

export default function ContentUpload() {
    const addClass = useStore((state) => state.addClass);
    const updateClass = useStore((state) => state.updateClass);
    const removeClass = useStore((state) => state.removeClass);
    const classes = useStore((state) => state.classes);
    const products = useStore((state) => state.products);
    const fetchInitialData = useStore((state) => state.fetchInitialData);

    useEffect(() => {
        fetchInitialData();
    }, []);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [description, setDescription] = useState('');
    const [productId, setProductId] = useState<string>('');
    const [buttonText, setButtonText] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Conteúdo publicado com sucesso!');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === 'seu_cloud_name') {
            setUploadError('Por favor, adicione suas chaves do Cloudinary no arquivo .env (veja a área de arquivos do seu projeto).');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            // Forçamos "raw" para PDFs para burlar as restrições brutais de leitura de imagem da conta free do Cloudinary.
            const resourceType = file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'raw' : 'auto';

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.secure_url) {
                setUrl(data.secure_url);
            } else {
                setUploadError(data.error?.message || 'Erro do Cloudinary ao salvar o arquivo.');
            }
        } catch (err) {
            setUploadError('Tivemos um problema de conexão durante o upload.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa o seletor para permitir enviar o mesmo de novo se precisar
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !url) return;

        if (editingId) {
            updateClass(editingId, { title, cloudinaryUrl: url, coverUrl: coverUrl || undefined, description, buttonText: buttonText || undefined, productId: productId || undefined, unlockDate: unlockDate || undefined });
            setSuccessMessage('Conteúdo atualizado com sucesso!');
        } else {
            // Default to 'default' product if none selected and products exist
            const finalProductId = productId || (products.length > 0 ? products[0].id : undefined);
            addClass({ title, cloudinaryUrl: url, coverUrl: coverUrl || undefined, description, buttonText: buttonText || undefined, productId: finalProductId, unlockDate: unlockDate || undefined });
            setSuccessMessage('Conteúdo publicado e agora disponível para os alunos!');
        }

        cancelEdit();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setTitle(item.title);
        setUrl(item.cloudinaryUrl);
        setCoverUrl(item.coverUrl || '');
        setDescription(item.description);
        setProductId(item.productId || '');
        setButtonText(item.buttonText || '');
        setUnlockDate(item.unlockDate || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setUrl('');
        setCoverUrl('');
        setDescription('');
        setProductId('');
        setButtonText('');
        setUnlockDate('');
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <UploadCloud className="text-primary h-6 w-6" />
                    Upload de Conteúdo
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    Adicione novas aulas ou envie PDFs e Materiais diretamente da sua máquina.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <div className="space-y-6">

                    {/* Sessão de Upload Direto */}
                    <div className="bg-surface-50 p-6 rounded-2xl border border-dashed border-primary/40 text-center hover:bg-blue-50/50 transition-colors">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Enviar do seu Computador (PDF, Imagem, Vídeo)</h3>
                        <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
                            Sempre que você selecionar um arquivo, nós já enviamos para o Cloudinary e preenchemos o link final abaixo magicamente. ✨
                        </p>

                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="inline-flex items-center gap-2 py-2 px-6 border border-primary text-primary bg-white rounded-xl shadow-sm hover:bg-blue-50 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando ({import.meta.env.VITE_CLOUDINARY_CLOUD_NAME === 'seu_cloud_name' ? 'Aguardando keys...' : 'Aguarde...'})
                                </>
                            ) : (
                                <>
                                    <FileUp className="w-4 h-4" />
                                    Escolher Arquivo...
                                </>
                            )}
                        </button>

                        {uploadError && (
                            <p className="text-xs font-medium text-red-500 mt-4 max-w-sm mx-auto bg-red-50 p-2 rounded-lg border border-red-100">
                                {uploadError}
                            </p>
                        )}
                    </div>

                    <div className="text-center font-bold text-gray-400 text-sm">OU</div>

                    {/* Campos Originais */}
                    {products.length > 0 && (
                        <div>
                            <label htmlFor="product" className="block text-sm font-semibold text-gray-700 mb-1">
                                Para qual Produto?
                            </label>
                            <select
                                id="product"
                                value={productId || products[0].id}
                                onChange={(e) => setProductId(e.target.value)}
                                className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            >
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-1">
                            URL do Cloudinary (Preenchido pelo botão acima ou cole manual)
                        </label>
                        <input
                            id="url"
                            type="url"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="https://res.cloudinary.com/..."
                        />
                    </div>

                    <div>
                        <label htmlFor="coverUrl" className="block text-sm font-semibold text-gray-700 mb-1">
                            URL da Capa do Módulo (Opcional)
                        </label>
                        <input
                            id="coverUrl"
                            type="url"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="https://sua-imagem.com/capa.jpg"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Resolução ideal: <strong>1920x1080 (Proporção 16:9)</strong>. Isso substitui o visualizador padrão da aula por uma capa bonita.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                            Título da Postagem / Aula
                        </label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Ex: Guia Completo PDF - Aula 1"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-none"
                            placeholder="Detalhes sobre este material..."
                        />
                    </div>

                    <div>
                        <label htmlFor="buttonText" className="block text-sm font-semibold text-gray-700 mb-1">
                            Texto do Botão (Opcional)
                        </label>
                        <input
                            id="buttonText"
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Ex: Acessar material"
                        />
                    </div>

                    <div>
                        <label htmlFor="unlockDate" className="block text-sm font-semibold text-gray-700 mb-1">
                            Data de Liberação Atrasada / Drip (Opcional)
                        </label>
                        <input
                            id="unlockDate"
                            type="date"
                            value={unlockDate}
                            onChange={(e) => setUnlockDate(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Se preenchido, o aluno só poderá acessar esta aula a partir deste dia. Ficará com um cadeado caso contrário.
                        </p>
                    </div>

                    {editingId && (
                        <div className="flex justify-end mt-2 mb-4">
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-sm text-text-muted hover:text-gray-900 underline"
                            >
                                Cancelar Edição
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${editingId
                            ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 focus:ring-orange-500'
                            : 'bg-primary hover:bg-primary-hover shadow-blue-500/30 focus:ring-primary'
                            }`}
                    >
                        {editingId ? 'Atualizar Conteúdo' : 'Publicar Conteúdo'}
                    </button>

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            {successMessage}
                        </div>
                    )}
                </div>
            </form>

            <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-surface-200 pb-2">Materiais Postados ({classes.length})</h2>
                {classes.length === 0 ? (
                    <p className="text-sm text-text-muted">Nenhum material publicado ainda.</p>
                ) : (
                    <ul className="space-y-4">
                        {classes.map((item) => {
                            const productAssigned = products.find(p => p.id === item.productId);
                            return (
                                <li key={item.id} className="flex justify-between items-center bg-surface-50 p-4 rounded-xl border border-surface-100">
                                    <div className="flex-1 pr-4 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                {productAssigned ? productAssigned.name : 'Sem Produto'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted mt-1 truncate">{item.cloudinaryUrl}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold focus:outline-none transition-colors border border-blue-100 whitespace-nowrap"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => removeClass(item.id)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold focus:outline-none transition-colors border border-red-100 whitespace-nowrap"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
