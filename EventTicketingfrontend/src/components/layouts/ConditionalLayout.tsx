/* eslint-disable @typescript-eslint/no-unused-vars */
// components/layouts/ConditionalLayout.tsx
'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, LogOut, User, Settings, Menu, X, Globe } from 'lucide-react';
import Link from 'next/link';
import OrganizerClientLayout from '@/app/organizer/OrganizerClientLayout';
import Navbar from '@/components/common/Navbar';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isOrganizerRoute = pathname?.startsWith('/organizer');

    const isDashboardPage = pathname === '/organizer' || pathname === '/organizer/dashboard';

    const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

    const handleSignOut = async () => {
        try {
            await logout();
            setShowUserMenu(false);
            router.push('/login');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    if (isOrganizerRoute) {
        if (isDashboardPage) {
            return (
                <div className="min-h-screen">
                    <OrganizerClientLayout>
                        {children}
                    </OrganizerClientLayout>
                </div>
            );
        }

        return (
            <div className="min-h-screen">

                {/* Click outside to close menu */}
                {showUserMenu && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                    />
                )}

                {/* Organizer Layout Content */}
                <OrganizerClientLayout>
                    {children}
                </OrganizerClientLayout>
            </div>
        );
    }

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (<><Navbar />{children}</>);
};
export default ConditionalLayout;
