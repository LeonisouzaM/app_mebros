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

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === 'seu_cloud_name') {
            setUploadError('Por favor, adicione suas chaves do Cloudinary no arquivo .env.');
            return;
        }

        setIsUploading(true);
        setUploadError('');

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
                    else if (file.type === 'application/pdf') setType('pdf');
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
            if (attachmentInputRef.current) attachmentInputRef.current.value = '';
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        if (editingId) {
            updateClass(editingId, { title, cloudinaryUrl: url, coverUrl: coverUrl || undefined, description, buttonText: buttonText || undefined, productId: productId || undefined, unlockDate: unlockDate || undefined, type, attachmentUrl: attachmentUrl || undefined, moduleName });
            setSuccessMessage('Conteúdo atualizado com sucesso!');
        } else {
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
                            O arquivo será enviado para o seu Cloudinary automaticamente.
                        </p>

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

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="inline-flex items-center gap-2 py-2 px-6 border border-primary text-primary bg-white rounded-xl shadow-sm hover:bg-blue-50 font-semibold transition-all disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando para Cloudinary...
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

                    {products.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Produto</label>
                                <select
                                    value={productId || products[0].id}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50"
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Módulo</label>
                                <input
                                    type="text"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Conteúdo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 font-bold text-primary"
                        >
                            <option value="video">🎥 Vídeo Aula</option>
                            <option value="pdf">📄 Material PDF</option>
                            <option value="link">🔗 Link Externo</option>
                            <option value="image">🖼️ Imagem</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Link do Arquivo Principal</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50"
                            placeholder="https://res.cloudinary.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {editingId ? 'Atualizar Conteúdo' : 'Publicar Conteúdo'}
                    </button>

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            {successMessage}
                        </div>
                    )}
                </div>
            </form>

            <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-surface-200 pb-2">Materiais ({classes.length})</h2>
                <ul className="space-y-4">
                    {classes.map((item) => (
                        <li key={item.id} className="flex justify-between items-center bg-surface-50 p-4 rounded-xl border border-surface-100">
                            <div className="flex-1 pr-4 min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                                <p className="text-[10px] text-text-muted truncate">{item.cloudinaryUrl}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">Editar</button>
                                <button onClick={() => removeClass(item.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
