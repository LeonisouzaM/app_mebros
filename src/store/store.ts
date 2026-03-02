import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    createdAt: string;
}

export interface FeedPost {
    id: string;
    title: string;
    description: string;
    productId?: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    userName: string;
    userPhoto: string;
    text: string;
    productId?: string;
    createdAt: string;
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

    // Actions
    fetchInitialData: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchClasses: () => Promise<void>;
    fetchBanners: () => Promise<void>;
    fetchFeed: (productId?: string) => Promise<void>;
    fetchComments: (productId?: string) => Promise<void>;
    login: (email: string) => boolean;
    setCurrentUser: (user: User) => void;
    logout: () => void;
    addUser: (email: string) => void;

    addProduct: (item: Omit<Product, 'id' | 'createdAt'>) => void;
    updateProduct: (id: string, item: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
    removeProduct: (id: string) => void;
    setCurrentProductId: (id: string | null) => void;
    updateSystemBanners: (banners: string[]) => void;

    addClass: (item: Omit<ClassItem, 'id' | 'createdAt'>) => void;
    updateClass: (id: string, item: Partial<Omit<ClassItem, 'id' | 'createdAt'>>) => void;
    removeClass: (id: string) => void;
    addFeedPost: (item: Omit<FeedPost, 'id' | 'createdAt'>) => void;
    removeFeedPost: (id: string) => void;
    addComment: (item: Omit<Comment, 'id' | 'createdAt'>) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            users: [
                { id: '1', email: 'admin@admin.com', role: 'admin', name: 'Admin', photo: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff' },
                { id: '2', email: 'aluno@teste.com', role: 'student', name: 'Aluno Teste', photo: 'https://ui-avatars.com/api/?name=Aluno&background=10B981&color=fff' },
            ],
            products: [
                { id: 'default', name: 'Projeto Inicial', description: 'Seu primeiro produto / curso.', language: 'pt', createdAt: new Date().toISOString() }
            ],
            classes: [],
            feedPosts: [],
            comments: [],
            currentUser: null,
            currentProductId: null,
            systemBanners: [],

            login: (email: string) => {
                const user = get().users.find((u) => u.email === email);
                if (user) {
                    set({ currentUser: user });
                    return true;
                }
                return false;
            },
            setCurrentUser: (user: User) => set({ currentUser: user }),
            logout: () => set({ currentUser: null }),
            addUser: (email: string) =>
                set((state) => ({
                    users: [
                        ...state.users,
                        {
                            id: Date.now().toString(),
                            email,
                            role: 'student',
                            name: email.split('@')[0],
                            photo: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=3B82F6&color=fff`,
                        },
                    ],
                })),
            updateSystemBanners: async (banners) => {
                set({ systemBanners: banners });
                try {
                    await fetch('/api/banners', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ banners })
                    });
                } catch (err) {
                    console.error('Erro ao salvar banners:', err);
                }
            },

            fetchInitialData: async () => {
                await Promise.all([
                    get().fetchProducts(),
                    get().fetchClasses(),
                    get().fetchBanners(),
                    get().fetchFeed(),
                    get().fetchComments()
                ]);
            },

            fetchProducts: async () => {
                try {
                    const res = await fetch('/api/products');
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
                    const res = await fetch('/api/classes');
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
                    const res = await fetch('/api/banners');
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
                    await fetch('/api/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newItem)
                    });
                } catch (err) {
                    console.error('Erro ao salvar produto no banco:', err);
                }
            },

            updateProduct: async (id, updatedItem) => {
                // Optimistic UI update
                set((state) => ({
                    products: state.products.map((p) => (p.id === id ? { ...p, ...updatedItem } : p)),
                }));

                const fullProduct = get().products.find(p => p.id === id);
                if (fullProduct) {
                    try {
                        await fetch('/api/products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(fullProduct)
                        });
                    } catch (err) {
                        console.error('Erro ao atualizar produto no banco:', err);
                    }
                }
            },

            removeProduct: async (id) => {
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                    currentProductId: state.currentProductId === id ? null : state.currentProductId,
                }));

                try {
                    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
                } catch (err) {
                    console.error('Erro ao deletar produto no banco:', err);
                }
            },
            setCurrentProductId: (id) => set({ currentProductId: id }),
            addClass: async (item) => {
                const tempId = `class_${Date.now()}`;
                const newItem = { ...item, id: tempId, createdAt: new Date().toISOString() };
                set((state) => ({ classes: [...state.classes, newItem] }));

                try {
                    await fetch('/api/classes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newItem)
                    });
                } catch (err) {
                    console.error('Erro ao salvar aula:', err);
                }
            },

            updateClass: async (id, updatedItem) => {
                set((state) => ({
                    classes: state.classes.map((c) => (c.id === id ? { ...c, ...updatedItem } : c)),
                }));

                const fullClass = get().classes.find(c => c.id === id);
                if (fullClass) {
                    try {
                        await fetch('/api/classes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(fullClass)
                        });
                    } catch (err) {
                        console.error('Erro ao atualizar aula:', err);
                    }
                }
            },

            removeClass: async (id) => {
                set((state) => ({
                    classes: state.classes.filter((c) => c.id !== id),
                }));

                try {
                    await fetch(`/api/classes?id=${id}`, { method: 'DELETE' });
                } catch (err) {
                    console.error('Erro ao deletar aula:', err);
                }
            },

            fetchFeed: async (productId) => {
                try {
                    const url = productId ? `/api/feed?productId=${productId}` : '/api/feed';
                    const res = await fetch(url);
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
                    const res = await fetch(url);
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
                    await fetch('/api/feed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newItem)
                    });
                } catch (err) {
                    console.error('Erro ao salvar post no feed:', err);
                }
            },

            removeFeedPost: async (id) => {
                set((state) => ({
                    feedPosts: state.feedPosts.filter((p) => p.id !== id),
                }));

                try {
                    await fetch(`/api/feed?id=${id}`, { method: 'DELETE' });
                } catch (err) {
                    console.error('Erro ao deletar post do feed:', err);
                }
            },

            addComment: async (item) => {
                const tempId = `comm_${Date.now()}`;
                const newItem = { ...item, id: tempId, createdAt: new Date().toISOString() };
                set((state) => ({ comments: [newItem, ...state.comments] }));

                try {
                    await fetch('/api/community', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newItem)
                    });
                } catch (err) {
                    console.error('Erro ao salvar comentário:', err);
                }
            },
        }),
        {
            name: 'area-membros-storage',
        }
    )
);
