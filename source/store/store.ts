import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showToast } from '../hooks/useToast';

export type Role = 'student' | 'admin';

export interface User {
    id: string;
    email: string;
    role: Role;
    name: string;
    photo?: string;
    accessibleProducts?: string[];
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    coverUrl?: string;
    language?: string;
    supportNumber?: string;
    hotmartId?: string;
    banners?: string[];
    createdAt: string;
}

export interface ClassItem {
    id: string;
    title: string;
    cloudinaryUrl: string;
    coverUrl?: string;
    description: string;
    buttonText?: string;
    productId?: string;
    unlockDate?: string;
    attachmentUrl?: string;
    moduleName?: string;
    type?: 'video' | 'pdf' | 'link' | 'image';
    createdAt: string;
}

export interface FeedPost {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    productId?: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    userName: string;
    userPhoto: string;
    userEmail?: string;
    text: string;
    imageUrl?: string;
    productId?: string;
    parentId?: string;
    likesCount?: number;
    hasLiked?: boolean;
    createdAt: string;
    replies?: any[];
}

interface AppState {
    users: User[];
    products: Product[];
    classes: ClassItem[];
    feedPosts: FeedPost[];
    comments: Comment[];
    currentUser: User | null;
    currentProductId: string | null;
    systemBanners: string[];
    authToken: string | null;

    // Actions
    fetchInitialData: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchClasses: () => Promise<void>;
    fetchBanners: () => Promise<void>;
    fetchFeed: (productId?: string) => Promise<void>;
    fetchComments: (productId?: string) => Promise<void>;
    loginWithApi: (email: string) => Promise<boolean>;
    setCurrentUser: (user: User, token?: string) => void;
    logout: () => void;

    addProduct: (item: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
    updateProduct: (id: string, item: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<void>;
    removeProduct: (id: string) => Promise<void>;
    setCurrentProductId: (id: string | null) => void;
    updateSystemBanners: (banners: string[]) => Promise<void>;

    addClass: (item: Omit<ClassItem, 'id' | 'createdAt'>) => Promise<void>;
    updateClass: (id: string, item: Partial<Omit<ClassItem, 'id' | 'createdAt'>>) => Promise<void>;
    removeClass: (id: string) => Promise<void>;
    addFeedPost: (item: Omit<FeedPost, 'id' | 'createdAt'>) => Promise<void>;
    removeFeedPost: (id: string) => Promise<void>;
    addComment: (item: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
    removeComment: (id: string) => Promise<void>;
    likeComment: (commentId: string) => Promise<void>;
    updateProfile: (data: { name?: string; photo?: string }) => Promise<void>;
    addUser: (email: string) => void;
    isLoading: boolean;
}

/** Helper: constrói headers com JWT quando disponível */
function authHeaders(token: string | null): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/** Helper: fetch autenticado com tratamento global de 401/403 */
async function apiFetch(
    url: string,
    options: RequestInit,
    token: string | null,
    onUnauthorized?: () => void
): Promise<Response> {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...authHeaders(token),
            ...(options.headers || {}),
        },
    });

    if (res.status === 401) {
        showToast('Sessão expirada. Faça login novamente.', 'error');
        onUnauthorized?.();
    } else if (res.status === 403) {
        showToast('Você não tem permissão para realizar esta ação.', 'error');
    }

    return res;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            users: [],
            products: [],
            classes: [],
            feedPosts: [],
            comments: [],
            currentUser: null,
            currentProductId: null,
            systemBanners: [],
            authToken: null,
            isLoading: false,

            // Full API login that stores JWT
            loginWithApi: async (email: string): Promise<boolean> => {
                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });

                    const data = await res.json();

                    if (res.ok && data.user && data.token) {
                        set({ currentUser: data.user, authToken: data.token });
                        await get().fetchInitialData();
                        return true;
                    } else {
                        showToast(data.error || 'E-mail não autorizado ou não encontrado.', 'error');
                        return false;
                    }
                } catch (err) {
                    console.error('Erro de conexão ao BD:', err);
                    showToast('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
                    return false;
                }
            },

            setCurrentUser: (user: User, token?: string) =>
                set({ currentUser: user, ...(token ? { authToken: token } : {}) }),

            logout: () => set({ currentUser: null, authToken: null }),

            updateSystemBanners: async (banners) => {
                const previousBanners = get().systemBanners;
                set({ systemBanners: banners });
                try {
                    const res = await apiFetch(
                        '/api/banners',
                        { method: 'POST', body: JSON.stringify({ banners }) },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set({ systemBanners: previousBanners });
                        showToast('Erro ao salvar banners. Tente novamente.', 'error');
                    } else {
                        showToast('Banners atualizados com sucesso!', 'success');
                    }
                } catch (err) {
                    set({ systemBanners: previousBanners });
                    console.error('Erro ao salvar banners:', err);
                    showToast('Erro de rede ao salvar banners.', 'error');
                }
            },

            fetchInitialData: async () => {
                set({ isLoading: true });
                try {
                    await Promise.all([
                        get().fetchProducts(),
                        get().fetchClasses(),
                        get().fetchBanners(),
                        get().fetchFeed(),
                        get().fetchComments(),
                    ]);
                } finally {
                    set({ isLoading: false });
                }
            },

            fetchProducts: async () => {
                try {
                    const res = await apiFetch('/api/products', { method: 'GET' }, get().authToken);
                    if (res.ok) {
                        const data = await res.json();
                        set({ products: data || [] });
                    }
                } catch (err) {
                    console.error('Erro ao buscar produtos do banco:', err);
                }
            },

            fetchClasses: async () => {
                try {
                    const res = await apiFetch('/api/classes', { method: 'GET' }, get().authToken);
                    if (res.ok) {
                        const data = await res.json();
                        set({ classes: data });
                    }
                } catch (err) {
                    console.error('Erro ao buscar aulas do banco:', err);
                }
            },

            fetchBanners: async () => {
                try {
                    const res = await apiFetch('/api/banners', { method: 'GET' }, get().authToken);
                    if (res.ok) {
                        const data = await res.json();
                        set({ systemBanners: data });
                    }
                } catch (err) {
                    console.error('Erro ao buscar banners do banco:', err);
                }
            },

            addProduct: async (item) => {
                const tempId = `prod_${Date.now()}`;
                const newItem = { ...item, id: tempId, createdAt: new Date().toISOString() };

                // Optimistic UI update
                set((state) => ({ products: [...state.products, newItem] }));

                try {
                    const res = await apiFetch(
                        '/api/products',
                        { method: 'POST', body: JSON.stringify(newItem) },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        try {
                            const errorData = await res.json();
                            showToast(`Erro: ${errorData.error || 'Falha ao salvar produto'}`, 'error');
                        } catch {
                            showToast('Erro ao salvar produto. Tente novamente.', 'error');
                        }
                        // Revert
                        set((state) => ({ products: state.products.filter(p => p.id !== tempId) }));
                    } else {
                        showToast('Produto salvo com sucesso!', 'success');
                    }
                } catch (err) {
                    set((state) => ({ products: state.products.filter(p => p.id !== tempId) }));
                    console.error('Erro ao salvar produto no banco:', err);
                    showToast('Erro de rede ao salvar produto.', 'error');
                }
            },

            updateProduct: async (id, updatedItem) => {
                const previous = get().products;
                set((state) => ({
                    products: state.products.map((p) => (p.id === id ? { ...p, ...updatedItem } : p)),
                }));

                const fullProduct = get().products.find(p => p.id === id);
                if (fullProduct) {
                    try {
                        const res = await apiFetch(
                            '/api/products',
                            { method: 'POST', body: JSON.stringify(fullProduct) },
                            get().authToken,
                            () => set({ currentUser: null, authToken: null })
                        );
                        if (!res.ok) {
                            set({ products: previous });
                            showToast('Erro ao atualizar produto.', 'error');
                        } else {
                            showToast('Produto atualizado!', 'success');
                        }
                    } catch (err) {
                        set({ products: previous });
                        console.error('Erro ao atualizar produto no banco:', err);
                        showToast('Erro de rede ao atualizar produto.', 'error');
                    }
                }
            },

            removeProduct: async (id) => {
                const previous = get().products;
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                    currentProductId: state.currentProductId === id ? null : state.currentProductId,
                }));

                try {
                    const res = await apiFetch(
                        `/api/products?id=${id}`,
                        { method: 'DELETE' },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set({ products: previous });
                        showToast('Erro ao remover produto.', 'error');
                    } else {
                        showToast('Produto removido.', 'success');
                    }
                } catch (err) {
                    set({ products: previous });
                    console.error('Erro ao deletar produto no banco:', err);
                    showToast('Erro de rede ao remover produto.', 'error');
                }
            },

            setCurrentProductId: (id) => set({ currentProductId: id }),

            addClass: async (item) => {
                const tempId = `class_${Date.now()}`;
                const newItem = { ...item, id: tempId, createdAt: new Date().toISOString() };
                set((state) => ({ classes: [...state.classes, newItem] }));

                try {
                    const res = await apiFetch(
                        '/api/classes',
                        { method: 'POST', body: JSON.stringify(newItem) },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set((state) => ({ classes: state.classes.filter(c => c.id !== tempId) }));
                        showToast('Erro ao salvar aula.', 'error');
                    } else {
                        showToast('Aula salva com sucesso!', 'success');
                    }
                } catch (err) {
                    set((state) => ({ classes: state.classes.filter(c => c.id !== tempId) }));
                    console.error('Erro ao salvar aula:', err);
                    showToast('Erro de rede ao salvar aula.', 'error');
                }
            },

            updateClass: async (id, updatedItem) => {
                const previous = get().classes;
                set((state) => ({
                    classes: state.classes.map((c) => (c.id === id ? { ...c, ...updatedItem } : c)),
                }));

                const fullClass = get().classes.find(c => c.id === id);
                if (fullClass) {
                    try {
                        const res = await apiFetch(
                            '/api/classes',
                            { method: 'POST', body: JSON.stringify(fullClass) },
                            get().authToken,
                            () => set({ currentUser: null, authToken: null })
                        );
                        if (!res.ok) {
                            set({ classes: previous });
                            showToast('Erro ao atualizar aula.', 'error');
                        } else {
                            showToast('Aula atualizada!', 'success');
                        }
                    } catch (err) {
                        set({ classes: previous });
                        console.error('Erro ao atualizar aula:', err);
                        showToast('Erro de rede ao atualizar aula.', 'error');
                    }
                }
            },

            removeClass: async (id) => {
                const previous = get().classes;
                set((state) => ({ classes: state.classes.filter((c) => c.id !== id) }));

                try {
                    const res = await apiFetch(
                        `/api/classes?id=${id}`,
                        { method: 'DELETE' },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set({ classes: previous });
                        showToast('Erro ao remover aula.', 'error');
                    } else {
                        showToast('Aula removida.', 'success');
                    }
                } catch (err) {
                    set({ classes: previous });
                    console.error('Erro ao deletar aula:', err);
                    showToast('Erro de rede ao remover aula.', 'error');
                }
            },

            fetchFeed: async (productId) => {
                try {
                    const url = productId ? `/api/feed?productId=${productId}` : '/api/feed';
                    const res = await apiFetch(url, { method: 'GET' }, get().authToken);
                    if (res.ok) {
                        const data = await res.json();
                        set({ feedPosts: data });
                    }
                } catch (err) {
                    console.error('Erro ao buscar feed:', err);
                }
            },

            fetchComments: async (productId) => {
                try {
                    const url = productId ? `/api/community?productId=${productId}` : '/api/community';
                    const res = await apiFetch(url, { method: 'GET' }, get().authToken);
                    if (res.ok) {
                        const data = await res.json();
                        set({ comments: data });
                    }
                } catch (err) {
                    console.error('Erro ao buscar comunidade:', err);
                }
            },

            addFeedPost: async (item) => {
                const tempId = `post_${Date.now()}`;
                const newItem = { ...item, id: tempId, createdAt: new Date().toISOString() };
                set((state) => ({ feedPosts: [newItem, ...state.feedPosts] }));

                try {
                    const res = await apiFetch(
                        '/api/feed',
                        { method: 'POST', body: JSON.stringify(newItem) },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set((state) => ({ feedPosts: state.feedPosts.filter(p => p.id !== tempId) }));
                        showToast('Erro ao publicar post.', 'error');
                    } else {
                        showToast('Post publicado!', 'success');
                    }
                } catch (err) {
                    set((state) => ({ feedPosts: state.feedPosts.filter(p => p.id !== tempId) }));
                    console.error('Erro ao salvar post no feed:', err);
                    showToast('Erro de rede ao publicar post.', 'error');
                }
            },

            removeFeedPost: async (id) => {
                const previous = get().feedPosts;
                set((state) => ({ feedPosts: state.feedPosts.filter((p) => p.id !== id) }));

                try {
                    const res = await apiFetch(
                        `/api/feed?id=${id}`,
                        { method: 'DELETE' },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set({ feedPosts: previous });
                        showToast('Erro ao remover post.', 'error');
                    }
                } catch (err) {
                    set({ feedPosts: previous });
                    console.error('Erro ao deletar post do feed:', err);
                    showToast('Erro de rede ao remover post.', 'error');
                }
            },

            addComment: async (item) => {
                const tempId = `comm_${Date.now()}`;
                const newItem = { ...item, id: tempId, createdAt: new Date().toISOString() };

                if (item.parentId) {
                    // É uma resposta — adicionar dentro do replies do comentário pai
                    set((state) => ({
                        comments: state.comments.map(c =>
                            c.id === item.parentId
                                ? { ...c, replies: [...(c.replies || []), newItem] }
                                : c
                        )
                    }));
                } else {
                    // É um post novo — vai para o topo da lista
                    set((state) => ({ comments: [newItem, ...state.comments] }));
                }

                const revert = () => {
                    if (item.parentId) {
                        set((state) => ({
                            comments: state.comments.map(c =>
                                c.id === item.parentId
                                    ? { ...c, replies: (c.replies || []).filter(r => r.id !== tempId) }
                                    : c
                            )
                        }));
                    } else {
                        set((state) => ({ comments: state.comments.filter(c => c.id !== tempId) }));
                    }
                };

                try {
                    const res = await apiFetch(
                        '/api/community',
                        { method: 'POST', body: JSON.stringify(newItem) },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        console.error('Erro ao enviar comentário — resposta do servidor:', res.status, errData);
                        revert();
                        showToast('Erro ao enviar comentário.', 'error');
                    } else {
                        // Substituir o ID temporário pelo ID real do banco
                        const data = await res.json().catch(() => ({}));
                        if (data.id) {
                            const realId = String(data.id);
                            if (item.parentId) {
                                set((state) => ({
                                    comments: state.comments.map(c =>
                                        c.id === item.parentId
                                            ? { ...c, replies: (c.replies || []).map(r => r.id === tempId ? { ...r, id: realId } : r) }
                                            : c
                                    )
                                }));
                            } else {
                                set((state) => ({
                                    comments: state.comments.map(c => c.id === tempId ? { ...c, id: realId } : c)
                                }));
                            }
                        }
                    }
                } catch (err) {
                    revert();
                    console.error('Erro ao salvar comentário:', err);
                    showToast('Erro de rede ao enviar comentário.', 'error');
                }
            },

            removeComment: async (id) => {
                const previous = get().comments;
                set((state) => ({ comments: state.comments.filter(c => c.id !== id) }));
                try {
                    const res = await apiFetch(
                        `/api/community?id=${id}`,
                        { method: 'DELETE' },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        set({ comments: previous });
                        showToast('Erro ao remover comentário.', 'error');
                    }
                } catch (err) {
                    set({ comments: previous });
                    console.error('Erro ao remover comentário:', err);
                    showToast('Erro de rede ao remover comentário.', 'error');
                }
            },

            likeComment: async (commentId: string) => {
                // Optimistic update
                set((state) => ({
                    comments: state.comments.map(c => {
                        if (c.id === commentId) {
                            const newHasLiked = !c.hasLiked;
                            return {
                                ...c,
                                hasLiked: newHasLiked,
                                likesCount: (c.likesCount || 0) + (newHasLiked ? 1 : -1)
                            };
                        }
                        return c;
                    })
                }));

                try {
                    const res = await apiFetch(
                        '/api/community?action=like',
                        { method: 'POST', body: JSON.stringify({ commentId }) },
                        get().authToken,
                        () => set({ currentUser: null, authToken: null })
                    );
                    if (!res.ok) {
                        // Revert on failure
                        set((state) => ({
                            comments: state.comments.map(c => {
                                if (c.id === commentId) {
                                    const revertHasLiked = !c.hasLiked;
                                    return {
                                        ...c,
                                        hasLiked: revertHasLiked,
                                        likesCount: (c.likesCount || 0) + (revertHasLiked ? 1 : -1)
                                    };
                                }
                                return c;
                            })
                        }));
                    }
                } catch (err) {
                    console.error('Erro ao dar like:', err);
                }
            },

            updateProfile: async (data: { name?: string; photo?: string }) => {
                const token = get().authToken;
                const res = await apiFetch('/api/auth/profile', {
                    method: 'POST',
                    body: JSON.stringify(data)
                }, token, () => set({ currentUser: null, authToken: null }));

                if (res.ok) {
                    const result = await res.json();
                    set((state) => ({ currentUser: { ...state.currentUser, ...result.user } as typeof state.currentUser }));
                    showToast('Perfil atualizado com sucesso!', 'success');
                } else {
                    const error = await res.json();
                    showToast(error.error || 'Erro ao atualizar perfil', 'error');
                }
            },

            addUser: (email: string) => {
                const newUser: User = {
                    id: `manual_${Date.now()}`,
                    email,
                    role: 'student',
                    name: email.split('@')[0],
                    accessibleProducts: [],
                };
                set((state) => ({ users: [...state.users, newUser] }));
            },
        }),
        {
            name: 'area-membros-storage',
            // Persist token along with user state
            partialize: (state) => ({
                currentUser: state.currentUser,
                authToken: state.authToken,
                currentProductId: state.currentProductId,
            }),
        }
    )
);
