import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
    const toast: Toast = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
    };
    toastListeners.forEach(listener => listener(toast));
}

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Toast) => {
        setToasts(prev => [...prev, toast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 4000);
    }, []);

    useEffect(() => {
        toastListeners.push(addToast);
        return () => {
            toastListeners = toastListeners.filter(l => l !== addToast);
        };
    }, [addToast]);

    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    return { toasts, removeToast };
}
