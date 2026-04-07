import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

const typeStyles = {
    success: { icon: CheckCircle2, bg: 'bg-semantic-green/10 dark:bg-semantic-green/20', text: 'text-semantic-green', border: 'border-semantic-green/20' },
    error: { icon: AlertTriangle, bg: 'bg-semantic-red/10 dark:bg-semantic-red/20', text: 'text-semantic-red', border: 'border-semantic-red/20' },
    info: { icon: Info, bg: 'bg-primary-50 dark:bg-primary-500/20', text: 'text-primary-600 dark:text-primary-400', border: 'border-primary-200 dark:border-primary-500/20' },
};

const Toast = ({ toast, onRemove }) => {
    const config = typeStyles[toast.type] || typeStyles.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-lg dark:shadow-black/30 bg-white dark:bg-dark-card ${config.border} min-w-[320px] max-w-md backdrop-blur-xl`}
        >
            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.text}`} />
            </div>
            <p className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </AnimatePresence>
    </div>
);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, success, error, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
