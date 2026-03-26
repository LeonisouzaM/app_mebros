import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
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

function safePdfName(original?: string) {
    const base = (original || 'documento.pdf').split(/[\\/]/).pop() || 'documento.pdf';
    const trimmed = base.replace(/[^\w.\-()+\s]/g, '').trim();
    return trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed || 'documento'}.pdf`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const auth = requireAdmin(req, res);
    if (!auth) return;

    try {
        const { filename } = (req.body || {}) as { filename?: string };

        const sanitized = safePdfName(filename);
        const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}_${sanitized}`;
        const path = fileName;

        const supabaseAdmin = getSupabaseAdminClient();

        const { data, error } = await supabaseAdmin.storage.from('pdfs').createSignedUploadUrl(path, {
            upsert: true,
        });
        if (error || !data?.token) {
            return res.status(500).json({ error: 'Falha ao criar signed upload URL', details: error?.message });
        }

        const { data: pub } = supabaseAdmin.storage.from('pdfs').getPublicUrl(path);

        return res.status(200).json({
            path,
            token: data.token,
            publicUrl: pub.publicUrl,
        });
    } catch (err: any) {
        console.error('create-pdf-upload error:', err);
        return res.status(500).json({ error: 'Erro interno ao preparar upload', details: err?.message });
    }
}

