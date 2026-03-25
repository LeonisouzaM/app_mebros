import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/store';
import { UploadCloud, CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';

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
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [moduleName, setModuleName] = useState('Módulo 1');
    const [type, setType] = useState<'video' | 'pdf' | 'link' | 'image'>('video');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('Conteúdo publicado com sucesso!');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'primary' | 'attachment' | 'cover' = 'primary') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError('');

        // Se for PDF, enviamos para Vercel Blob (mais estável para mobile)
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            try {
                // Upload direto pelo navegador (pula o limite de 5MB do Vercel API)
                const blob = await upload(file.name, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                });

                if (blob.url) {
                    if (field === 'primary') {
                        setUrl(blob.url);
                        setType('pdf');
                    } else if (field === 'attachment') {
                        setAttachmentUrl(blob.url);
                    } else if (field === 'cover') {
                        setCoverUrl(blob.url);
                    }
                } else {
                    setUploadError('Erro ao subir para Vercel Blob. Verifique o Storage no painel Vercel.');
                }
            } catch (err) {
                console.error('Vercel Blob Upload Error:', err);
                setUploadError('Houve uma falha na conexão. Tente novamente ou verifique se o arquivo ultrapassa o limite da conta Hobby (250MB total).');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (attachmentInputRef.current) attachmentInputRef.current.value = '';
            }
            return;
        }

        // Senão (vídeos/imagens), continua usando Cloudinary se configurado
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === 'seu_cloud_name') {
            setUploadError('Para subir vídeos/fotos use o Cloudinary ou configure o Vercel Blob.');
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            let resourceType = 'auto';
            if (file.type.startsWith('video/')) {
                resourceType = 'video';
            }

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.secure_url) {
                if (field === 'primary') {
                    setUrl(data.secure_url);
                    if (file.type.startsWith('video/')) setType('video');
                    else if (file.type.startsWith('image/')) setType('image');
                } else if (field === 'cover') {
                    setCoverUrl(data.secure_url);
                } else {
                    setAttachmentUrl(data.secure_url);
                }
            } else {
                setUploadError(data.error?.message || 'Erro do Cloudinary ao salvar o arquivo.');
            }
        } catch (err) {
            setUploadError('Erro de conexão durante o upload no Cloudinary.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        if (editingId) {
            updateClass(editingId, { title, cloudinaryUrl: url, coverUrl: coverUrl || undefined, description, buttonText: buttonText || undefined, productId: productId || undefined, unlockDate: unlockDate || undefined, type, attachmentUrl: attachmentUrl || undefined, moduleName });
            setSuccessMessage('Conteúdo atualizado com sucesso!');
        } else {
            // Default to 'default' product if none selected and products exist
            const finalProductId = productId || (products.length > 0 ? products[0].id : undefined);
            addClass({ title, cloudinaryUrl: url, coverUrl: coverUrl || undefined, description, buttonText: buttonText || undefined, productId: finalProductId, unlockDate: unlockDate || undefined, type, attachmentUrl: attachmentUrl || undefined, moduleName });
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
        setAttachmentUrl(item.attachmentUrl || '');
        setModuleName(item.moduleName || 'Módulo 1');
        setType(item.type || 'video');
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
        setAttachmentUrl('');
        setModuleName('Módulo 1');
        setType('video');
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

                        {/* Hidden inputs — one per upload type to avoid conflicts */}
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e, 'primary')}
                        />
                        <input
                            type="file"
                            className="hidden"
                            ref={attachmentInputRef}
                            accept=".pdf,application/pdf"
                            onChange={(e) => handleFileUpload(e, 'attachment')}
                        />
                        <input
                            type="file"
                            className="hidden"
                            ref={coverInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'cover')}
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
                        <div className="grid md:grid-cols-2 gap-6">
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
                            <div>
                                <label htmlFor="moduleName" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Em qual Módulo?
                                </label>
                                <input
                                    id="moduleName"
                                    type="text"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                                    placeholder="Ex: Módulo 1, Módulo 2..."
                                />
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Tipo de Conteúdo / Aula
                                </label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 font-bold text-primary"
                                >
                                    <option value="video">🎥 Vídeo Aula (Cloudinary Player)</option>
                                    <option value="pdf">📄 Material PDF / Download</option>
                                    <option value="link">🔗 Link Externo / Site</option>
                                    <option value="image">🖼️ Imagem / Infográfico</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-1">
                            URL do Arquivo Principal (Opcional - Deixe em branco se for só texto)
                        </label>
                        <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="https://res.cloudinary.com/..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="attachmentUrl" className="block text-sm font-semibold text-gray-700">
                                Material de Apoio / PDF Extra (Opcional)
                            </label>
                            <button
                                type="button"
                                onClick={() => attachmentInputRef.current?.click()}
                                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase hover:bg-primary/20 transition-colors"
                            >
                                Carregar PDF Agora
                            </button>
                        </div>
                        <input
                            id="attachmentUrl"
                            type="url"
                            value={attachmentUrl}
                            onChange={(e) => setAttachmentUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Link do material complementar..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="coverUrl" className="block text-sm font-semibold text-gray-700">
                                Capa da Aula / Módulo (Opcional)
                            </label>
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                                📷 Enviar Imagem
                            </button>
                        </div>
                        <input
                            id="coverUrl"
                            type="url"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50"
                            placeholder="Cole um link direto de imagem OU use o botão acima."
                        />
                        <p className="text-xs text-text-muted mt-1">
                            ⚠️ Links do <strong>Canva</strong> não funcionam aqui — use o botão <strong>"📷 Enviar Imagem"</strong> para fazer upload direto da imagem exportada do Canva.
                        </p>
                        {/* Live Preview */}
                        {coverUrl && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-surface-200 shadow-sm aspect-video bg-surface-50 relative">
                                <img
                                    src={coverUrl}
                                    alt="Prévia da capa"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-red-50">
                                    <p className="text-red-500 text-xs font-bold">❌ Imagem não pôde ser carregada</p>
                                    <p className="text-red-400 text-[10px] mt-1">Este link não é uma imagem direta. Use o botão "📷 Enviar Imagem".</p>
                                </div>
                            </div>
                        )}
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
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                                Descrição (Opcional)
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    const url = window.prompt('1. Cole o endereço do link (URL):');
                                    if (!url) return;
                                    const text = window.prompt('2. Qual texto deve aparecer clicável? (Ex: Acessar Aula)');
                                    if (!text) return;
                                    setDescription(prev => prev + ` [${text}](${url})`);
                                }}
                                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                                🔗 Inserir Link
                            </button>
                        </div>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface-50 resize-none"
                            placeholder="Detalhes sobre este material..."
                        />
                        <p className="text-[11px] text-text-muted mt-1">
                            Dica: Para esconder um link longo com um texto curto, digite assim: <strong>[Seu Texto Aqui](https://seulink.com)</strong> ou use o botão acima.
                        </p>
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
                                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                                {item.type || 'link'}
                                            </span>
                                            {item.attachmentUrl && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                                    📎 Com Anexo
                                                </span>
                                            )}
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
