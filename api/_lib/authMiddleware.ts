import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Extrai e verifica o JWT do header Authorization.
 * Retorna o payload se válido, ou null se inválido/ausente.
 */
export function verifyToken(req: VercelRequest): AuthPayload | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        return payload;
    } catch {
        return null;
    }
}

/**
 * Middleware de autenticação — verifica o token e rejeita se inválido.
 * Retorna true se autenticado, false (e já respondeu 401) se não.
 */
export function requireAuth(
    req: VercelRequest,
    res: VercelResponse
): AuthPayload | false {
    const payload = verifyToken(req);
    if (!payload) {
        res.status(401).json({ error: 'Não autorizado. Token inválido ou ausente.' });
        return false;
    }
    return payload;
}

/**
 * Middleware de autenticação de ADMIN — rejeita com 403 se não for admin.
 */
export function requireAdmin(
    req: VercelRequest,
    res: VercelResponse
): AuthPayload | false {
    const payload = requireAuth(req, res);
    if (!payload) return false;
    if (payload.role !== 'admin') {
        res.status(403).json({ error: 'Acesso negado. Privilégios de administrador necessários.' });
        return false;
    }
    return payload;
}

/**
 * Gera um JWT assinado para o usuário.
 */
export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
