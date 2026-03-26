import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/store';
import { CheckCircle2, FileUp, Loader2, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
    const [successMessage, setSuccessMessage] = useState('');
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

        if (file.type === 'application/pdf') {
            const bucketName = 'pdfs'; 
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            try {
                const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
                    contentType: 'application/pdf',
                    upsert: true,
                });
                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);

                if (field === 'primary') {
                    setUrl(publicUrl);
                    setType('pdf');
                } else if (field === 'attachment') {
                    setAttachmentUrl(publicUrl);
                } else {
                    setCoverUrl(publicUrl);
                }
                
                setSuccessMessage('PDF enviado com sucesso para o Supabase!');
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);

            } catch (err: any) {
                setUploadError(`Erro Supabase: ${err.message || 'Verifique se o bucket "pdfs" existe e é público.'}`);
            } finally {
                setIsUploading(false);
            }
            return;
        }

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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
                    else if (file.type.startsWith('image/')) setType('image');
                } else if (field === 'cover') {
                    setCoverUrl(data.secure_url);
                } else {
                    setAttachmentUrl(data.secure_url);
                }
            } else {
                setUploadError(data.error?.message || 'Erro do Cloudinary.');
            }
        } catch (err) {
            setUploadError('Erro de conexão durante o upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const accessData = { 
            title, cloudinaryUrl: url, coverUrl: coverUrl || undefined, 
            description, buttonText: buttonText || undefined, 
            productId: productId || (products.length > 0 ? products[0].id : undefined), 
            unlockDate: unlockDate || undefined, type, 
            attachmentUrl: attachmentUrl || undefined, moduleName 
        };

        if (editingId) {
            updateClass(editingId, accessData);
            setSuccessMessage('Conteúdo atualizado com sucesso!');
        } else {
            addClass(accessData);
            setSuccessMessage('Aula publicada com sucesso!');
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
                    <Database className="text-primary h-6 w-6" />
                    Gerenciador de Conteúdo
                </h1>
                <p className="text-sm text-text-muted mt-1">Híbrido: PDF (Supabase) | Media (Cloudinary)</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-surface-200">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-primary/30 text-center hover:bg-slate-100 transition-all group overflow-hidden relative">
                        {isUploading && (
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10">
                                <div className="h-full bg-primary animate-progress origin-left" />
                             </div>
                        )}
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Selecione o Conteúdo da Aula</h3>
                        <p className="text-[10px] text-text-muted mb-4 max-w-sm mx-auto">Vincule vídeo ou PDF do seu computador direto na aula.</p>
                        
                        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'primary')} />
                        <input type="file" className="hidden" ref={attachmentInputRef} accept=".pdf,application/pdf" onChange={(e) => handleFileUpload(e, 'attachment')} />
                        <input type="file" className="hidden" ref={coverInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="inline-flex items-center gap-2 py-2.5 px-6 bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />} Selecionar Aula da Máquina
                        </button>
                    </div>

                    {products.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-tight">Produto</label>
                                <select value={productId || products[0].id} onChange={(e) => setProductId(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 font-bold">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-tight">Módulo</label>
                                <input type="text" value={moduleName} onChange={(e) => setModuleName(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50" />
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-tight">Tipo de Atividade</label>
                            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 font-bold text-primary">
                                <option value="video">🎥 Vídeo Aula</option>
                                <option value="pdf">📄 Material PDF</option>
                                <option value="link">🔗 Link Externo</option>
                                <option value="image">🖼️ Imagem</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-tight">Título</label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 font-bold" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-tight mb-1">Capa Aula (Link)</label>
                            <input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 text-[11px]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-tight">URL Destino</label>
                            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 text-[11px]" />
                        </div>
                    </div>

                    <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-surface-50 text-sm" placeholder="Descrição da aula..." />

                    {uploadError && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">{uploadError}</div>
                    )}

                    <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                        {editingId ? 'Salvar Edição' : 'Publicar Aula'}
                    </button>

                    {success && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center justify-center gap-2 animate-in slide-in-from-top-4">
                            <CheckCircle2 className="w-5 h-5" /> <strong>{successMessage}</strong>
                        </div>
                    )}
                </div>
            </form>

            <div className="mt-8 bg-white p-6 rounded-3xl border border-surface-200 shadow-sm opacity-90">
                <h2 className="text-[10px] font-black text-gray-400 mb-4 tracking-widest uppercase">CONTEÚDOS PUBLICADOS ({classes.length})</h2>
                <ul className="space-y-3">
                    {classes.map((item) => (
                        <li key={item.id} className="flex justify-between items-center bg-surface-50 p-4 rounded-2xl border border-surface-100 hover:bg-white hover:shadow-md transition-all group">
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-bold text-slate-800 text-sm truncate">{item.title}</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{item.moduleName || 'Geral'} • {item.type}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="px-5 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black border border-blue-50 hover:bg-blue-50 transition-all uppercase">EDITAR</button>
                                <button onClick={() => removeClass(item.id)} className="px-5 py-2 bg-white text-red-600 rounded-xl text-[10px] font-black border border-red-50 hover:bg-red-50 transition-all uppercase">EXCLUIR</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
