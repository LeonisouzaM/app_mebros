import { useToasts } from '../hooks/useToast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />,
    info: <Info className="w-5 h-5 flex-shrink-0 text-primary" />,
};

const styles = {
    success: 'border-emerald-100',
    error: 'border-red-100',
    warning: 'border-amber-100',
    info: 'border-primary/20',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToasts();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
                        flex items-center gap-3 px-5 py-4 rounded-[20px] shadow-2xl
                        min-w-[300px] max-w-[400px] pointer-events-auto
                        animate-fade-up bg-white/90 backdrop-blur-xl border
                        text-slate-800 font-bold text-xs uppercase tracking-widest
                        ${styles[toast.type]}
                    `}
                >
                    <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-50">
                        {icons[toast.type]}
                    </div>
                    <span className="flex-1 leading-relaxed">{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-all ml-1 text-slate-300 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full overflow-hidden rounded-full">
                         <div className="h-full bg-primary/40 animate-[toast-progress_3s_linear_forwards]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
