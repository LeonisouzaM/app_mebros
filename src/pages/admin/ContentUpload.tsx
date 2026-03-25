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
            setUploadError('Por favor, adicione suas chaves do Cloudinary em seu painel / .env.');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            let resourceType = file.type.startsWith('video/') ? 'video' : 'auto';

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
            setUploadError('Erro de conexão durante o upload.');
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

        const accessData = { 
            title, 
            cloudinaryUrl: url, 
            coverUrl: coverUrl || undefined, 
            description, 
            buttonText: buttonText || undefined, 
            productId: productId || (products.length > 0 ? products[0].id : undefined), 
            unlockDate: unlockDate || undefined, 
            type, 
            attachmentUrl: attachmentUrl || undefined, 
            moduleName 
        };

        if (editingId) {
            updateClass(editingId, accessData);
            setSuccessMessage('Conteúdo atualizado com sucesso!');
        } else {
            addClass(accessData);
            setSuccessMessage('Conteúdo publicado com sucesso!');
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
                <p className="text-sm text-text-muted mt-1">Configure todas as opções da sua nova aula abaixo.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <div className="space-y-6">

                    {/* Sessão de Upload Rápido Cloudinary */}
                    <div className="bg-surface-50 p-6 rounded-2xl border border-dashed border-primary/40 text-center">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Enviar do seu Computador (PDF, Imagem, Vídeo)</h3>
                        <p className="text-[10px] text-text-muted mb-4 max-w-sm mx-auto">O arquivo será enviado para o Cloudinary e o link preenchido abaixo automaticamente.</p>
                        
                        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'primary')} />
                        <input type="file" className="hidden" ref={attachmentInputRef} accept=".pdf,application/pdf" onChange={(e) => handleFileUpload(e, 'attachment')} />
                        <input type="file" className="hidden" ref={coverInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="inline-flex items-center gap-2 py-2 px-6 border border-primary text-primary bg-white rounded-xl shadow-sm hover:bg-blue-50 font-semibold"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                            ) : (
                                <><FileUp className="w-4 h-4" /> Escolher Arquivo para Aula</>
                            )}
                        </button>
                    </div>

                    {/* Campos de Organização */}
                    {products.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Produto</label>
                                <select value={productId || products[0].id} onChange={(e) => setProductId(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Módulo</label>
                                <input type="text" value={moduleName} onChange={(e) => setModuleName(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50" placeholder="Ex: Módulo 1" />
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Aula</label>
                            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 font-bold text-primary">
                                <option value="video">🎥 Vídeo Aula</option>
                                <option value="pdf">📄 Material PDF</option>
                                <option value="link">🔗 Link Externo</option>
                                <option value="image">🖼️ Imagem</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título da Aula</label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50" />
                        </div>
                    </div>

                    {/* Capas e Links Principais */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-[10px] font-bold text-gray-700 uppercase">Capa da Aula (Opcional)</label>
                                <button type="button" onClick={() => coverInputRef.current?.click()} className="text-[10px] text-primary font-bold">CARREGAR CAPA</button>
                            </div>
                            <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 text-[11px]" placeholder="Link da imagem..." />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Link do Conteúdo Principal</label>
                            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 text-[11px]" placeholder="URL do Video ou PDF..." />
                        </div>
                    </div>

                    {/* Material de Apoio Extra */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase">Material de Apoio PDF Extra (Opcional)</label>
                            <button type="button" onClick={() => attachmentInputRef.current?.click()} className="text-[10px] text-primary font-bold">CARREGAR APOIO</button>
                        </div>
                        <input type="url" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50" placeholder="Link do PDF complementar..." />
                    </div>

                    {/* Descrição com atalho para link */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase">Descrição da Aula</label>
                            <button
                                type="button"
                                onClick={() => {
                                    const l = window.prompt('URL:');
                                    if (l) {
                                        const t = window.prompt('Texto do Link:');
                                        setDescription(p => p + ` [${t || 'Acessar'}](${l})`);
                                    }
                                }}
                                className="text-[10px] text-primary font-bold"
                            >
                                🔗 INSERIR LINK
                            </button>
                        </div>
                        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 text-sm" placeholder="O que o aluno vai aprender nesta aula?" />
                    </div>

                    {/* Botões e Datas */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Texto do Botão (Ex: Baixar agora)</label>
                            <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Data de Liberação (Drip)</label>
                            <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50" />
                        </div>
                    </div>

                    {uploadError && <p className="text-xs font-bold text-red-500 text-center">{uploadError}</p>}

                    <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20">
                        {editingId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NO CURSO'}
                    </button>

                    {success && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> <strong>{successMessage}</strong>
                        </div>
                    )}
                </div>
            </form>

            {/* Listagem Final */}
            <div className="mt-8 bg-white p-6 rounded-3xl border border-surface-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 tracking-tight uppercase text-xs opacity-50">Aulas Postadas ({classes.length})</h2>
                <ul className="space-y-3">
                    {classes.map((item) => (
                        <li key={item.id} className="flex justify-between items-center bg-surface-50 p-4 rounded-2xl border border-surface-100">
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-bold text-slate-800 text-sm truncate">{item.title}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.moduleName || 'Sem Módulo'} • {item.type}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="px-4 py-1.5 bg-white text-blue-600 rounded-xl text-xs font-bold border border-blue-50 hover:bg-blue-50 transition-colors">Editar</button>
                                <button onClick={() => removeClass(item.id)} className="px-4 py-1.5 bg-white text-red-600 rounded-lg text-xs font-bold border border-red-50 hover:bg-red-50 transition-colors">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
