import { useToasts } from '../hooks/useToast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
};

const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-600 text-white',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToasts();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl
                        min-w-[280px] max-w-[380px] pointer-events-auto
                        animate-slide-in ${styles[toast.type]}
                    `}
                >
                    {icons[toast.type]}
                    <span className="text-sm font-medium flex-1">{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="opacity-80 hover:opacity-100 transition-opacity ml-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
