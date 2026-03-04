/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/organizer/OrganizerClientLayout.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/components/providers/I18nProvider';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { Tag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
    Calendar,
    Users,
    DollarSign,
    BarChart3,
    Settings,
    Plus,
    Menu,
    X,
    Home,
    MapPin,
    Ticket,
    LogOut,
    Languages
} from 'lucide-react';

interface UserPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newBookingNotifications: boolean;
    cancellationNotifications: boolean;
    lowInventoryNotifications: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    defaultTimeZone?: string;
    defaultEventDuration: number;
    defaultTicketSaleStart: number;
    defaultRefundPolicy?: string;
    requireApproval: boolean;
    autoPublish: boolean;
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    accentColor: string;
    fontSize: string;
    compactMode: boolean;
}

const safeMapTheme = (theme: string | undefined): 'light' | 'dark' | 'auto' => {
    if (!theme) return 'auto';
    return ['light', 'dark', 'auto'].includes(theme) ? theme as 'light' | 'dark' | 'auto' : 'auto';
};

const safeMapFontSize = (fontSize: string | undefined): 'small' | 'medium' | 'large' => {
    if (!fontSize) return 'medium';
    return ['small', 'medium', 'large'].includes(fontSize) ? fontSize as 'small' | 'medium' | 'large' : 'medium';
};

interface OrganizerClientLayoutProps {
    children: React.ReactNode;
}

const OrganizerClientLayout: React.FC<OrganizerClientLayoutProps> = ({ children }) => {
    const { user, logout, isOrganizer, isLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);

    const preferencesLoadedRef = useRef(false);
    const initialLoadRef = useRef(false);
    const { settings, isDark, isCompact, updateTheme, initializeTheme } = useTheme();
    const themeClasses = useThemeClasses();

    const fontSize = settings.fontSize;

    const { t, changeLanguage, currentLanguage, supportedLanguages } = useI18n();

    const getFontSizeClasses = () => {
        switch (fontSize) {
            case 'small':
                return {
                    // Sidebar specific sizes
                    brandText: 'text-sm',
                    brandSubtext: 'text-xs',
                    navItem: 'text-xs',
                    navIcon: 'h-4 w-4',
                    brandIcon: 'h-6 w-6',
                    userText: 'text-xs',
                    userEmail: 'text-xs',
                    userIcon: 'h-6 w-6',
                    buttonIcon: 'h-3 w-3',
                    // Layout sizes
                    headerHeight: 'h-12',
                    sidebarPadding: 'px-2 py-1',
                    navSpacing: 'space-y-1',
                    sectionPadding: 'p-3'
                };
            case 'large':
                return {
                    // Sidebar specific sizes
                    brandText: 'text-xl',
                    brandSubtext: 'text-sm',
                    navItem: 'text-base',
                    navIcon: 'h-6 w-6',
                    brandIcon: 'h-10 w-10',
                    userText: 'text-base',
                    userEmail: 'text-sm',
                    userIcon: 'h-12 w-12',
                    buttonIcon: 'h-5 w-5',
                    // Layout sizes
                    headerHeight: 'h-20',
                    sidebarPadding: 'px-4 py-3',
                    navSpacing: 'space-y-3',
                    sectionPadding: 'p-6'
                };
            default: // medium
                return {
                    // Sidebar specific sizes
                    brandText: 'text-lg',
                    brandSubtext: 'text-xs',
                    navItem: 'text-sm',
                    navIcon: 'h-5 w-5',
                    brandIcon: 'h-8 w-8',
                    userText: 'text-sm',
                    userEmail: 'text-xs',
                    userIcon: 'h-10 w-10',
                    buttonIcon: 'h-4 w-4',
                    // Layout sizes
                    headerHeight: 'h-16',
                    sidebarPadding: 'px-3 py-2',
                    navSpacing: 'space-y-2',
                    sectionPadding: 'p-4'
                };
        }
    };

    const fontSizeClasses = getFontSizeClasses();

    const loadUserPreferences = useCallback(async () => {
        if (preferencesLoadedRef.current || !user || !isOrganizer) {
            return;
        }

        try {
            preferencesLoadedRef.current = true;

            const preferences = await userApi.getPreferences();

            updateTheme({
                theme: safeMapTheme(preferences.theme),
                fontSize: safeMapFontSize(preferences.fontSize),
                accentColor: preferences.accentColor || 'blue',
                compactMode: Boolean(preferences.compactMode)
            });

            if (preferences.language && preferences.language !== currentLanguage) {
                changeLanguage(preferences.language);
            }

            setPreferencesLoaded(true);
        } catch (error) {
            initializeTheme();
            setPreferencesLoaded(true);
        }
    }, [user, isOrganizer, updateTheme, changeLanguage, currentLanguage, initializeTheme]);

    // Only run once when user and organizer status are available
    useEffect(() => {
        if (!initialLoadRef.current && user && isOrganizer) {
            initialLoadRef.current = true;
            loadUserPreferences();
        } else if (!user || !isOrganizer) {
            initializeTheme();
            setPreferencesLoaded(true);
        }
    }, [user, isOrganizer, loadUserPreferences, initializeTheme]);

    // Handle authentication and authorization
    useEffect(() => {
        if (!isLoading && preferencesLoaded) {
            if (!user) {
                router.push('/login');
                return;
            }

            if (!isOrganizer) {
                router.push('/');
                return;
            }
        }
    }, [user, isOrganizer, isLoading, preferencesLoaded, router]);

    const navigation = [
        {
            name: t('dashboard'),
            href: '/organizer/dashboard',
            icon: Home,
        },
        {
            name: t('events'),
            href: '/organizer/events',
            icon: Calendar,
        },
        {
            name: t('createEvent'),
            href: '/organizer/events/create',
            icon: Plus,
        },
        {
            name: 'Venues',
            href: '/organizer/venues',
            icon: MapPin,
        },
        {
            name: 'Ticket Management',
            href: '/organizer/tickets',
            icon: Ticket,
        },
        {
            name: 'Promo Codes', // NEW ADDITION
            href: '/organizer/promo-codes',
            icon: Tag,
        },
        {
            name: 'Analytics',
            href: '/organizer/analytics',
            icon: BarChart3,
        },
        {
            name: t('settings'),
            href: '/organizer/settings',
            icon: Settings,
        }
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Language change handler with complete preferences
    const handleLanguageChange = async (langCode: string) => {
        const previousLanguage = currentLanguage;

        try {
            changeLanguage(langCode);
            setLanguageDropdownOpen(false);


            const currentPreferences = await userApi.getPreferences();

            const updatePayload = {
                emailNotifications: currentPreferences.emailNotifications ?? true,
                smsNotifications: currentPreferences.smsNotifications ?? false,
                newBookingNotifications: currentPreferences.newBookingNotifications ?? true,
                cancellationNotifications: currentPreferences.cancellationNotifications ?? true,
                lowInventoryNotifications: currentPreferences.lowInventoryNotifications ?? true,
                dailyReports: currentPreferences.dailyReports ?? false,
                weeklyReports: currentPreferences.weeklyReports ?? true,
                monthlyReports: currentPreferences.monthlyReports ?? true,
                twoFactorEnabled: currentPreferences.twoFactorEnabled ?? false,
                sessionTimeout: currentPreferences.sessionTimeout ?? 30,
                loginNotifications: currentPreferences.loginNotifications ?? true,
                defaultTimeZone: currentPreferences.defaultTimeZone ?? 'America/New_York',
                defaultEventDuration: currentPreferences.defaultEventDuration ?? 120,
                defaultTicketSaleStart: currentPreferences.defaultTicketSaleStart ?? 30,
                defaultRefundPolicy: currentPreferences.defaultRefundPolicy ?? 'flexible',
                requireApproval: currentPreferences.requireApproval ?? false,
                autoPublish: currentPreferences.autoPublish ?? false,
                theme: currentPreferences.theme ?? 'light',
                dateFormat: currentPreferences.dateFormat ?? 'MM/dd/yyyy',
                timeFormat: currentPreferences.timeFormat ?? '12h',
                currency: currentPreferences.currency ?? 'USD',
                accentColor: currentPreferences.accentColor ?? 'blue',
                fontSize: currentPreferences.fontSize ?? 'medium',
                compactMode: currentPreferences.compactMode ?? false,
                language: langCode
            };

            await userApi.updatePreferences(updatePayload);

        } catch (error: any) {
            changeLanguage(previousLanguage);
            setLanguageDropdownOpen(false);
            const errorMessage = error.response?.data?.message || error.message || 'Network error';
        }
    };

    // Show loading state while preferences are loading
    if (isLoading || !preferencesLoaded) {
        return (
            <div className={`min-h-screen ${themeClasses.themeBg} flex items-center justify-center theme-transition`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-border mx-auto"></div>
                    <p className={`mt-4 ${themeClasses.themeMutedFg}`}>{t('loading')}</p>
                </div>
            </div>
        );
    }

    // Don't render anything if user is not authenticated or not an organizer
    if (!user || !isOrganizer) {
        return null;
    }

    return (
        <div className={`h-screen flex overflow-hidden ${themeClasses.themeBg} theme-transition`}>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={() => setSidebarOpen(false)}
                    />
                </div>
            )}

            {/* UPDATED: Sidebar with font size integration */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 ${themeClasses.themeCard} shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col theme-transition`}>

                {/* UPDATED: Sidebar header with dynamic font sizes */}
                <div className={`flex items-center justify-between ${fontSizeClasses.headerHeight} px-6 border-b ${themeClasses.themeBorder} flex-shrink-0`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Calendar className={`${fontSizeClasses.brandIcon} accent-text`} />
                        </div>
                        <div className="ml-3">
                            <h1 className={`${fontSizeClasses.brandText} font-semibold ${themeClasses.themeFg}`}>NexusEvents</h1>
                            <p className={`${fontSizeClasses.brandSubtext} ${themeClasses.themeMutedFg}`}>Organizer</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className={`lg:hidden p-2 rounded-md ${themeClasses.themeMutedFg} ${themeClasses.hover} transition-colors`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* UPDATED: Navigation with dynamic font sizes */}
                <nav className={`flex-1 px-4 ${fontSizeClasses.sectionPadding.replace('p-', 'py-')} ${fontSizeClasses.navSpacing} overflow-y-auto`}>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;

                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center ${fontSizeClasses.sidebarPadding} ${fontSizeClasses.navItem} font-medium rounded-lg transition-colors ${isActive
                                    ? 'accent-bg text-white'
                                    : `${themeClasses.themeMutedFg} ${themeClasses.hover} hover:${themeClasses.themeFg}`
                                    }`}
                            >
                                <Icon className={`${fontSizeClasses.navIcon} ${isActive ? 'text-white' : themeClasses.themeMutedFg} ${fontSize === 'small' ? 'mr-2' : fontSize === 'large' ? 'mr-4' : 'mr-3'}`} />
                                <span>{item.name}</span>
                            </a>
                        );
                    })}
                </nav>

                {/* UPDATED: Language Selector with dynamic font sizes */}
                <div className={`border-t ${themeClasses.themeBorder} ${fontSizeClasses.sectionPadding} flex-shrink-0`}>
                    <div className="relative">
                        <button
                            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                            className={`flex items-center w-full ${fontSizeClasses.sidebarPadding} ${fontSizeClasses.navItem} ${themeClasses.themeMutedFg} ${themeClasses.hover} hover:${themeClasses.themeFg} rounded-lg transition-colors`}
                        >
                            <Languages className={`${fontSizeClasses.buttonIcon} ${fontSize === 'small' ? 'mr-1' : fontSize === 'large' ? 'mr-3' : 'mr-2'}`} />
                            <span>{t('language')}</span>
                        </button>

                        {languageDropdownOpen && (
                            <div className={`absolute bottom-full left-0 mb-2 w-full ${themeClasses.themeCard} rounded-lg shadow-lg border ${themeClasses.themeBorder} py-1 z-50`}>
                                {supportedLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`flex items-center w-full ${fontSizeClasses.sidebarPadding} ${fontSizeClasses.navItem} transition-colors ${currentLanguage === lang.code
                                            ? 'accent-bg text-white font-medium'
                                            : `${themeClasses.themeFg} ${themeClasses.hover} hover:bg-gray-100 dark:hover:bg-gray-700`
                                            }`}
                                    >
                                        <span className={`${fontSize === 'small' ? 'mr-1' : fontSize === 'large' ? 'mr-3' : 'mr-2'}`}>{lang.flag}</span>
                                        <span className={currentLanguage === lang.code ? 'text-white' : themeClasses.themeFg}>{lang.nativeName}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* UPDATED: User profile section with dynamic font sizes */}
                <div className={`border-t ${themeClasses.themeBorder} ${fontSizeClasses.sectionPadding} flex-shrink-0`}>
                    <div className={`flex items-center ${fontSize === 'small' ? 'space-x-2 mb-1' : fontSize === 'large' ? 'space-x-4 mb-4' : 'space-x-3 mb-3'}`}>
                        <div className="flex-shrink-0">
                            <div className={`${fontSizeClasses.userIcon} rounded-full accent-bg flex items-center justify-center`} style={{ opacity: 0.1 }}>
                                <Users className={`${fontSizeClasses.buttonIcon} accent-text`} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`${fontSizeClasses.userText} font-medium ${themeClasses.themeFg} truncate`}>
                                {user.firstName} {user.lastName}
                            </p>
                            <p className={`${fontSizeClasses.userEmail} ${themeClasses.themeMutedFg} truncate ${fontSize === 'small' ? 'hidden' : ''}`}>{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full ${fontSizeClasses.sidebarPadding} ${fontSizeClasses.navItem} ${themeClasses.themeMutedFg} ${themeClasses.hover} hover:${themeClasses.themeFg} rounded-lg transition-colors`}
                    >
                        <LogOut className={`${fontSizeClasses.buttonIcon} ${fontSize === 'small' ? 'mr-1' : fontSize === 'large' ? 'mr-3' : 'mr-2'}`} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>

            {/* Main content area with theme support */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* UPDATED: Top bar with dynamic font sizes */}
                <div className={`${themeClasses.themeCard} shadow-sm border-b ${themeClasses.themeBorder} flex-shrink-0 theme-transition`}>
                    <div className={`flex items-center justify-between ${fontSizeClasses.headerHeight} px-4 sm:px-6 lg:px-8`}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`lg:hidden p-2 rounded-md ${themeClasses.themeMutedFg} ${themeClasses.hover} hover:${themeClasses.themeFg} transition-colors`}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block">
                                <p className={`${fontSizeClasses.navItem} ${themeClasses.themeMutedFg}`}>
                                    {t('welcomeBack', { name: user.firstName })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content with theme support */}
                <main className={`flex-1 overflow-y-auto ${themeClasses.themeBg} theme-transition`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default OrganizerClientLayout;