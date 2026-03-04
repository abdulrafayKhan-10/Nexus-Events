/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';
import { TranslationKeys, useI18nContext } from '@/components/providers/I18nProvider';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    CreditCard,
    Bell,
    Shield,
    Palette,
    Calendar,
    DollarSign,
    Globe,
    Settings,
    Save,
    Eye,
    EyeOff,
    Clock,
    Languages,
    Smartphone,
    Key,
    Download,
    Upload,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Lock,
    Unlock,
    Zap,
    FileText,
    Monitor,
    Sun,
    Moon,
    Check,
    X
} from 'lucide-react';

// Updated UserPreferences interface to match your existing code
interface UserPreferences {
    // Notification preferences
    emailNotifications: boolean;
    smsNotifications: boolean;
    newBookingNotifications: boolean;
    cancellationNotifications: boolean;
    lowInventoryNotifications: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;

    // Security preferences
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;

    // Event defaults
    defaultTimeZone?: string;
    defaultEventDuration: number;
    defaultTicketSaleStart: number;
    defaultRefundPolicy?: string;
    requireApproval: boolean;
    autoPublish: boolean;

    // Appearance preferences
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timeFormat: '12h' | '24h';
    dateFormat: string;
    currency: string;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
}

interface UserProfileData {
    companyName?: string;
    businessLicense?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    bio?: string;
    website?: string;
    timeZone?: string;
    isOrganizer?: boolean;
}

interface UserData {
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    profileImageUrl?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    status?: string;
    bio?: string;
    website?: string;
    timeZone?: string;
    isOrganizer?: boolean;
    roles?: string[];
}

const themes = [
    {
        id: 'light',
        name: 'Light',
        icon: Sun,
        description: 'Clean and bright interface',
        preview: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' }
    },
    {
        id: 'dark',
        name: 'Dark',
        icon: Moon,
        description: 'Easy on the eyes',
        preview: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' }
    },
    {
        id: 'auto',
        name: 'Auto',
        icon: Monitor,
        description: 'Follows system preference',
        preview: { bg: 'bg-gradient-to-r from-white to-gray-900', text: 'text-gray-600', border: 'border-gray-400' }
    }
];

const accentColors = [
    { id: 'blue', name: 'Blue', class: 'bg-blue-500', rgb: 'rgb(59, 130, 246)' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-500', rgb: 'rgb(168, 85, 247)' },
    { id: 'green', name: 'Green', class: 'bg-green-500', rgb: 'rgb(34, 197, 94)' },
    { id: 'red', name: 'Red', class: 'bg-red-500', rgb: 'rgb(239, 68, 68)' },
    { id: 'orange', name: 'Orange', class: 'bg-orange-500', rgb: 'rgb(249, 115, 22)' },
    { id: 'pink', name: 'Pink', class: 'bg-pink-500', rgb: 'rgb(236, 72, 153)' }
];

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

const dateFormats = [
    { id: 'MM/dd/yyyy', name: 'MM/DD/YYYY', example: '12/31/2024' },
    { id: 'dd/MM/yyyy', name: 'DD/MM/YYYY', example: '31/12/2024' },
    { id: 'yyyy-MM-dd', name: 'YYYY-MM-DD', example: '2024-12-31' }
];

const getThemeClasses = () => {
    // Force new premium dark theme for organizer settings too
    const isDarkMode = true;
    const compactMode = false;
    const fontSize = 'medium';

    const currentFont = {
        text: 'text-base',
        heading: 'text-xl',
        title: 'text-2xl',
        subtitle: 'text-sm',
        button: 'text-base',
        label: 'text-sm'
    };

    return {
        // Deep Space Premium Colors
        background: 'bg-[#0a0f1c]',
        backgroundCard: 'bg-[#0f172a]/60',
        backgroundSidebar: 'bg-gray-800/40',
        backgroundInput: 'bg-gray-900/60',
        backgroundDisabled: 'bg-[#0a0f1c]/50',
        backgroundSuccess: 'bg-green-500/10',
        backgroundError: 'bg-red-500/10',
        backgroundSecure: 'bg-green-500/10',
        backgroundOverlay: 'bg-[#0a0f1c]/40',

        // Text Colors
        text: 'text-gray-100',
        textSecondary: 'text-gray-400',
        textDisabled: 'text-gray-600',
        textSuccess: 'text-green-400',
        textError: 'text-red-400',
        textSecure: 'text-green-400',
        textLight: 'text-white',

        // Form elements
        themeFg: 'text-gray-100',
        themeMutedFg: 'text-gray-400',
        compactInput: 'h-11 px-4 py-2 bg-gray-900/60 text-white',
        compactCard: 'p-6',
        compactGap: 'gap-4',
        textSm: 'text-sm',
        textLg: 'text-lg',

        // Borders
        themeBorder: 'border-white/10',
        borderCard: 'border-white/10',

        // Typography & Layout
        fontSize: currentFont,
        isDarkMode: true
    };
};


const OrganizerSettings: React.FC = () => {
    // State declarations
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
    const [error, setError] = useState<string | null>(null);

    // Use your existing hooks
    const { t, changeLanguage, currentLanguage } = useI18nContext();
    const { updateTheme, isDark, isCompact } = useTheme();
    const themeClasses = useThemeClasses();

    // User basic data (from User entity)
    const [userData, setUserData] = useState<UserData>({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        profileImageUrl: ''
    });

    // User profile data (from UserProfile entity)
    const [userProfile, setUserProfile] = useState<UserProfileData>({
        bio: '',
        website: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        timeZone: 'America/New_York',
        isOrganizer: false,
        businessLicense: ''
    });

    // User preferences with dateFormat included
    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        // Notification preferences
        emailNotifications: true,
        smsNotifications: false,
        newBookingNotifications: true,
        cancellationNotifications: true,
        lowInventoryNotifications: true,
        dailyReports: false,
        weeklyReports: true,
        monthlyReports: true,

        // Security preferences
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginNotifications: true,

        // Event defaults
        defaultTimeZone: 'America/New_York',
        defaultEventDuration: 120,
        defaultTicketSaleStart: 30,
        defaultRefundPolicy: 'flexible',
        requireApproval: false,
        autoPublish: false,

        // Appearance preferences including dateFormat
        dateFormat: 'MM/dd/yyyy',
        theme: 'light',
        language: 'en',
        timeFormat: '12h',
        currency: 'USD',
        accentColor: 'blue',
        fontSize: 'medium',
        compactMode: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Tab configuration
    const tabs = [
        { id: 'profile', name: t('personalInformation'), icon: User },
        { id: 'organization', name: t('organization'), icon: Building2 },
        { id: 'notifications', name: t('notifications'), icon: Bell },
        { id: 'security', name: t('security'), icon: Shield },
        { id: 'language', name: t('languageRegion'), icon: Languages },
        { id: 'events', name: t('eventDefaults'), icon: Calendar },
        { id: 'appearance', name: t('appearance'), icon: Palette }
    ];

    // Enhanced theme-aware input styles
    const getInputStyles = (hasError = false) => {
        const baseStyles = `w-full border rounded-lg focus:ring-2 accent-focus placeholder-opacity-60 theme-transition`;
        const themeStyles = `${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} ${themeClasses.compactInput}`;
        const errorStyles = hasError ? 'border-red-500' : '';
        return `${baseStyles} ${themeStyles} ${errorStyles}`;
    };

    // Toggle component
    const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }> = ({ enabled, onChange, disabled = false }) => (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'accent-bg' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    // Loading skeleton component
    const LoadingSkeleton: React.FC = () => (
        <div className="space-y-6">
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Auth check function
    const checkAuth = (): boolean => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setAuthStatus('unauthenticated');
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < currentTime) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setAuthStatus('unauthenticated');
                return false;
            }

            setAuthStatus('authenticated');
            console.log('✅ Authentication successful');
            return true;
        } catch (error) {
            console.error('Invalid token format:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setAuthStatus('unauthenticated');
            return false;
        }
    };

    const fetchUserData = async (): Promise<void> => {
        if (!checkAuth()) return;

        setProfileLoading(true);
        setError(null);

        try {
            const [userResponse, organizationData, preferencesData] = await Promise.allSettled([
                userApi.getProfile(),
                userApi.getOrganization(),
                userApi.getPreferences()
            ]);

            if (userResponse.status === 'fulfilled') {
                setUserData({
                    userId: userResponse.value.userId,
                    firstName: userResponse.value.firstName || '',
                    lastName: userResponse.value.lastName || '',
                    email: userResponse.value.email || '',
                    phoneNumber: userResponse.value.phoneNumber || '',
                    dateOfBirth: userResponse.value.dateOfBirth || '',
                    profileImageUrl: userResponse.value.profileImageUrl || '',
                    isEmailVerified: userResponse.value.isEmailVerified || false,
                    isPhoneVerified: userResponse.value.isPhoneVerified || false,
                    createdAt: userResponse.value.createdAt || '',
                    lastLoginAt: userResponse.value.lastLoginAt || '',
                    status: userResponse.value.status || '',
                    bio: userResponse.value.bio || '',
                    website: userResponse.value.website || '',
                    timeZone: userResponse.value.timeZone || '',
                    isOrganizer: userResponse.value.isOrganizer || false,
                    roles: userResponse.value.roles || []
                });
            }

            if (organizationData.status === 'fulfilled') {
                setUserProfile({
                    companyName: organizationData.value.companyName || '',
                    businessLicense: organizationData.value.businessLicense || '',
                    address: organizationData.value.address || '',
                    city: organizationData.value.city || '',
                    state: organizationData.value.state || '',
                    zipCode: organizationData.value.zipCode || '',
                    country: organizationData.value.country || 'United States',
                    bio: userResponse.status === 'fulfilled' ? userResponse.value.bio || '' : '',
                    website: userResponse.status === 'fulfilled' ? userResponse.value.website || '' : '',
                    timeZone: userResponse.status === 'fulfilled' ? userResponse.value.timeZone || 'America/New_York' : 'America/New_York',
                    isOrganizer: userResponse.status === 'fulfilled' ? userResponse.value.isOrganizer || false : false
                });
            }

            if (preferencesData.status === 'fulfilled') {
                setUserPreferences({
                    emailNotifications: preferencesData.value.emailNotifications ?? true,
                    smsNotifications: preferencesData.value.smsNotifications ?? false,
                    newBookingNotifications: preferencesData.value.newBookingNotifications ?? true,
                    cancellationNotifications: preferencesData.value.cancellationNotifications ?? true,
                    lowInventoryNotifications: preferencesData.value.lowInventoryNotifications ?? true,
                    dailyReports: preferencesData.value.dailyReports ?? false,
                    weeklyReports: preferencesData.value.weeklyReports ?? true,
                    monthlyReports: preferencesData.value.monthlyReports ?? true,
                    twoFactorEnabled: preferencesData.value.twoFactorEnabled ?? false,
                    sessionTimeout: preferencesData.value.sessionTimeout ?? 30,
                    loginNotifications: preferencesData.value.loginNotifications ?? true,
                    defaultTimeZone: preferencesData.value.defaultTimeZone ?? 'America/New_York',
                    defaultEventDuration: preferencesData.value.defaultEventDuration ?? 120,
                    defaultTicketSaleStart: preferencesData.value.defaultTicketSaleStart ?? 30,
                    defaultRefundPolicy: preferencesData.value.defaultRefundPolicy ?? 'flexible',
                    requireApproval: preferencesData.value.requireApproval ?? false,
                    autoPublish: preferencesData.value.autoPublish ?? false,
                    dateFormat: preferencesData.value.dateFormat ?? 'MM/dd/yyyy',
                    theme: (['light', 'dark', 'auto'].includes(preferencesData.value.theme) ? preferencesData.value.theme : 'light') as 'light' | 'dark' | 'auto',
                    language: preferencesData.value.language ?? 'en',
                    timeFormat: (['12h', '24h'].includes(preferencesData.value.timeFormat) ? preferencesData.value.timeFormat : '12h') as '12h' | '24h',
                    currency: preferencesData.value.currency ?? 'USD',
                    accentColor: preferencesData.value.accentColor ?? 'blue',
                    fontSize: (['small', 'medium', 'large'].includes(preferencesData.value.fontSize) ? preferencesData.value.fontSize : 'medium') as 'small' | 'medium' | 'large',
                    compactMode: preferencesData.value.compactMode ?? false
                });
            }

        } catch (error: any) {
            setError(error.message || t('loadError'));
        } finally {
            setProfileLoading(false);
        }
    };

    // Update functions
    const updateUserProfile = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await userApi.updateProfile({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            setError(error.message || t('failedToUpdateProfile'));
        } finally {
            setLoading(false);
        }
    };

    const updateUserProfileInfo = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await userApi.updateOrganization({
                companyName: userProfile.companyName,
                businessLicense: userProfile.businessLicense,
                address: userProfile.address,
                city: userProfile.city,
                state: userProfile.state,
                zipCode: userProfile.zipCode,
                country: userProfile.country
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            setError(error.message || t('failedToUpdateOrganization'));
        } finally {
            setLoading(false);
        }
    };

    const updateUserPreferences = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await userApi.updatePreferences({
                emailNotifications: userPreferences.emailNotifications,
                smsNotifications: userPreferences.smsNotifications,
                newBookingNotifications: userPreferences.newBookingNotifications,
                cancellationNotifications: userPreferences.cancellationNotifications,
                lowInventoryNotifications: userPreferences.lowInventoryNotifications,
                dailyReports: userPreferences.dailyReports,
                weeklyReports: userPreferences.weeklyReports,
                monthlyReports: userPreferences.monthlyReports,
                twoFactorEnabled: userPreferences.twoFactorEnabled,
                sessionTimeout: userPreferences.sessionTimeout,
                loginNotifications: userPreferences.loginNotifications,
                defaultTimeZone: userPreferences.defaultTimeZone,
                defaultEventDuration: userPreferences.defaultEventDuration,
                defaultTicketSaleStart: userPreferences.defaultTicketSaleStart,
                defaultRefundPolicy: userPreferences.defaultRefundPolicy,
                requireApproval: userPreferences.requireApproval,
                autoPublish: userPreferences.autoPublish,
                theme: userPreferences.theme,
                language: userPreferences.language,
                timeFormat: userPreferences.timeFormat,
                currency: userPreferences.currency,
                accentColor: userPreferences.accentColor,
                fontSize: userPreferences.fontSize,
                compactMode: userPreferences.compactMode,
                dateFormat: userPreferences.dateFormat
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            setError(error.message || t('failedToUpdatePreferences'));
        } finally {
            setLoading(false);
        }
    };

    // Password change function
    const changePassword = async (): Promise<void> => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError(t('passwordTooShort'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await userApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            setError(error.message || t('failedToChangePassword'));
        } finally {
            setLoading(false);
        }
    };

    // Helper function for updating preferences
    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setUserPreferences(prev => ({
            ...prev,
            [key]: value
        }));

        // Update theme immediately for theme-related changes
        if (key === 'theme' || key === 'accentColor' || key === 'fontSize' || key === 'compactMode') {
            updateTheme({ [key]: value });
        }

        // Update language immediately when language changes
        if (key === 'language') {
            changeLanguage(value as string);
        }
    };

    // Save handler
    const handleSave = async (section: string) => {
        setError(null);

        switch (section) {
            case 'profile':
                await updateUserProfile();
                break;
            case 'organization':
                await updateUserProfileInfo();
                break;
            case 'notifications':
            case 'security':
            case 'events':
            case 'language':
            case 'appearance':
                await updateUserPreferences();
                break;
            default:
                await updateUserProfile();
        }
    };

    // Render Personal Information Tab
    const renderProfileTab = () => (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-sm text-red-800 dark:text-red-300">{error}</span>
                    </div>
                </div>
            )}

            {!profileLoading && (
                <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                    <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                        {t('personalInformation')}
                    </h3>
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${themeClasses.compactGap}`}>
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('firstName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={userData.firstName}
                                onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                className={getInputStyles()}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('lastName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={userData.lastName}
                                onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                className={getInputStyles()}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('email')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    className={getInputStyles()}
                                    disabled={loading}
                                />
                                {userData.isEmailVerified && (
                                    <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                                )}
                            </div>
                            {!userData.isEmailVerified && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    {t('emailNotVerified')}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('phoneNumber')}
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={userData.phoneNumber || ''}
                                    onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                                    className={getInputStyles()}
                                    disabled={loading}
                                    placeholder={t('optional')}
                                />
                                {userData.isPhoneVerified && (
                                    <CheckCircle className="absolute right-3 top-2.5 w-5 h-5 text-green-500" />
                                )}
                            </div>
                            {userData.phoneNumber && !userData.isPhoneVerified && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    {t('phoneNotVerified')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Section */}
            {!profileLoading && (
                <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                    <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                        {t('changePassword')}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('currentPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className={`${getInputStyles()} pr-10`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-2.5 ${themeClasses.themeMutedFg}`}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('newPassword')}
                            </label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className={getInputStyles()}
                                disabled={loading}
                                placeholder={t('minimumCharacters')}
                            />
                        </div>
                        <div>
                            <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                                {t('confirmNewPassword')}
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className={getInputStyles()}
                                disabled={loading}
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={changePassword}
                                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('changingPassword') : t('changePassword')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render Organization Tab
    const renderOrganizationTab = () => (
        <div className="space-y-6">
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                    {t('organizationInformation')}
                </h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${themeClasses.compactGap}`}>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('companyName')}
                        </label>
                        <input
                            type="text"
                            value={userProfile.companyName || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, companyName: e.target.value })}
                            className={getInputStyles()}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('businessLicense')}
                        </label>
                        <input
                            type="text"
                            value={userProfile.businessLicense || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, businessLicense: e.target.value })}
                            className={getInputStyles()}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('address')}
                        </label>
                        <input
                            type="text"
                            value={userProfile.address || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                            className={getInputStyles()}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('city')}
                        </label>
                        <input
                            type="text"
                            value={userProfile.city || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                            className={getInputStyles()}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('state')}
                        </label>
                        <input
                            type="text"
                            value={userProfile.state || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, state: e.target.value })}
                            className={getInputStyles()}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('zipCode')}
                        </label>
                        <input
                            type="text"
                            value={userProfile.zipCode || ''}
                            onChange={(e) => setUserProfile({ ...userProfile, zipCode: e.target.value })}
                            className={getInputStyles()}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Notifications Tab
    const renderNotificationsTab = () => (
        <div className="space-y-6">
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                    {t('emailNotifications')}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('newBookings')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('getNotifiedNewBooking')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.newBookingNotifications}
                            onChange={(enabled) => updatePreference('newBookingNotifications', enabled)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('cancellations')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('getNotifiedCancellations')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.cancellationNotifications}
                            onChange={(enabled) => updatePreference('cancellationNotifications', enabled)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('dailyReports')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('receiveDailySummary')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.dailyReports}
                            onChange={(enabled) => updatePreference('dailyReports', enabled)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('weeklyReports')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('receiveWeeklyAnalytics')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.weeklyReports}
                            onChange={(enabled) => updatePreference('weeklyReports', enabled)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Security Tab
    const renderSecurityTab = () => (
        <div className="space-y-6">
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                    {t('securitySettings')}
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('twoFactorAuthentication')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('addExtraLayerSecurity')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.twoFactorEnabled}
                            onChange={(enabled) => updatePreference('twoFactorEnabled', enabled)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('loginNotifications')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('getNotifiedNewLogins')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.loginNotifications}
                            onChange={(enabled) => updatePreference('loginNotifications', enabled)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('sessionTimeoutMinutes')}
                        </label>
                        <input
                            type="number"
                            value={userPreferences.sessionTimeout}
                            onChange={(e) => updatePreference('sessionTimeout', parseInt(e.target.value) || 30)}
                            className={getInputStyles()}
                            disabled={loading}
                            min="5"
                            max="480"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Language Tab
    const renderLanguageTab = () => (
        <div className="space-y-6">
            {/* Primary Language Settings */}
            <div className={`${themeClasses.themeCard} ${themeClasses.compactCard} rounded-lg shadow-sm border ${themeClasses.themeBorder}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Languages className={`w-5 h-5 ${themeClasses.themeMutedFg}`} />
                    <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg}`}>
                        {t('languageRegion')}
                    </h3>
                </div>
                <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg} mb-6`}>
                    {t('languagePreferences')}
                </p>

                <div className="space-y-6">
                    {/* Language Selection */}
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-3`}>
                            {t('interfaceLanguage')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => updatePreference('language', lang.code)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${currentLanguage === lang.code
                                        ? 'accent-border bg-blue-50 dark:bg-blue-900/20'
                                        : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                                {lang.name}
                                            </span>
                                        </div>
                                        {currentLanguage === lang.code && (
                                            <Check className="w-4 h-4 accent-text" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time & Date Formats */}
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-3`}>
                            {t('timeDateFormats')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs font-medium ${themeClasses.themeMutedFg} mb-2`}>
                                    {t('timeFormat')}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['12h', '24h'] as const).map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => updatePreference('timeFormat', format)}
                                            className={`p-2 rounded border transition-all ${userPreferences.timeFormat === format
                                                ? 'accent-border accent-bg text-white'
                                                : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                                }`}
                                        >
                                            <span className="text-xs font-medium">
                                                {format === '12h' ? t('hour12Format') : t('hour24Format')}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium ${themeClasses.themeMutedFg} mb-2`}>
                                    {t('dateFormat')}
                                </label>
                                <select
                                    value={userPreferences.dateFormat}
                                    onChange={(e) => updatePreference('dateFormat', e.target.value)}
                                    className={getInputStyles()}
                                >
                                    {dateFormats.map((format) => (
                                        <option key={format.id} value={format.id}>
                                            {format.name} - {format.example}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Currency Settings */}
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-3`}>
                            {t('currencySettings')}
                        </label>
                        <select
                            value={userPreferences.currency}
                            onChange={(e) => updatePreference('currency', e.target.value)}
                            className={getInputStyles()}
                        >
                            {currencies.map((currency) => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.symbol} - {currency.name} ({currency.code})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Events Tab
    const renderEventsTab = () => (
        <div className="space-y-6">
            <div className={`${themeClasses.themeCard} rounded-lg ${themeClasses.compactCard} shadow-sm border ${themeClasses.themeBorder}`}>
                <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                    {t('eventDefaults')}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('defaultEventDurationMinutes')}
                        </label>
                        <input
                            type="number"
                            value={userPreferences.defaultEventDuration}
                            onChange={(e) => updatePreference('defaultEventDuration', parseInt(e.target.value) || 120)}
                            className={getInputStyles()}
                            disabled={loading}
                            min="15"
                            step="15"
                        />
                    </div>
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-2`}>
                            {t('ticketSaleStartDays')}
                        </label>
                        <input
                            type="number"
                            value={userPreferences.defaultTicketSaleStart}
                            onChange={(e) => updatePreference('defaultTicketSaleStart', parseInt(e.target.value) || 30)}
                            className={getInputStyles()}
                            disabled={loading}
                            min="1"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('requireApproval')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('requireApprovalBeforeLive')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.requireApproval}
                            onChange={(enabled) => updatePreference('requireApproval', enabled)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('autoPublish')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('autoPublishWhenCreated')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.autoPublish}
                            onChange={(enabled) => updatePreference('autoPublish', enabled)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Appearance Tab
    const renderAppearanceTab = () => (
        <div className="space-y-6">
            {/* Theme Selection */}
            <div className={`${themeClasses.themeCard} ${themeClasses.compactCard} rounded-lg shadow-sm border ${themeClasses.themeBorder}`}>
                <div className="flex items-center space-x-2 mb-4">
                    <Palette className={`w-5 h-5 ${themeClasses.themeMutedFg}`} />
                    <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg}`}>
                        {t('theme')}
                    </h3>
                </div>
                <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg} mb-6`}>
                    {t('choosePreferredTheme')}
                </p>

                <div className={`grid grid-cols-1 md:grid-cols-3 ${themeClasses.compactGap}`}>
                    {themes.map((theme) => {
                        const Icon = theme.icon;
                        const isSelected = userPreferences.theme === theme.id;

                        return (
                            <button
                                key={theme.id}
                                onClick={() => updatePreference('theme', theme.id as any)}
                                className={`relative p-4 rounded-lg border-2 transition-all ${isSelected
                                    ? 'accent-border bg-blue-50 dark:bg-blue-900/20'
                                    : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <Check className="w-4 h-4 accent-text" />
                                    </div>
                                )}

                                <div className={`flex items-center space-x-3 ${isCompact ? 'mb-2' : 'mb-3'}`}>
                                    <Icon className={`w-5 h-5 ${themeClasses.themeMutedFg}`} />
                                    <span className={`font-medium ${themeClasses.themeFg}`}>
                                        {getThemeTranslation(theme.id)}
                                    </span>
                                </div>

                                <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg} ${isCompact ? 'mb-2' : 'mb-3'}`}>
                                    {theme.description}
                                </p>

                                <div className={`${theme.preview.bg} ${theme.preview.border} border rounded p-2 space-y-1`}>
                                    <div className={`h-2 accent-bg rounded`}></div>
                                    <div className={`h-1 ${theme.preview.text} bg-current opacity-50 rounded`}></div>
                                    <div className={`h-1 ${theme.preview.text} bg-current opacity-30 rounded w-3/4`}></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Accent Color */}
            <div className={`${themeClasses.themeCard} ${themeClasses.compactCard} rounded-lg shadow-sm border ${themeClasses.themeBorder}`}>
                <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                    {t('accentColor')}
                </h3>
                <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg} mb-6`}>
                    {t('chooseAccentColor')}
                </p>

                <div className={`grid grid-cols-3 md:grid-cols-6 ${themeClasses.compactGap}`}>
                    {accentColors.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => updatePreference('accentColor', color.id)}
                            className={`relative p-3 rounded-lg border-2 transition-all ${userPreferences.accentColor === color.id
                                ? `accent-border ${themeClasses.themeCard}`
                                : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                }`}
                        >
                            <div className={`w-8 h-8 ${color.class} rounded-full mx-auto mb-2`}></div>
                            <span className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {getColorTranslation(color.id)}
                            </span>
                            {userPreferences.accentColor === color.id && (
                                <div className="absolute top-1 right-1">
                                    <Check className={`w-3 h-3 accent-text`} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Display Settings */}
            <div className={`${themeClasses.themeCard} ${themeClasses.compactCard} rounded-lg shadow-sm border ${themeClasses.themeBorder}`}>
                <h3 className={`${themeClasses.textLg} font-semibold ${themeClasses.themeFg} mb-4`}>
                    {t('displaySettings')}
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className={`block ${themeClasses.textSm} font-medium ${themeClasses.themeFg} mb-3`}>
                            {t('fontSize')}
                        </label>
                        <div className={`grid grid-cols-3 ${themeClasses.compactGap}`}>
                            {(['small', 'medium', 'large'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => updatePreference('fontSize', size)}
                                    className={`p-3 rounded-lg border-2 transition-all ${userPreferences.fontSize === size
                                        ? 'accent-border bg-blue-50 dark:bg-blue-900/20'
                                        : `${themeClasses.themeBorder} ${themeClasses.hover}`
                                        }`}
                                >
                                    <div className={`${size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'} ${themeClasses.themeFg} font-medium capitalize`}>
                                        {t(size)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`${themeClasses.textSm} font-medium ${themeClasses.themeFg}`}>
                                {t('compactMode')}
                            </h4>
                            <p className={`${themeClasses.textSm} ${themeClasses.themeMutedFg}`}>
                                {t('reduceSpacing')}
                            </p>
                        </div>
                        <Toggle
                            enabled={userPreferences.compactMode}
                            onChange={(enabled) => updatePreference('compactMode', enabled)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Main render tab content function
    const renderTabContent = () => {
        if (profileLoading) {
            return <LoadingSkeleton />;
        }

        switch (activeTab) {
            case 'profile':
                return renderProfileTab();
            case 'organization':
                return renderOrganizationTab();
            case 'notifications':
                return renderNotificationsTab();
            case 'security':
                return renderSecurityTab();
            case 'language':
                return renderLanguageTab();
            case 'events':
                return renderEventsTab();
            case 'appearance':
                return renderAppearanceTab();
            default:
                return renderProfileTab();
        }
    };

    const getThemeTranslation = (themeId: string): string => {
        const themeKeys: Record<string, keyof TranslationKeys> = {
            light: 'lightMode',
            dark: 'darkMode',
            auto: 'autoMode'
        };
        return t(themeKeys[themeId] || 'lightMode');
    };

    const getColorTranslation = (colorId: string): string => {
        const colorKeys: Record<string, keyof TranslationKeys> = {
            blue: 'blue',
            purple: 'purple',
            green: 'green',
            red: 'red',
            orange: 'orange',
            pink: 'pink'
        };
        return t(colorKeys[colorId] || 'blue');
    };

    const getSizeTranslation = (sizeId: string): string => {
        const sizeKeys: Record<string, keyof TranslationKeys> = {
            small: 'small',
            medium: 'medium',
            large: 'large'
        };
        return t(sizeKeys[sizeId] || 'medium');
    };


    // Effects
    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (authStatus === 'authenticated') {
            fetchUserData();
        }
    }, [authStatus]);

    useEffect(() => {
        if (!profileLoading && authStatus === 'authenticated') {
            updateTheme({
                theme: userPreferences.theme,
                accentColor: userPreferences.accentColor,
                fontSize: userPreferences.fontSize,
                compactMode: userPreferences.compactMode
            });
        }
    }, [profileLoading, authStatus]);

    useEffect(() => {
        if (currentLanguage && userPreferences.language !== currentLanguage) {
            setUserPreferences(prev => ({
                ...prev,
                language: currentLanguage
            }));
        }
    }, [currentLanguage]);

    // Main render
    return (
        <div className={`max-w-7xl mx-auto ${isCompact ? 'p-4' : 'p-6'} ${themeClasses.themeBg} min-h-screen theme-transition`}>
            {/* Authentication checking state */}
            {authStatus === 'checking' && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-border mx-auto mb-4"></div>
                        <p className={themeClasses.themeFg}>{t('checkingAuthentication')}</p>
                    </div>
                </div>
            )}

            {/* Unauthenticated state */}
            {authStatus === 'unauthenticated' && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className={`text-center ${themeClasses.themeCard} ${themeClasses.compactCard} rounded-lg shadow-md`}>
                        <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className={`${themeClasses.textXl} font-bold ${themeClasses.themeFg} mb-2`}>
                            {t('authenticationRequired')}
                        </h2>
                        <p className={`${themeClasses.themeMutedFg} mb-4`}>
                            {t('pleaseLoginToAccess')}
                        </p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="btn-accent"
                        >
                            {t('goToLogin')}
                        </button>
                    </div>
                </div>
            )}

            {/* Authenticated content */}
            {authStatus === 'authenticated' && (
                <>
                    <div className={isCompact ? 'mb-4' : 'mb-8'}>
                        <h1 className={`${themeClasses.text3Xl} font-bold ${themeClasses.themeFg} mb-2`}>
                            {t('settings')}
                        </h1>
                        <p className={`${themeClasses.themeMutedFg} ${themeClasses.textBase}`}>
                            {t('manageAccount')}
                        </p>
                    </div>

                    <div className={`flex flex-col lg:flex-row ${themeClasses.compactGap}`}>
                        {/* Sidebar Navigation */}
                        <div className="lg:w-64">
                            <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} ${themeClasses.compactCard}`}>
                                <nav className="space-y-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    setError(null);
                                                }}
                                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                    ? 'accent-bg text-white'
                                                    : `${themeClasses.themeFg} ${themeClasses.hover}`
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className={`${themeClasses.textSm} font-medium`}>
                                                    {tab.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {renderTabContent()}

                            {/* Save Button */}
                            <div className={`${isCompact ? 'mt-4' : 'mt-8'} flex justify-end`}>
                                <button
                                    onClick={() => handleSave(activeTab)}
                                    disabled={loading || profileLoading}
                                    className="btn-accent disabled:opacity-50"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : saved ? (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {loading ? t('savingChanges') : saved ? t('saved') : t('saveChanges')}
                                </button>
                            </div>

                            {/* Success message */}
                            {saved && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                        <span className="text-sm text-green-800 dark:text-green-300">
                                            {t('settingsSavedSuccessfully')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrganizerSettings;