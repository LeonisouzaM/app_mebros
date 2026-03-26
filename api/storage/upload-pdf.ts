import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import { readFile } from 'node:fs/promises';
import { requireAdmin } from '../_lib/authMiddleware.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdminClient() {
    if (!SUPABASE_URL) throw new Error('SUPABASE_URL is missing');
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const auth = requireAdmin(req, res);
    if (!auth) return;

    try {
        const form = new IncomingForm({ multiples: false, maxFileSize: 50 * 1024 * 1024 });

        const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });

        const file = files?.file;
        const uploaded = Array.isArray(file) ? file[0] : file;
        if (!uploaded) {
            return res.status(400).json({ error: 'Arquivo ausente (campo "file")' });
        }

        const mimetype: string | undefined = uploaded.mimetype;
        if (mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Apenas PDF é permitido' });
        }

        const originalName: string = uploaded.originalFilename || 'documento.pdf';
        const safeExt = originalName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'pdf';
        const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${safeExt}`;
        const filePath = fileName;

        const buffer = await readFile(uploaded.filepath);

        const supabaseAdmin = getSupabaseAdminClient();
        const { error: uploadError } = await supabaseAdmin.storage.from('pdfs').upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: true,
        });
        if (uploadError) {
            return res.status(500).json({ error: `Erro ao enviar PDF: ${uploadError.message}` });
        }

        const { data } = supabaseAdmin.storage.from('pdfs').getPublicUrl(filePath);
        return res.status(200).json({ publicUrl: data.publicUrl, path: filePath });
    } catch (err: any) {
        console.error('upload-pdf error:', err);
        return res.status(500).json({ error: 'Erro interno ao processar upload', details: err?.message });
    }
}

