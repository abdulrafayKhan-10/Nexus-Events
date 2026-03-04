/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/profile/page.tsx - Attendee-focused profile page with mirror background and translations
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { userApi, imageApi } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import {
    User,
    Mail,
    Phone,
    Lock,
    Calendar,
    Bell,
    Shield,
    Trash2,
    Save,
    Camera,
    ArrowLeft,
    Download,
    Eye,
    EyeOff,
    Upload,
    X,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react';

interface AttendeeProfile {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    profileImageUrl?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
    status: string;
    bio?: string;
    timeZone?: string;
    isOrganizer: boolean;
    roles: string[];
}

interface AttendeePreferences {
    emailNotifications: boolean;
    sessionTimeout: number;
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    defaultTimeZone?: string;
    accentColor?: string;
    fontSize?: string;
    compactMode?: boolean;
    currency?: string;
}

interface PasswordChange {
    currentPassword: string;
    newPassword: string;
}

const getThemeClasses = (preferences: AttendeePreferences | null) => {
    const isDarkMode = true; // Always true for the new premium theme

    const compactMode = preferences?.compactMode || false;
    const fontSize = preferences?.fontSize || 'medium';

    // Font size configurations
    const fontSizes = {
        small: {
            text: 'text-sm',
            heading: 'text-lg',
            title: 'text-xl',
            subtitle: 'text-xs',
            button: 'text-sm',
            label: 'text-xs'
        },
        medium: {
            text: 'text-base',
            heading: 'text-xl',
            title: 'text-2xl',
            subtitle: 'text-sm',
            button: 'text-base',
            label: 'text-sm'
        },
        large: {
            text: 'text-lg',
            heading: 'text-2xl',
            title: 'text-3xl',
            subtitle: 'text-base',
            button: 'text-lg',
            label: 'text-base'
        }
    };

    const currentFont = fontSizes[fontSize as keyof typeof fontSizes] || fontSizes.medium;

    return {
        // Deep Space Premium Colors
        background: 'bg-[#0a0f1c]',
        backgroundCard: 'bg-[#1e293b]/70 backdrop-blur-md', // Better visibility over image
        backgroundSidebar: 'bg-[#1e293b]/70 backdrop-blur-md',
        backgroundInput: 'bg-[#0f172a]/90 focus:bg-[#1e293b]/90', // Contrast for inputs
        backgroundDisabled: 'bg-[#0a0f1c]/50',
        backgroundSuccess: 'bg-emerald-500/10',
        backgroundError: 'bg-rose-500/10',
        backgroundSecure: 'bg-emerald-500/10',
        backgroundOverlay: 'bg-[#0a0f1c]/70', // Darkened overlay to make UI readable

        // Text Colors
        text: 'text-slate-50',
        textSecondary: 'text-slate-300',
        textDisabled: 'text-slate-500',
        textSuccess: 'text-emerald-400',
        textError: 'text-rose-400',
        textSecure: 'text-emerald-400',
        textLight: 'text-white',

        // Borders
        border: 'border-slate-700/50',
        borderCard: 'border-slate-700/50',
        borderSuccess: 'border-emerald-500/30',
        borderError: 'border-rose-500/30',
        borderSecure: 'border-emerald-500/30',

        // Effects
        shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        hover: 'hover:bg-white/5',
        hoverRed: 'hover:bg-red-500/10',

        // Form elements
        label: 'text-gray-300',
        placeholder: 'placeholder-gray-500',

        // Typography & Layout
        fontSize: currentFont,

        // Padding/spacing based on compact mode
        padding: compactMode ? 'p-3' : 'p-6',
        paddingSmall: compactMode ? 'p-2' : 'p-4',
        paddingLarge: compactMode ? 'p-4' : 'p-8',

        margin: compactMode ? 'mb-3' : 'mb-6',
        marginSmall: compactMode ? 'mb-2' : 'mb-4',
        marginLarge: compactMode ? 'mb-4' : 'mb-8',

        spacing: compactMode ? 'space-y-2' : 'space-y-4',
        spacingLarge: compactMode ? 'space-y-3' : 'space-y-6',

        gap: compactMode ? 'gap-2' : 'gap-4',
        gapLarge: compactMode ? 'gap-3' : 'gap-6',

        buttonPadding: compactMode ? 'px-4 py-2' : 'px-6 py-3',
        buttonPaddingSmall: compactMode ? 'px-2 py-1' : 'px-3 py-2',

        inputHeight: compactMode ? 'h-9' : 'h-11',

        iconSize: compactMode ? 'h-4 w-4' : 'h-5 w-5',
        iconSizeSmall: compactMode ? 'h-3 w-3' : 'h-4 w-4',
        iconSizeLarge: compactMode ? 'h-6 w-6' : 'h-8 w-8',

        // Accent Colors (Neon Cyan primary)
        accent: 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan',
        accentHover: 'hover:bg-neon-cyan/30',
        accentText: 'text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]',
        accentLight: 'bg-neon-cyan/10',
        accentBorder: 'border-neon-cyan/50',
        accentRing: 'focus:ring-neon-cyan focus:border-neon-cyan',

        // State info
        isDarkMode: true,
        accentColor: 'neon',
        fontSizeValue: fontSize,
        compactMode
    };
};

export default function AttendeeProfilePage() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const { t, currentLanguage, changeLanguage, availableLanguages } = useI18n();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState<AttendeeProfile | null>(null);
    const [preferences, setPreferences] = useState<AttendeePreferences | null>(null);
    const [passwordData, setPasswordData] = useState<PasswordChange>({
        currentPassword: '',
        newPassword: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const themeClasses = getThemeClasses(preferences);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadUserData();
    }, [isAuthenticated]);

    const getFullImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        const backendUrl = 'http://localhost:5251';
        return backendUrl + imageUrl;
    };

    const formatDateForInput = (dateString: string | undefined | null) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {
        if (preferences) {
            if (themeClasses.isDarkMode) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
            }
        }
    }, [preferences, themeClasses.isDarkMode]);

    const loadUserData = async () => {
        try {
            setLoading(true);

            const profileData = await userApi.getProfile();

            if (profileData.isOrganizer) {
                router.push('/profile/organizer');
                return;
            }

            setProfile(profileData);

            try {
                const prefsData = await userApi.getPreferences();
                setPreferences({
                    emailNotifications: prefsData.emailNotifications || true,
                    sessionTimeout: prefsData.sessionTimeout || 30,
                    theme: prefsData.theme || 'light',
                    language: prefsData.language || 'en',
                    dateFormat: prefsData.dateFormat || 'MM/dd/yyyy',
                    timeFormat: prefsData.timeFormat || '12h',
                    defaultTimeZone: prefsData.defaultTimeZone || 'UTC',
                    accentColor: prefsData.accentColor || 'blue',
                    fontSize: prefsData.fontSize || 'medium',
                    compactMode: prefsData.compactMode || false
                });
            } catch (prefsError) {
                console.log('No preferences found, using defaults');
                setPreferences({
                    emailNotifications: true,
                    sessionTimeout: 30,
                    theme: 'light',
                    language: 'en',
                    dateFormat: 'MM/dd/yyyy',
                    timeFormat: '12h',
                    defaultTimeZone: 'UTC',
                    accentColor: 'blue',
                    fontSize: 'medium',
                    compactMode: false
                });
            }
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                return;
            }

            setProfileImageFile(file);

            const reader = new FileReader();
            reader.onload = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadProfileImage = async () => {
        if (!profileImageFile) return;

        try {
            setUploadingImage(true);
            setError('');

            await imageApi.uploadUserProfileImage(profileImageFile);

            const updatedProfile = await userApi.getProfile();
            setProfile(updatedProfile);

            const { refreshUser } = useAuth();
            if (refreshUser) {
                await refreshUser();
            }

            setProfileImageFile(null);
            setProfileImagePreview('');
            setSuccess(t('imageUploadSuccess'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
        } finally {
            setUploadingImage(false);
        }
    };

    const deleteProfileImage = async () => {
        try {
            setUploadingImage(true);
            setError('');

            await imageApi.deleteUserProfileImage();

            const updatedProfile = await userApi.getProfile();
            setProfile(updatedProfile);

            setSuccess(t('imageUploadSuccess'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(t('imageUploadFailed') + ': ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const updateProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const updateData = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                dateOfBirth: profile.dateOfBirth,
                bio: profile.bio,
                timeZone: profile.timeZone
            };

            const updatedProfile = await userApi.updateProfile(updateData);
            setProfile(updatedProfile);

            setSuccess(t('profileUpdatedSuccessfully'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async () => {
        if (passwordData.newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError(t('passwordTooShort'));
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            await userApi.changePassword(passwordData);

            setPasswordData({ currentPassword: '', newPassword: '' });
            setConfirmPassword('');
            setSuccess(t('passwordChanged'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
        } finally {
            setSaving(false);
        }
    };

    const updatePreferences = async () => {
        if (!preferences) return;

        try {
            setSaving(true);
            setError('');
            setSuccess('');


            const currentPrefs = await userApi.getPreferences();

            const fullPreferences = {
                ...currentPrefs,
                emailNotifications: preferences.emailNotifications ?? currentPrefs.emailNotifications ?? true,
                smsNotifications: currentPrefs.smsNotifications ?? false,
                newBookingNotifications: currentPrefs.newBookingNotifications ?? true,
                cancellationNotifications: currentPrefs.cancellationNotifications ?? true,
                lowInventoryNotifications: currentPrefs.lowInventoryNotifications ?? false,
                dailyReports: currentPrefs.dailyReports ?? false,
                weeklyReports: currentPrefs.weeklyReports ?? false,
                monthlyReports: currentPrefs.monthlyReports ?? false,
                twoFactorEnabled: currentPrefs.twoFactorEnabled ?? false,
                sessionTimeout: preferences.sessionTimeout ?? currentPrefs.sessionTimeout ?? 30,
                loginNotifications: currentPrefs.loginNotifications ?? false,
                defaultTimeZone: preferences.defaultTimeZone ?? currentPrefs.defaultTimeZone ?? 'UTC',
                defaultEventDuration: currentPrefs.defaultEventDuration ?? 120,
                defaultTicketSaleStart: currentPrefs.defaultTicketSaleStart ?? 30,
                defaultRefundPolicy: currentPrefs.defaultRefundPolicy ?? 'flexible',
                requireApproval: currentPrefs.requireApproval ?? false,
                autoPublish: currentPrefs.autoPublish ?? false,
                theme: preferences.theme ?? currentPrefs.theme ?? 'light',
                language: preferences.language ?? currentPrefs.language ?? 'en',
                dateFormat: preferences.dateFormat ?? currentPrefs.dateFormat ?? 'MM/dd/yyyy',
                timeFormat: preferences.timeFormat ?? currentPrefs.timeFormat ?? '12h',
                currency: preferences.currency ?? currentPrefs.currency ?? 'USD',
                accentColor: preferences.accentColor ?? currentPrefs.accentColor ?? 'blue',
                fontSize: preferences.fontSize ?? currentPrefs.fontSize ?? 'medium',
                compactMode: preferences.compactMode ?? currentPrefs.compactMode ?? false
            };


            await userApi.updatePreferences(fullPreferences);

            // Update language in the i18n context
            if (preferences.language !== currentLanguage) {
                changeLanguage(preferences.language);
            }

            setSuccess(t('preferencesUpdatedSuccessfully'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {

            if (error.response) {

                const errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    JSON.stringify(error.response.data) ||
                    error.message;

            } else {
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteAccount = async () => {
        if (!confirm(t('confirmDeleteEvent', { title: t('profile') }))) {
            return;
        }

        const secondConfirm = prompt('Type "DELETE" to confirm account deletion:');
        if (secondConfirm !== 'DELETE') {
            setError('Account deletion cancelled');
            return;
        }

        try {
            setSaving(true);
            logout();
            router.push('/');
        } catch (error: any) {
            setError('Failed to delete account: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const downloadData = async () => {
        try {
            const dataToExport = {
                profile: profile,
                preferences: preferences,
                downloadDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-profile-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess('Data downloaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
        }
    };

    if (loading) {
        return (
            <div
                className="min-h-screen relative"
                style={{
                    backgroundImage: 'url("/images/bg/background.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    transform: 'scaleX(-1)'
                }}
            >
                <div className={`min-h-screen ${themeClasses?.backgroundOverlay || 'bg-black/20'} backdrop-blur-[2px]`} style={{ transform: 'scaleX(-1)' }}>
                    <div className="flex items-center justify-center min-h-screen">
                        <div className={`${themeClasses?.backgroundCard} backdrop-blur-xl rounded-2xl ${themeClasses?.paddingLarge} ${themeClasses?.shadow} border ${themeClasses?.borderCard}`}>
                            <div className="text-center">
                                <div className={`animate-spin rounded-full ${themeClasses?.iconSizeLarge} border-b-2 border-blue-600 mx-auto ${themeClasses?.marginSmall}`}></div>
                                <h1 className={`${themeClasses?.fontSize.title} font-bold ${themeClasses?.text} ${themeClasses?.marginSmall}`}>{t('loadingProfile')}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>Profile not found</h1>
                    <button
                        onClick={() => router.push('/')}
                        className={`${themeClasses.accent} ${themeClasses.accentHover} text-white ${themeClasses.buttonPadding} rounded-lg ${themeClasses.fontSize.button}`}
                    >
                        {t('home')}
                    </button>
                </div>
            </div>
        );
    }

    // Attendee-focused tabs
    const tabs = [
        { id: 'profile', label: t('personalInformation'), icon: User },
        { id: 'security', label: t('security'), icon: Shield },
        { id: 'preferences', label: t('eventPreferences'), icon: Bell }
    ];

    return (
        <div className={`min-h-screen relative ${themeClasses.background}`}>
            <div className={`min-h-screen ${themeClasses.backgroundOverlay} backdrop-blur-[2px]`}>
                {/* Header */}
                <div className={`${themeClasses.backgroundSidebar} backdrop-blur-xl shadow-lg border-b ${themeClasses.borderCard}`}>
                    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${themeClasses.paddingSmall}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => router.back()}
                                    className={`flex items-center ${themeClasses.textSecondary} hover:${themeClasses.text} mr-4 transition-colors ${themeClasses.fontSize.text}`}
                                >
                                    <ArrowLeft className={`${themeClasses.iconSize} mr-2`} />
                                    {t('back')}
                                </button>
                                <h1 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text}`}>{t('profile')}</h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>
                                    {profile.firstName} {profile.lastName}
                                </span>
                                <div className={`${themeClasses.iconSizeLarge} ${themeClasses.accentLight} rounded-full flex items-center justify-center overflow-hidden border-2 ${themeClasses.accentBorder}`}>
                                    {profile.profileImageUrl ? (
                                        <img
                                            src={getFullImageUrl(profile.profileImageUrl)}
                                            alt={`${profile.firstName} ${profile.lastName}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) {
                                                    fallback.style.display = 'block';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <User className={`${themeClasses.iconSize} ${themeClasses.accentText} ${profile.profileImageUrl ? 'hidden' : 'block'}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className={`grid grid-cols-1 lg:grid-cols-4 ${themeClasses.gap}`}>

                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <nav className={`${themeClasses.spacing} ${themeClasses.backgroundSidebar} backdrop-blur-xl rounded-2xl ${themeClasses.padding} shadow-lg border ${themeClasses.borderCard}`}>
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center ${themeClasses.paddingSmall} text-left rounded-xl transition-all duration-200 ${themeClasses.fontSize.text} ${activeTab === tab.id
                                                ? `${themeClasses.accent} text-white shadow-lg`
                                                : `${themeClasses.textSecondary} ${themeClasses.hover}`
                                                }`}
                                        >
                                            <Icon className={`${themeClasses.iconSize} mr-3`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}

                                {/* Quick Actions */}
                                <div className={`pt-4 border-t ${themeClasses.border} mt-4`}>
                                    <button
                                        onClick={downloadData}
                                        className={`w-full flex items-center ${themeClasses.paddingSmall} text-left rounded-xl ${themeClasses.textSecondary} ${themeClasses.hover} transition-all duration-200 ${themeClasses.fontSize.text}`}
                                    >
                                        <Download className={`${themeClasses.iconSize} mr-3`} />
                                        {t('downloadData')}
                                    </button>
                                    <button
                                        onClick={deleteAccount}
                                        className={`w-full flex items-center ${themeClasses.paddingSmall} text-left rounded-xl text-red-600 ${themeClasses.hoverRed} transition-all duration-200 ${themeClasses.fontSize.text}`}
                                    >
                                        <Trash2 className={`${themeClasses.iconSize} mr-3`} />
                                        {t('delete')} {t('profile')}
                                    </button>
                                </div>
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Success/Error Messages */}
                            {success && (
                                <div className={`mb-6 ${themeClasses.backgroundSuccess} backdrop-blur-sm border ${themeClasses.borderSuccess} ${themeClasses.textSuccess} px-4 py-3 rounded-xl flex items-center`}>
                                    <CheckCircle className={`${themeClasses.iconSize} mr-2`} />
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className={`mb-6 ${themeClasses.backgroundError} backdrop-blur-sm border ${themeClasses.borderError} ${themeClasses.textError} px-4 py-3 rounded-xl flex items-center`}>
                                    <AlertCircle className={`${themeClasses.iconSize} mr-2`} />
                                    {error}
                                </div>
                            )}

                            {/* Profile Info Tab */}
                            {activeTab === 'profile' && (
                                <div className={`${themeClasses.backgroundCard} backdrop-blur-xl rounded-2xl shadow-lg border ${themeClasses.borderCard} ${themeClasses.padding}`}>
                                    <h2 className={`${themeClasses.fontSize.title} font-semibold ${themeClasses.text} ${themeClasses.margin}`}>{t('personalInformation')}</h2>

                                    {/* Profile Picture */}
                                    <div className="flex items-center mb-6">
                                        <div className={`${themeClasses.compactMode ? 'w-16 h-16' : 'w-20 h-20'} ${themeClasses.isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center mr-4 overflow-hidden border-4 ${themeClasses.isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                            {profileImagePreview ? (
                                                <img
                                                    src={profileImagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : profile.profileImageUrl ? (
                                                <img
                                                    src={getFullImageUrl(profile.profileImageUrl)}
                                                    alt={`${profile.firstName} ${profile.lastName}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const fallbackIcon = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                                        if (fallbackIcon) {
                                                            fallbackIcon.style.display = 'block';
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <User className={`${themeClasses.compactMode ? 'h-8 w-8' : 'h-10 w-10'} ${themeClasses.isDarkMode ? 'text-gray-500' : 'text-gray-400'} fallback-icon ${profile.profileImageUrl && !profileImagePreview ? 'hidden' : ''}`} />
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                                id="profile-image-upload"
                                            />
                                            <label
                                                htmlFor="profile-image-upload"
                                                className={`flex items-center ${themeClasses.accentText} ${themeClasses.accentHover} cursor-pointer ${themeClasses.fontSize.text}`}
                                            >
                                                <Camera className={`${themeClasses.iconSizeSmall} mr-2`} />
                                                {t('changeImage')}
                                            </label>

                                            {profileImageFile && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={uploadProfileImage}
                                                        disabled={uploadingImage}
                                                        className={`${themeClasses.fontSize.subtitle} bg-green-600 hover:bg-green-700 text-white ${themeClasses.buttonPaddingSmall} rounded flex items-center disabled:opacity-50`}
                                                    >
                                                        {uploadingImage ? (
                                                            <div className={`animate-spin rounded-full ${themeClasses.iconSizeSmall} border-b-2 border-white mr-1`}></div>
                                                        ) : (
                                                            <Upload className={`${themeClasses.iconSizeSmall} mr-1`} />
                                                        )}
                                                        {t('uploadImage')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setProfileImageFile(null);
                                                            setProfileImagePreview('');
                                                        }}
                                                        className={`${themeClasses.fontSize.subtitle} ${themeClasses.isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white ${themeClasses.buttonPaddingSmall} rounded flex items-center`}
                                                    >
                                                        <X className={`${themeClasses.iconSizeSmall} mr-1`} />
                                                        {t('cancel')}
                                                    </button>
                                                </div>
                                            )}

                                            {profile.profileImageUrl && !profileImageFile && (
                                                <button
                                                    onClick={deleteProfileImage}
                                                    disabled={uploadingImage}
                                                    className={`flex items-center text-red-600 hover:text-red-800 ${themeClasses.fontSize.subtitle} disabled:opacity-50`}
                                                >
                                                    <Trash2 className={`${themeClasses.iconSizeSmall} mr-1`} />
                                                    {t('removeImage')}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={themeClasses.spacing}>
                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('firstName')} *
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('lastName')} *
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('email')} *
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('phoneNumber')}
                                            </label>
                                            <input
                                                type="tel"
                                                value={profile.phoneNumber || ''}
                                                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                                placeholder="For event updates"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('eventDate')}
                                            </label>
                                            <input
                                                type="date"
                                                value={formatDateForInput(profile.dateOfBirth)}
                                                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('timezone')}
                                            </label>
                                            <select
                                                value={profile.timeZone || 'UTC'}
                                                onChange={(e) => setProfile({ ...profile, timeZone: e.target.value })}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                            >
                                                <option value="UTC">UTC</option>
                                                <option value="America/New_York">Eastern Time</option>
                                                <option value="America/Chicago">Central Time</option>
                                                <option value="America/Denver">Mountain Time</option>
                                                <option value="America/Los_Angeles">Pacific Time</option>
                                                <option value="Asia/Kuala_Lumpur">Malaysia Time</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('description')}
                                            </label>
                                            <textarea
                                                value={profile.bio || ''}
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                rows={3}
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                placeholder="Tell other attendees about yourself..."
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                {t('status')}
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <span className={`${themeClasses.buttonPaddingSmall} rounded-full ${themeClasses.fontSize.subtitle} font-medium ${profile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {profile.status}
                                                </span>
                                                {profile.isEmailVerified && (
                                                    <span className={`${themeClasses.buttonPaddingSmall} bg-blue-100 text-blue-800 rounded-full ${themeClasses.fontSize.subtitle} font-medium`}>
                                                        {t('verified')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block ${themeClasses.fontSize.label} font-medium ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                                Member Since
                                            </label>
                                            <input
                                                type="text"
                                                value={new Date(profile.createdAt).toLocaleDateString()}
                                                disabled
                                                className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={updateProfile}
                                            disabled={saving}
                                            className={`${themeClasses.accent} ${themeClasses.accentHover} disabled:opacity-50 text-white font-semibold ${themeClasses.buttonPadding} rounded-xl transition-colors duration-200 flex items-center ${themeClasses.fontSize.button}`}
                                        >
                                            {saving ? (
                                                <>
                                                    <div className={`animate-spin rounded-full ${themeClasses.iconSizeSmall} border-b-2 border-white mr-2`}></div>
                                                    {t('savingChanges')}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className={`${themeClasses.iconSizeSmall} mr-2`} />
                                                    {t('saveChanges')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    {/* Change Password */}
                                    <div className={`${themeClasses.backgroundCard} backdrop-blur-xl rounded-2xl shadow-lg border ${themeClasses.borderCard} ${themeClasses.padding}`}>
                                        <h2 className={`${themeClasses.fontSize.title} font-semibold ${themeClasses.text} mb-4`}>{t('changePassword')}</h2>

                                        <div className="space-y-4 max-w-md">
                                            <div>
                                                <label className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>
                                                    {t('currentPassword')}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 pr-10 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showCurrentPassword ?
                                                            <EyeOff className={`${themeClasses.iconSize} ${themeClasses.textSecondary}`} /> :
                                                            <Eye className={`${themeClasses.iconSize} ${themeClasses.textSecondary}`} />
                                                        }
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>
                                                    {t('newPassword')}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 pr-10 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showNewPassword ?
                                                            <EyeOff className={`${themeClasses.iconSize} ${themeClasses.textSecondary}`} /> :
                                                            <Eye className={`${themeClasses.iconSize} ${themeClasses.textSecondary}`} />
                                                        }
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>
                                                    {t('confirmNewPassword')}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 pr-10 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showConfirmPassword ?
                                                            <EyeOff className={`${themeClasses.iconSize} ${themeClasses.textSecondary}`} /> :
                                                            <Eye className={`${themeClasses.iconSize} ${themeClasses.textSecondary}`} />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={updatePassword}
                                                disabled={saving}
                                                className={`${themeClasses.accent} ${themeClasses.accentHover} disabled:opacity-50 text-white font-semibold ${themeClasses.buttonPadding} rounded-xl transition-colors duration-200 flex items-center ${themeClasses.fontSize.button}`}
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className={`animate-spin rounded-full ${themeClasses.iconSizeSmall} border-b-2 border-white mr-2`}></div>
                                                        {t('changingPassword')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className={`${themeClasses.iconSizeSmall} mr-2`} />
                                                        {t('changePassword')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account Security Info */}
                                    <div className={`${themeClasses.backgroundCard} backdrop-blur-xl rounded-2xl shadow-lg border ${themeClasses.borderCard} ${themeClasses.padding}`}>
                                        <h2 className={`${themeClasses.fontSize.title} font-semibold ${themeClasses.text} mb-4`}>{t('securitySettings')}</h2>
                                        <div className="space-y-4">
                                            <div className={`flex items-center justify-between p-4 ${themeClasses.backgroundSecure} border ${themeClasses.borderSecure} rounded-xl`}>
                                                <div className="flex items-center">
                                                    <Shield className={`${themeClasses.iconSize} ${themeClasses.textSecure} mr-3`} />
                                                    <div>
                                                        <p className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>Account Protected</p>
                                                        <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>Your account is secured with password authentication</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`grid grid-cols-1 md:grid-cols-2 ${themeClasses.gap} ${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>
                                                <div>
                                                    <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}><strong>Account Created:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}><strong>Last Login:</strong> {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Today'}</p>
                                                </div>
                                                <div>
                                                    <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}><strong>Email Verified:</strong> {profile.isEmailVerified ? t('verified') : t('emailNotVerified')}</p>
                                                </div>
                                                <div>
                                                    <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}><strong>Phone Verified:</strong> {profile.isPhoneVerified ? t('verified') : t('phoneNotVerified')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Event Settings Tab - ENHANCED VERSION */}
                            {activeTab === 'preferences' && preferences && (
                                <div className={`${themeClasses.backgroundCard} backdrop-blur-xl rounded-2xl shadow-lg border ${themeClasses.borderCard} ${themeClasses.padding}`}>
                                    <h2 className={`${themeClasses.fontSize.title} font-semibold ${themeClasses.text} ${themeClasses.margin}`}>
                                        {t('eventPreferences')}
                                    </h2>

                                    <div className={themeClasses.spacing}>
                                        {/* Event Notifications */}
                                        <div>
                                            <h3 className={`${themeClasses.fontSize.heading} font-medium ${themeClasses.text} mb-4`}>
                                                {t('notifications')}
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>{t('emailNotifications')}</h4>
                                                        <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>
                                                            {t('getNotifiedNewBooking')}
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={preferences.emailNotifications}
                                                            onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`${themeClasses.compactMode ? 'w-9 h-5' : 'w-11 h-6'} ${themeClasses.isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 ${themeClasses.accentRing.replace('focus:', 'peer-focus:')} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full ${themeClasses.compactMode ? 'after:h-4 after:w-4' : 'after:h-5 after:w-5'} after:transition-all ${themeClasses.accent.replace('bg-', 'peer-checked:bg-')}`}></div>
                                                    </label>
                                                </div>


                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('sessionTimeout')}
                                                    </label>
                                                    <select
                                                        value={preferences.sessionTimeout}
                                                        onChange={(e) => setPreferences({ ...preferences, sessionTimeout: parseInt(e.target.value) })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text} ${themeClasses.inputHeight}`}
                                                    >
                                                        <option value={15}>15 {t('minutes')}</option>
                                                        <option value={30}>30 {t('minutes')}</option>
                                                        <option value={60}>1 {t('hour')}</option>
                                                        <option value={120}>2 {t('hours')}</option>
                                                        <option value={480}>8 {t('hours')}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Display Preferences */}
                                        <div className="border-t pt-6 mt-6">
                                            <h3 className={`${themeClasses.fontSize.heading} font-medium ${themeClasses.text} mb-4`}>
                                                {t('displaySettings')}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 ${themeClasses.gap}`}>
                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('theme')}
                                                    </label>
                                                    <select
                                                        value={preferences.theme}
                                                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        <option value="light">{t('lightMode')}</option>
                                                        <option value="dark">{t('darkMode')}</option>
                                                        <option value="auto">{t('autoMode')}</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('language')}
                                                    </label>
                                                    <select
                                                        value={preferences.language}
                                                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        {availableLanguages.map((lang) => (
                                                            <option key={lang.code} value={lang.code}>
                                                                {lang.flag} {lang.nativeName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('timeFormat')}
                                                    </label>
                                                    <select
                                                        value={preferences.timeFormat}
                                                        onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        <option value="12h">{t('hour12Format')}</option>
                                                        <option value="24h">{t('hour24Format')}</option>
                                                    </select>
                                                </div>


                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('currency')}
                                                    </label>
                                                    <select
                                                        value={preferences.currency}
                                                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        <option value="USD">USD - US Dollar</option>
                                                        <option value="EUR">EUR - Euro</option>
                                                        <option value="GBP">GBP - British Pound</option>
                                                        <option value="JPY">JPY - Japanese Yen</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('dateFormat')}
                                                    </label>
                                                    <select
                                                        value={preferences.dateFormat}
                                                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        <option value="MM/dd/yyyy">MM/dd/yyyy (US)</option>
                                                        <option value="dd/MM/yyyy">dd/MM/yyyy (UK)</option>
                                                        <option value="yyyy-MM-dd">yyyy-MM-dd (ISO)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appearance & Accessibility Section */}
                                        <div className="border-t pt-6 mt-6">
                                            <h3 className={`${themeClasses.fontSize.heading} font-medium ${themeClasses.text} mb-4`}>
                                                {t('appearance')}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${themeClasses.gap}`}>
                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('accentColor')}
                                                    </label>
                                                    <select
                                                        value={preferences.accentColor || 'blue'}
                                                        onChange={(e) => setPreferences({ ...preferences, accentColor: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        <option value="blue">{t('blue')}</option>
                                                        <option value="purple">{t('purple')}</option>
                                                        <option value="green">{t('green')}</option>
                                                        <option value="orange">{t('orange')}</option>
                                                        <option value="pink">{t('pink')}</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className={`block ${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-2`}>
                                                        {t('fontSize')}
                                                    </label>
                                                    <select
                                                        value={preferences.fontSize || 'medium'}
                                                        onChange={(e) => setPreferences({ ...preferences, fontSize: e.target.value })}
                                                        className={`w-full border ${themeClasses.border} rounded-xl px-3 py-2 ${themeClasses.accentRing} ${themeClasses.backgroundInput} ${themeClasses.text} ${themeClasses.fontSize.text}`}
                                                    >
                                                        <option value="small">{t('small')}</option>
                                                        <option value="medium">{t('medium')}</option>
                                                        <option value="large">{t('large')}</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>{t('compactMode')}</h4>
                                                        <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>{t('reduceSpacing')}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={preferences.compactMode || false}
                                                            onChange={(e) => setPreferences({ ...preferences, compactMode: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`${themeClasses.compactMode ? 'w-9 h-5' : 'w-11 h-6'} ${themeClasses.isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 ${themeClasses.accentRing.replace('focus:', 'peer-focus:')} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full ${themeClasses.compactMode ? 'after:h-4 after:w-4' : 'after:h-5 after:w-5'} after:transition-all ${themeClasses.accent.replace('bg-', 'peer-checked:bg-')}`}></div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Live Theme Preview */}
                                            <div className="mt-6">
                                                <h4 className={`${themeClasses.fontSize.subtitle} font-medium ${themeClasses.label} mb-3`}>
                                                    {t('livePreview')}
                                                </h4>
                                                <div className={`grid grid-cols-3 ${themeClasses.gapLarge} ${themeClasses.padding} ${themeClasses.backgroundInput} rounded-xl border ${themeClasses.border}`}>
                                                    <div className={`${themeClasses.compactMode ? 'h-10' : 'h-12'} ${themeClasses.accent} rounded-lg flex items-center justify-center transition-colors duration-200`}>
                                                        <span className={`text-white ${themeClasses.fontSize.subtitle} font-medium`}>Primary</span>
                                                    </div>
                                                    <div className={`${themeClasses.compactMode ? 'h-10' : 'h-12'} ${themeClasses.backgroundCard} border ${themeClasses.border} rounded-lg flex items-center justify-center transition-colors duration-200`}>
                                                        <span className={`${themeClasses.text} ${themeClasses.fontSize.subtitle}`}>Card</span>
                                                    </div>
                                                    <div className={`${themeClasses.compactMode ? 'h-10' : 'h-12'} ${themeClasses.accentLight} rounded-lg flex items-center justify-center transition-colors duration-200`}>
                                                        <span className={`${themeClasses.accentText} ${themeClasses.fontSize.subtitle} font-medium`}>Accent</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={updatePreferences}
                                            disabled={saving}
                                            className={`${themeClasses.accent} ${themeClasses.accentHover} disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center ${themeClasses.fontSize.text}`}
                                        >
                                            {saving ? (
                                                <>
                                                    <div className={`animate-spin rounded-full ${themeClasses.iconSizeSmall} border-b-2 border-white mr-2`}></div>
                                                    {t('savingChanges')}
                                                </>
                                            ) : (
                                                <>
                                                    <Bell className={`${themeClasses.iconSizeSmall} mr-2`} />
                                                    {t('saveChanges')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}