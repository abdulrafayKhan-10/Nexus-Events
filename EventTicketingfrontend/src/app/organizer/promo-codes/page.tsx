/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useThemeClasses } from '@/hooks/useTheme';
import { useI18n } from '@/components/providers/I18nProvider';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { promoCodesApi, type PromoCode, type PromoCodeStats } from '@/lib/api';

import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Users,
    DollarSign,
    TrendingUp,
    Copy,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    BarChart3,
    Tag,
    Globe,
    RefreshCw,
    Download
} from 'lucide-react';

interface UserPreferences {
    emailNotifications?: boolean;
    sessionTimeout?: number;
    theme?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
    defaultTimeZone?: string;
    accentColor?: string;
    fontSize?: string;
    compactMode?: boolean;
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';


const PromoCodesPage: React.FC = () => {
    const themeClasses = useThemeClasses();
    const { t } = useI18n();
    const { user, isOrganizer } = useAuth();
    const router = useRouter();

    const [preferences, setPreferences] = useState<UserPreferences | null>(null);


    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [stats, setStats] = useState<PromoCodeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterScope, setFilterScope] = useState('all');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        if (user && !isOrganizer) {
            router.push('/');
        } else if (user && isOrganizer) {
            fetchUserPreferences();
            fetchPromoData();
        }
    }, [user, isOrganizer, router]);



    type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

    function isCurrency(value: unknown): value is Currency {
        return typeof value === 'string' &&
            ['USD', 'EUR', 'GBP', 'JPY'].includes(value);
    }

    const CURRENCIES = {
        USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
        EUR: { symbol: '', name: 'Euro', code: 'EUR' },
        GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
        JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' }
    };

    const EXCHANGE_RATES = {
        USD: 1.00,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.0
    };

    const convertFromUSD = (usdAmount: number, toCurrency: string): number => {
        const rate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;
        return usdAmount * rate;
    };

    const formatCurrencyWithUserPreference = (amount: number, preferences: UserPreferences | null) => {
        const currency = preferences?.currency ?? 'USD';

        try {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: currency === 'JPY' ? 0 : 2,
                maximumFractionDigits: currency === 'JPY' ? 0 : 2
            });
            return formatter.format(amount);
        } catch (error) {
            const symbols: { [key: string]: string } = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'JPY': '¥'
            };

            const symbol = symbols[currency] || '$';

            if (currency === 'JPY') {
                const wholeAmount = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return `${symbol}${wholeAmount}`;
            }

            const formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return `${symbol}${formattedAmount}`;
        }
    };


    const fetchUserPreferences = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userPreferences = await response.json();
                setPreferences(userPreferences);
            }
        } catch (error) {
            setPreferences({
                currency: 'USD',
                dateFormat: 'MM/dd/yyyy',
                timeFormat: '12h',
                defaultTimeZone: 'UTC'
            });
        }
    };

    const fetchPromoData = async () => {
        try {
            setLoading(true);
            setError('');

            const [promoCodesData, statsData] = await Promise.allSettled([
                promoCodesApi.getPromoCodes(),
                promoCodesApi.getStats()
            ]);

            if (promoCodesData.status === 'fulfilled') {
                setPromoCodes(promoCodesData.value);
            } else {
                throw new Error(t('failedToLoadPromoCodes'));
            }

            if (statsData.status === 'fulfilled') {
                setStats(statsData.value);
            } else {
                console.warn('Stats not available:', statsData.reason);
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('failedToLoadPromoCodes');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePromoCode = async (promoCodeId: number, code: string) => {
        if (!confirm(t('deletePromoCodeConfirm', { code }))) {
            return;
        }

        try {
            await promoCodesApi.deletePromoCode(promoCodeId);
            setPromoCodes(prev => prev.filter(pc => pc.promoCodeId !== promoCodeId));
            setSuccess(t('promoCodeDeletedSuccessfully'));
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('failedToDeletePromoCode');
            setError(errorMessage);
        }
    };

    const formatEventDateTime = (dateTimeString: string, preferences: UserPreferences | null, currentLangData: any, t: any) => {
        const eventDate = new Date(dateTimeString);
        const userTimeZone = preferences?.defaultTimeZone || 'UTC';
        const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';
        const timeFormat = preferences?.timeFormat || '12h';

        const zonedDate = new Date(eventDate.toLocaleString("en-US", { timeZone: userTimeZone }));

        const year = zonedDate.getFullYear();
        const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
        const day = String(zonedDate.getDate()).padStart(2, '0');

        const monthNames = [
            t('january'), t('february'), t('march'), t('april'),
            t('may'), t('june'), t('july'), t('august'),
            t('september'), t('october'), t('november'), t('december')
        ];
        const monthShort = monthNames[zonedDate.getMonth()];

        const weekdays = [
            t('sunday'), t('monday'), t('tuesday'), t('wednesday'),
            t('thursday'), t('friday'), t('saturday')
        ];
        const weekday = weekdays[zonedDate.getDay()];

        // Format date according to user preference - INDEPENDENT OF LOCALE
        let formattedDate: string;
        switch (dateFormat) {
            case 'dd/MM/yyyy':
                formattedDate = `${weekday}, ${day}/${month}/${year}`;
                break;
            case 'yyyy-MM-dd':
                formattedDate = `${weekday}, ${year}-${month}-${day}`;
                break;
            case 'MMM dd, yyyy':
                formattedDate = `${weekday}, ${monthShort} ${parseInt(day)}, ${year}`;
                break;
            case 'dd MMM yyyy':
                formattedDate = `${weekday}, ${parseInt(day)} ${monthShort} ${year}`;
                break;
            default: // MM/dd/yyyy
                formattedDate = `${weekday}, ${month}/${day}/${year}`;
        }

        // Format time - also independent of locale
        const hours24 = zonedDate.getHours();
        const minutes = String(zonedDate.getMinutes()).padStart(2, '0');

        let formattedTime: string;
        if (timeFormat === '24h') {
            formattedTime = `${String(hours24).padStart(2, '0')}:${minutes}`;
        } else {
            const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
            const ampm = hours24 >= 12 ? 'PM' : 'AM';
            formattedTime = `${hours12}:${minutes} ${ampm}`;
        }

        // Add timezone abbreviation
        const timeZoneAbbr = getTimeZoneAbbreviation(userTimeZone);
        formattedTime += ` ${timeZoneAbbr}`;

        const result = `${formattedDate} ${t('at')} ${formattedTime}`;

        return result;
    };

    const getTimeZoneAbbreviation = (timeZone: string): string => {
        const abbreviations: { [key: string]: string } = {
            'UTC': 'UTC',
            'America/New_York': 'EST/EDT',
            'America/Chicago': 'CST/CDT',
            'America/Denver': 'MST/MDT',
            'America/Los_Angeles': 'PST/PDT',
            'Asia/Kuala_Lumpur': 'MYT',
            'Europe/London': 'GMT/BST',
            'Europe/Paris': 'CET/CEST',
            'Asia/Tokyo': 'JST',
            'Australia/Sydney': 'AEST/AEDT'
        };

        return abbreviations[timeZone] || timeZone.split('/').pop() || 'UTC';
    };

    const copyToClipboard = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (error) {
        }
    };

    const filteredPromoCodes = promoCodes.filter(promoCode => {
        const matchesSearch = promoCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (promoCode.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (promoCode.eventTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && promoCode.isActive) ||
            (filterStatus === 'inactive' && !promoCode.isActive) ||
            (filterStatus === 'expired' && !promoCode.isValid && promoCode.invalidReason?.includes('Expired'));

        const matchesScope = filterScope === 'all' ||
            (filterScope === 'organizer' && promoCode.scope === 'OrganizerWide') ||
            (filterScope === 'event' && promoCode.scope === 'EventSpecific');

        return matchesSearch && matchesStatus && matchesScope;
    });

    const getStatusColor = (promoCode: PromoCode) => {
        if (!promoCode.isActive) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        if (!promoCode.isValid) {
            if (promoCode.invalidReason?.includes('Expired'))
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        }
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    };

    const getStatusText = (promoCode: PromoCode) => {
        if (!promoCode.isActive) return t('inactive');
        if (!promoCode.isValid) {
            if (promoCode.invalidReason?.includes('Expired')) return t('expired');
            if (promoCode.invalidReason?.includes('Not yet active')) return t('scheduled');
            if (promoCode.invalidReason?.includes('Usage limit')) return t('usedUp');
            return t('invalid');
        }
        return t('active');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateWithUserPreference = (dateString: string, preferences: UserPreferences | null) => {
        const date = new Date(dateString);
        const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Get month names for formatting
        const monthNames = [
            t('jan'), t('feb'), t('mar'), t('apr'),
            t('may'), t('jun'), t('jul'), t('aug'),
            t('sep'), t('oct'), t('nov'), t('dec')
        ];
        const monthShort = monthNames[date.getMonth()];

        // Format according to user preference
        switch (dateFormat) {
            case 'dd/MM/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-MM-dd':
                return `${year}-${month}-${day}`;
            case 'MMM dd, yyyy':
                return `${monthShort} ${parseInt(day)}, ${year}`;
            case 'dd MMM yyyy':
                return `${parseInt(day)} ${monthShort} ${year}`;
            default: // MM/dd/yyyy
                return `${month}/${day}/${year}`;
        }
    };

    if (!user || !isOrganizer) {
        return (
            <div className={`min-h-screen ${themeClasses.themeBg} flex items-center justify-center theme-transition`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-border mx-auto"></div>
                    <p className={`mt-4 ${themeClasses.themeMutedFg}`}>{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`min-h-screen ${themeClasses.themeBg} theme-transition`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-border mx-auto"></div>
                            <p className={`mt-4 ${themeClasses.themeMutedFg}`}>{t('loadingPromoCodes')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.themeBg} theme-transition`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header - Following your existing pattern */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className={`text-3xl font-bold ${themeClasses.themeFg}`}>{t('promoCodes')}</h1>
                            <p className={`${themeClasses.themeMutedFg} mt-1`}>
                                {t('createAndManageDiscountCodes')}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={fetchPromoData}
                                className={`flex items-center px-4 py-2 ${themeClasses.themeMuted} ${themeClasses.themeMutedFg} rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t('refresh')}
                            </button>
                            <button
                                onClick={() => router.push('/organizer/promo-codes/create')}
                                className="btn-accent"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                {t('createPromoCode')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages - Following your existing pattern */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                            <p className="text-green-700 dark:text-green-300">{success}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Stats Cards - Following your dashboard pattern */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${themeClasses.themeMutedFg}`}>{t('totalCodes')}</p>
                                    <p className={`text-2xl font-bold ${themeClasses.themeFg}`}>{stats.totalPromoCodes}</p>
                                </div>
                                <Tag className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${themeClasses.themeMutedFg}`}>{t('activeCodes')}</p>
                                    <p className={`text-2xl font-bold ${themeClasses.themeFg}`}>{stats.activePromoCodes}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${themeClasses.themeMutedFg}`}>{t('totalUses')}</p>
                                    <p className={`text-2xl font-bold ${themeClasses.themeFg}`}>{stats.totalUsages}</p>
                                </div>
                                <Users className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>

                        <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${themeClasses.themeMutedFg}`}>{t('totalSavings')}</p>
                                    <p className={`text-2xl font-bold ${themeClasses.themeFg}`}>
                                        {formatCurrencyWithUserPreference(
                                            convertFromUSD(stats.totalDiscountGiven, preferences?.currency || 'USD'),
                                            preferences
                                        )}
                                    </p>
                                    {preferences?.currency && preferences.currency !== 'USD' && (
                                        <p className={`text-xs ${themeClasses.themeMutedFg} mt-1`}>
                                            (≈ ${stats.totalDiscountGiven.toFixed(2)} USD)
                                        </p>
                                    )}
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filters - Following your existing pattern */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.themeMutedFg}`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('searchPromoCodes')}
                            className={`w-full pl-10 pr-4 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition`}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className={`h-5 w-5 ${themeClasses.themeMutedFg}`} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={`px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition`}
                        >
                            <option value="all">{t('allStatus')}</option>
                            <option value="active">{t('active')}</option>
                            <option value="inactive">{t('inactive')}</option>
                            <option value="expired">{t('expired')}</option>
                        </select>
                        <select
                            value={filterScope}
                            onChange={(e) => setFilterScope(e.target.value)}
                            className={`px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition`}
                        >
                            <option value="all">{t('allScopes')}</option>
                            <option value="organizer">{t('organizerWide')}</option>
                            <option value="event">{t('eventSpecific')}</option>
                        </select>
                    </div>
                </div>

                {/* Main Content - Promo Codes List or Empty State */}
                <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} theme-transition`}>
                    {filteredPromoCodes.length === 0 ? (
                        <div className="text-center py-12">
                            <Tag className={`h-12 w-12 ${themeClasses.themeMutedFg} mx-auto mb-4`} />
                            <h3 className={`text-lg font-medium ${themeClasses.themeFg} mb-2`}>
                                {promoCodes.length === 0 ? t('noPromoCodesYet') : t('noPromoCodesMatchFilters')}
                            </h3>
                            <p className={`${themeClasses.themeMutedFg} mb-6`}>
                                {promoCodes.length === 0
                                    ? t('createFirstPromoCodeDescription')
                                    : t('adjustSearchOrFilterCriteria')
                                }
                            </p>
                            {promoCodes.length === 0 && (
                                <button
                                    onClick={() => router.push('/organizer/promo-codes/create')}
                                    className="btn-accent"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('createFirstPromoCode')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={`border-b ${themeClasses.themeBorder}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.themeMutedFg} uppercase tracking-wider`}>
                                            {t('code')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.themeMutedFg} uppercase tracking-wider`}>
                                            {t('details')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.themeMutedFg} uppercase tracking-wider`}>
                                            {t('usage')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.themeMutedFg} uppercase tracking-wider`}>
                                            {t('period')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.themeMutedFg} uppercase tracking-wider`}>
                                            {t('status')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.themeMutedFg} uppercase tracking-wider`}>
                                            {t('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredPromoCodes.map((promoCode) => (
                                        <tr key={promoCode.promoCodeId} className={`${themeClasses.hover} theme-transition`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div>
                                                        <div className={`text-sm font-medium ${themeClasses.themeFg} font-mono`}>
                                                            {promoCode.code}
                                                        </div>
                                                        <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                                            {promoCode.scope === 'EventSpecific' ? (
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    {promoCode.eventTitle || t('eventSpecificDescription')}
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center">
                                                                    <Globe className="h-3 w-3 mr-1" />
                                                                    {t('allEvents')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(promoCode.code)}
                                                        className={`p-1 rounded ${themeClasses.hover} transition-colors`}
                                                        title={t('copyCode')}
                                                    >
                                                        {copiedCode === promoCode.code ? (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className={`h-4 w-4 ${themeClasses.themeMutedFg}`} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className={`text-sm ${themeClasses.themeFg} font-medium`}>
                                                        {(() => {
                                                            if (promoCode.formattedValue.includes('%')) {
                                                                return promoCode.formattedValue;
                                                            }

                                                            if (promoCode.formattedValue.includes('$') || promoCode.formattedValue.includes('USD')) {
                                                                // Extract the numeric value from formattedValue
                                                                const numericValue = parseFloat(promoCode.formattedValue.replace(/[^0-9.]/g, ''));
                                                                if (!isNaN(numericValue)) {
                                                                    return formatCurrencyWithUserPreference(
                                                                        convertFromUSD(numericValue, preferences?.currency || 'USD'),
                                                                        preferences
                                                                    ) + ' off';
                                                                }
                                                            }

                                                            // Fallback to original formatted value
                                                            return promoCode.formattedValue;
                                                        })()}
                                                    </div>
                                                    <div className={`text-xs ${themeClasses.themeMutedFg} truncate max-w-xs`}>
                                                        {promoCode.description}
                                                    </div>
                                                    {promoCode.minimumOrderAmount && (
                                                        <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                                            {t('minimumOrderAmount')}: {formatCurrencyWithUserPreference(
                                                                convertFromUSD(promoCode.minimumOrderAmount, preferences?.currency || 'USD'),
                                                                preferences
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Show original USD amount if currency was converted */}
                                                    {(() => {
                                                        const isFixedAmount = promoCode.formattedValue.includes('$') || promoCode.formattedValue.includes('USD');
                                                        const userCurrency = preferences?.currency || 'USD';

                                                        if (isFixedAmount && userCurrency !== 'USD' && !promoCode.formattedValue.includes('%')) {
                                                            return (
                                                                <div className={`text-xs ${themeClasses.themeMutedFg} opacity-75 mt-1`}>
                                                                    (≈ {promoCode.formattedValue} USD)
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${themeClasses.themeFg}`}>
                                                    {promoCode.currentUsageCount} / {promoCode.maxUsageCount}
                                                </div>
                                                <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1`}>
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{
                                                            width: `${(promoCode.currentUsageCount / promoCode.maxUsageCount) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className={`text-xs ${themeClasses.themeMutedFg} mt-1`}>
                                                    {promoCode.remainingUsage} {t('remaining')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                                    <div>{t('start')}: {formatDateWithUserPreference(promoCode.startDate, preferences)}</div>
                                                    <div>{t('end')}: {formatDateWithUserPreference(promoCode.endDate, preferences)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promoCode)}`}>
                                                    {getStatusText(promoCode)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/organizer/promo-codes/${promoCode.promoCodeId}/analytics`)}
                                                        className={`p-2 rounded ${themeClasses.hover} transition-colors`}
                                                        title={t('viewAnalytics')}
                                                    >
                                                        <BarChart3 className={`h-4 w-4 ${themeClasses.themeMutedFg}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/organizer/promo-codes/${promoCode.promoCodeId}/edit`)}
                                                        className={`p-2 rounded ${themeClasses.hover} transition-colors`}
                                                        title={t('edit')}
                                                    >
                                                        <Edit className={`h-4 w-4 ${themeClasses.themeMutedFg}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePromoCode(promoCode.promoCodeId, promoCode.code)}
                                                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                        title={t('delete')}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Top Performing Codes - Following your existing pattern */}
                {stats && stats.topPerformingCodes.length > 0 && (
                    <div className={`mt-8 ${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                        <h3 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                            {t('topPerformingCodes')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.topPerformingCodes.slice(0, 3).map((code: { code: string; usages: number; totalDiscount: number }, index: number) => (
                                <div key={code.code} className={`p-4 ${index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : themeClasses.themeMuted} rounded-lg`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-mono font-semibold ${themeClasses.themeFg}`}>
                                            {code.code}
                                        </span>
                                        {index === 0 && (
                                            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                                                {t('numberOne')}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-sm ${themeClasses.themeMutedFg}`}>
                                        <div className="flex items-center justify-between">
                                            <span>{code.usages} {t('uses')}</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                                {formatCurrencyWithUserPreference(
                                                    convertFromUSD(code.totalDiscount, preferences?.currency || 'USD'),
                                                    preferences
                                                )}
                                            </span>
                                        </div>
                                        {preferences?.currency && preferences.currency !== 'USD' && (
                                            <div className="text-xs opacity-60 mt-1">
                                                (≈ ${code.totalDiscount.toFixed(2)} USD)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoCodesPage;