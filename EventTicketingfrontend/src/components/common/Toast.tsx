'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextValue {
    showToast: (type: ToastType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />,
    error: <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />,
    info: <Info className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />,
};

const styleMap: Record<ToastType, string> = {
    success: 'border-emerald-500/50 bg-emerald-900/30',
    error: 'border-rose-500/50 bg-rose-900/30',
    warning: 'border-amber-500/50 bg-amber-900/30',
    info: 'border-cyan-500/50 bg-cyan-900/30',
};

const barMap: Record<ToastType, string> = {
    success: 'bg-emerald-400',
    error: 'bg-rose-400',
    warning: 'bg-amber-400',
    info: 'bg-cyan-400',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Enter animation
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const handleDismiss = () => {
        setLeaving(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={`
                relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl
                min-w-[280px] max-w-sm
                ${styleMap[toast.type]}
                transition-all duration-300
                ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
        >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{toast.title}</p>
                {toast.message && (
                    <p className="text-white/70 text-xs mt-0.5 leading-snug">{toast.message}</p>
                )}
            </div>
            <button
                onClick={handleDismiss}
                className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
            >
                <X className="h-4 w-4" />
            </button>
            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 ${barMap[toast.type]} animate-shrink`} />
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = ++toastCounter;
        setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
    }, []);

    const ctx: ToastContextValue = {
        showToast,
        success: (title, message) => showToast('success', title, message),
        error: (title, message) => showToast('error', title, message),
        warning: (title, message) => showToast('warning', title, message),
        info: (title, message) => showToast('info', title, message),
    };

    return (
        <ToastContext.Provider value={ctx}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
