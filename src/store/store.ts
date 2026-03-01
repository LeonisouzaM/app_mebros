import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'student' | 'admin';

export interface User {
    id: string;
    email: string;
    role: Role;
    name: string;
    photo?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    coverUrl?: string;
    language?: string;
    supportNumber?: string;
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
    login: (email: string) => boolean;
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
            addProduct: (item) =>
                set((state) => ({
                    products: [
                        ...state.products,
                        { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() },
                    ],
                })),
            updateProduct: (id, updatedItem) =>
                set((state) => ({
                    products: state.products.map((p) => (p.id === id ? { ...p, ...updatedItem } : p)),
                })),
            removeProduct: (id) =>
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                    // If the removed product was the current one, reset it
                    currentProductId: state.currentProductId === id ? null : state.currentProductId,
                })),
            setCurrentProductId: (id) => set({ currentProductId: id }),
            updateSystemBanners: (banners) => set({ systemBanners: banners }),
            addClass: (item) =>
                set((state) => ({
                    classes: [
                        { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() },
                        ...state.classes,
                    ],
                })),
            updateClass: (id, updatedItem) =>
                set((state) => ({
                    classes: state.classes.map((c) => (c.id === id ? { ...c, ...updatedItem } : c)),
                })),
            removeClass: (id: string) =>
                set((state) => ({
                    classes: state.classes.filter((c) => c.id !== id),
                })),
            addFeedPost: (item) =>
                set((state) => ({
                    feedPosts: [
                        { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() },
                        ...state.feedPosts,
                    ],
                })),
            addComment: (item) =>
                set((state) => ({
                    comments: [
                        { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() },
                        ...state.comments,
                    ],
                })),
        }),
        {
            name: 'area-membros-storage',
        }
    )
);
