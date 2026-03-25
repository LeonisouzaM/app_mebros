import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'sua_url_supabase') {
    console.warn('Configuração do Supabase incompleta no .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
