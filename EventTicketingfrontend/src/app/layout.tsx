// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { I18nProvider } from '@/components/providers/I18nProvider';
import ConditionalLayout from '@/components/layouts/ConditionalLayout';
import { ToastProvider } from '@/components/common/Toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body suppressHydrationWarning className={`${inter.className} min-h-screen text-slate-100 bg-[#0f172a] selection:bg-purple-500/30`}>
                <AuthProvider>
                    <I18nProvider>
                        <ToastProvider>
                            <ConditionalLayout>
                                {children}
                            </ConditionalLayout>
                        </ToastProvider>
                    </I18nProvider>
                </AuthProvider>
            </body>
        </html>
    );
}