/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useThemeClasses } from '@/hooks/useTheme';
import { useI18n } from '@/components/providers/I18nProvider';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { promoCodesApi, eventsApi, type PromoCode, type Event } from '@/lib/api';
import {
    ArrowLeft,
    Save,
    Calendar,
    DollarSign,
    Percent,
    Tag,
    AlertCircle,
    CheckCircle,
    Globe,
    MapPin,
    Loader2,
    Eye,
    EyeOff,
    Info,
    Clock,
    Users,
    TrendingUp
} from 'lucide-react';

interface UpdatePromoCodeDto {
    description?: string;
    value?: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    startDate?: string;
    endDate?: string;
    maxUsageCount?: number;
    maxUsagePerUser?: number;
    status?: number;
    isActive?: boolean;
}

interface ValidationErrors {
    [key: string]: string;
}

interface FormData {
    description: string;
    value: string;
    minimumOrderAmount: string;
    maximumDiscountAmount: string;
    startDate: string;
    endDate: string;
    maxUsageCount: string;
    maxUsagePerUser: string;
    isActive: boolean;
}

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

const EditPromoCodePage: React.FC = () => {
    const themeClasses = useThemeClasses();
    const { t } = useI18n();
    const { user, isOrganizer } = useAuth();
    const router = useRouter();
    const params = useParams();
    const promoCodeId = Number(params.id);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [events, setEvents] = useState<Event[]>([]);
    const [originalPromoCode, setOriginalPromoCode] = useState<PromoCode | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    const [formData, setFormData] = useState<FormData>({
        description: '',
        value: '',
        minimumOrderAmount: '',
        maximumDiscountAmount: '',
        startDate: '',
        endDate: '',
        maxUsageCount: '',
        maxUsagePerUser: '',
        isActive: true
    });

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        if (user && isOrganizer) {
            fetchUserPreferences();
            loadPromoCode();
            loadEvents();
        } else if (user && !isOrganizer) {
            router.push('/');
        }
    }, [user, isOrganizer, router, promoCodeId]);

    const loadPromoCode = async () => {
        try {
            setInitialLoading(true);
            setError('');

            const promoCode = await promoCodesApi.getPromoCode(promoCodeId);
            setOriginalPromoCode(promoCode);

            setFormData({
                description: promoCode.description || '',
                value: promoCode.value.toString(),
                minimumOrderAmount: promoCode.minimumOrderAmount?.toString() || '',
                maximumDiscountAmount: promoCode.maximumDiscountAmount?.toString() || '',
                startDate: promoCode.startDate.split('T')[0], // Convert to YYYY-MM-DD format
                endDate: promoCode.endDate.split('T')[0],
                maxUsageCount: promoCode.maxUsageCount.toString(),
                maxUsagePerUser: promoCode.maxUsagePerUser?.toString() || '',
                isActive: promoCode.isActive
            });

            if (promoCode.minimumOrderAmount || promoCode.maximumDiscountAmount || promoCode.maxUsagePerUser) {
                setShowAdvanced(true);
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('failedToLoadPromoCodes');
        } finally {
            setInitialLoading(false);
        }
    };

    const loadEvents = async () => {
        try {
            setEventsLoading(true);
            const userEvents = await eventsApi.getMyEvents();
            setEvents(userEvents);
        } catch (error) {
        } finally {
            setEventsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        if (!originalPromoCode) return false;

        const errors: ValidationErrors = {};

        if (!formData.value.trim()) {
            errors.value = t('discountValueRequired');
        } else {
            const value = parseFloat(formData.value);
            if (isNaN(value) || value <= 0) {
                errors.value = t('discountValueMustBePositive');
            } else if (originalPromoCode.type === 'Percentage' && value > 100) {
                errors.value = t('percentageValueCannotExceed100');
            } else if (originalPromoCode.type === 'FixedAmount' && value > 10000) {
                errors.value = t('fixedAmountCannotExceed10000');
            }
        }

        if (!formData.startDate) {
            errors.startDate = t('startDateRequired');
        }

        if (!formData.endDate) {
            errors.endDate = t('endDateRequired');
        }

        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (endDate <= startDate) {
                errors.endDate = t('endDateAfterStartDate');
            }

            if (originalPromoCode.currentUsageCount === 0) {
                if (startDate < today) {
                    errors.startDate = t('startDateCannotBeInPast');
                }
            }

            const maxEndDate = new Date(startDate);
            maxEndDate.setFullYear(maxEndDate.getFullYear() + 2);
            if (endDate > maxEndDate) {
                errors.endDate = t('endDateCannotBeMoreThan2Years');
            }
        }

        if (!formData.maxUsageCount.trim()) {
            errors.maxUsageCount = t('maxUsageRequired');
        } else {
            const count = parseInt(formData.maxUsageCount);
            if (isNaN(count) || count <= 0) {
                errors.maxUsageCount = t('maximumUsageCountCannotExceed10000');
            } else if (count > 10000) {
                errors.maxUsageCount = t('maximumUsageCountCannotExceed10000');
            }
            if (originalPromoCode && count < originalPromoCode.currentUsageCount) {
                errors.maxUsageCount = t('currentUsageCannotReduceBelow', { count: originalPromoCode.currentUsageCount });
            }
        }

        if (formData.minimumOrderAmount.trim()) {
            const minAmount = parseFloat(formData.minimumOrderAmount);
            if (isNaN(minAmount) || minAmount <= 0) {
                errors.minimumOrderAmount = t('discountValueMustBePositive');
            } else if (minAmount > 100000) {
                errors.minimumOrderAmount = t('minimumOrderAmountCannotExceed100000');
            }
        }

        if (formData.maximumDiscountAmount.trim()) {
            const maxAmount = parseFloat(formData.maximumDiscountAmount);
            if (isNaN(maxAmount) || maxAmount <= 0) {
                errors.maximumDiscountAmount = t('discountValueMustBePositive');
            } else if (maxAmount > 10000) {
                errors.maximumDiscountAmount = t('maximumDiscountAmountCannotExceed10000');
            }

            if (originalPromoCode.type === 'FixedAmount') {
                const value = parseFloat(formData.value);
                if (!isNaN(value) && maxAmount > value) {
                    errors.maximumDiscountAmount = t('maximumDiscountCannotExceedValue');
                }
            }
        }

        if (formData.maxUsagePerUser.trim()) {
            const perUser = parseInt(formData.maxUsagePerUser);
            if (isNaN(perUser) || perUser <= 0) {
                errors.maxUsagePerUser = t('discountValueMustBePositive');
            } else if (perUser > 100) {
                errors.maxUsagePerUser = t('maxUsagePerUserCannotExceed100');
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!originalPromoCode || !validateForm()) {
            setError('Please fix the validation errors');
            return;
        }

        if (originalPromoCode.currentUsageCount > 0) {
            setError(t('cannotEditUsedPromoCode'));
            return;
        }

        try {
            setLoading(true);
            setError('');

            const updateData: UpdatePromoCodeDto = {};
            let hasChanges = false;

            if (formData.description !== (originalPromoCode.description || '')) {
                updateData.description = formData.description.trim() || undefined;
                hasChanges = true;
            }

            const newValue = parseFloat(formData.value);
            if (newValue !== originalPromoCode.value) {
                updateData.value = newValue;
                hasChanges = true;
            }

            const newMinAmount = formData.minimumOrderAmount.trim() ? parseFloat(formData.minimumOrderAmount) : undefined;
            if (newMinAmount !== originalPromoCode.minimumOrderAmount) {
                updateData.minimumOrderAmount = newMinAmount;
                hasChanges = true;
            }

            const newMaxAmount = formData.maximumDiscountAmount.trim() ? parseFloat(formData.maximumDiscountAmount) : undefined;
            if (newMaxAmount !== originalPromoCode.maximumDiscountAmount) {
                updateData.maximumDiscountAmount = newMaxAmount;
                hasChanges = true;
            }

            const newStartDate = formData.startDate;
            if (newStartDate !== originalPromoCode.startDate.split('T')[0]) {
                updateData.startDate = newStartDate;
                hasChanges = true;
            }

            const newEndDate = formData.endDate;
            if (newEndDate !== originalPromoCode.endDate.split('T')[0]) {
                updateData.endDate = newEndDate;
                hasChanges = true;
            }

            const newMaxUsage = parseInt(formData.maxUsageCount);
            if (newMaxUsage !== originalPromoCode.maxUsageCount) {
                updateData.maxUsageCount = newMaxUsage;
                hasChanges = true;
            }

            const newMaxPerUser = formData.maxUsagePerUser.trim() ? parseInt(formData.maxUsagePerUser) : undefined;
            if (newMaxPerUser !== originalPromoCode.maxUsagePerUser) {
                updateData.maxUsagePerUser = newMaxPerUser;
                hasChanges = true;
            }

            if (formData.isActive !== originalPromoCode.isActive) {
                updateData.isActive = formData.isActive;
                hasChanges = true;
            }

            if (!hasChanges) {
                setSuccess('No changes to save');
                setTimeout(() => {
                    router.push('/organizer/promo-codes');
                }, 1500);
                return;
            }

            await promoCodesApi.updatePromoCode(promoCodeId, updateData);
            setSuccess(t('promoCodeUpdatedSuccessfully'));

            setTimeout(() => {
                router.push('/organizer/promo-codes');
            }, 2000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('failedToUpdatePromoCode');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        if (field === 'endDate' && formData.startDate && typeof value === 'string') {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(value);
            if (endDate <= startDate) {
                setValidationErrors(prev => ({
                    ...prev,
                    endDate: t('endDateAfterStartDate')
                }));
            }
        }
    };

    const getDiscountPreview = () => {
        if (!originalPromoCode || !formData.value) return '';

        const value = parseFloat(formData.value);
        if (isNaN(value)) return '';

        if (originalPromoCode.type === 'Percentage') {
            return `${value}${t('percentageOff')}`;
        } else {
            const convertedValue = convertFromUSD(value, preferences?.currency || 'USD');
            return `${formatCurrencyWithUserPreference(convertedValue, preferences)} ${t('fixedAmountOff')}`;
        }
    };

    const getUsageStats = () => {
        if (!originalPromoCode) return null;

        const usagePercentage = originalPromoCode.maxUsageCount > 0
            ? (originalPromoCode.currentUsageCount / originalPromoCode.maxUsageCount) * 100
            : 0;

        return {
            current: originalPromoCode.currentUsageCount,
            max: originalPromoCode.maxUsageCount,
            remaining: originalPromoCode.remainingUsage,
            percentage: usagePercentage
        };
    };

    type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

    function isCurrency(value: unknown): value is Currency {
        return typeof value === 'string' &&
            ['USD', 'EUR', 'GBP', 'JPY'].includes(value);
    }

    const CURRENCIES = {
        USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
        EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
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

    if (initialLoading) {
        return (
            <div className={`min-h-screen ${themeClasses.themeBg} theme-transition`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

    if (!originalPromoCode) {
        return (
            <div className={`min-h-screen ${themeClasses.themeBg} theme-transition`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <AlertCircle className={`h-12 w-12 ${themeClasses.themeMutedFg} mx-auto mb-4`} />
                        <h3 className={`text-lg font-medium ${themeClasses.themeFg} mb-2`}>
                            Promo code not found
                        </h3>
                        <p className={`${themeClasses.themeMutedFg} mb-6`}>
                            The promo code you're looking for doesn't exist or you don't have permission to edit it.
                        </p>
                        <button
                            onClick={() => router.push('/organizer/promo-codes')}
                            className="btn-accent"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t('back')} to {t('promoCodes')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const usageStats = getUsageStats();
    const discountPreview = getDiscountPreview();

    return (
        <div className={`min-h-screen ${themeClasses.themeBg} theme-transition`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <button
                            onClick={() => router.push('/organizer/promo-codes')}
                            className={`p-2 rounded-lg ${themeClasses.hover} transition-colors`}
                        >
                            <ArrowLeft className={`h-5 w-5 ${themeClasses.themeMutedFg}`} />
                        </button>
                        <div className="flex-1">
                            <h1 className={`text-3xl font-bold ${themeClasses.themeFg}`}>{t('editPromoCode')}</h1>
                            <p className={`${themeClasses.themeMutedFg} mt-1`}>
                                {t('editing')}: <span className="font-mono font-semibold">{originalPromoCode.code}</span>
                                {discountPreview && (
                                    <span className="ml-2 text-green-600 dark:text-green-400">({discountPreview})</span>
                                )}
                            </p>
                        </div>

                        {/* Usage Stats Badge */}
                        {usageStats && (
                            <div className={`${themeClasses.themeCard} rounded-lg p-3 border ${themeClasses.themeBorder}`}>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    <div className="text-sm">
                                        <div className={`font-medium ${themeClasses.themeFg}`}>
                                            {usageStats.current} / {usageStats.max} used
                                        </div>
                                        <div className={`text-xs ${themeClasses.themeMutedFg}`}>
                                            {usageStats.remaining} {t('remaining')}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(usageStats.percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Usage Warning */}
                    {originalPromoCode.currentUsageCount > 0 && (
                        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    <strong>{t('warning')}:</strong> {t('promoCodeHasBeenUsedTimes', { count: originalPromoCode.currentUsageCount })}.
                                    {t('editingDisabledToPreserveIntegrity')}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Status Indicator */}
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${originalPromoCode.isActive ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            <span className={themeClasses.themeMutedFg}>
                                {originalPromoCode.isActive ? t('active') : t('inactive')}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className={themeClasses.themeMutedFg}>
                                {new Date(originalPromoCode.startDate).toLocaleDateString()} - {new Date(originalPromoCode.endDate).toLocaleDateString()}
                            </span>
                        </div>
                        {originalPromoCode.scope === 'EventSpecific' && originalPromoCode.eventTitle && (
                            <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span className={themeClasses.themeMutedFg}>{originalPromoCode.eventTitle}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Success/Error Messages */}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                        <h2 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                            <Tag className="h-5 w-5 mr-2 text-blue-500" />
                            {t('basicInformation')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Promo Code (Read-only) */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    {t('code')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={originalPromoCode.code}
                                        disabled
                                        className={`w-full px-3 py-2 ${themeClasses.themeMuted} ${themeClasses.themeMutedFg} border ${themeClasses.themeBorder} rounded-lg font-mono cursor-not-allowed`}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <Tag className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                    {t('codeCannotBeChangedAfterCreation')}
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    {t('description')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="20% off for new customers"
                                    disabled={originalPromoCode.currentUsageCount > 0}
                                    className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${originalPromoCode.currentUsageCount > 0 ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                />
                                <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                    {t('optionalDescriptionForInternalReference')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Discount Settings */}
                    <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                        <h2 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                            {t('discountSettings')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Discount Type (Read-only) */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    Discount Type
                                </label>
                                <div className={`flex items-center space-x-2 p-3 ${themeClasses.themeMuted} rounded-lg border ${themeClasses.themeBorder}`}>
                                    {originalPromoCode.type === 'Percentage' ? (
                                        <Percent className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <DollarSign className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className={themeClasses.themeFg}>{originalPromoCode.type}</span>
                                </div>
                                <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                    {t('typeCannotBeChangedAfterCreation')}
                                </p>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    {t('formattedValue')} * {originalPromoCode.type === 'Percentage' ? '(%)' : `(${preferences?.currency || 'USD'})`}
                                    {discountPreview && (
                                        <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-normal">
                                            Preview: {discountPreview}
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={originalPromoCode.type === 'Percentage' ? "100" : "10000"}
                                    value={formData.value}
                                    onChange={(e) => handleInputChange('value', e.target.value)}
                                    disabled={originalPromoCode.currentUsageCount > 0}
                                    className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.value ? 'border-red-500' : ''
                                        } ${originalPromoCode.currentUsageCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {validationErrors.value && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.value}</p>
                                )}
                            </div>
                        </div>

                        {/* Advanced Options Toggle */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className={`flex items-center space-x-2 text-sm ${themeClasses.themeMutedFg} hover:${themeClasses.themeFg} transition-colors`}
                            >
                                {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span>{showAdvanced ? t('hideAdvancedOptions') : t('showAdvancedOptions')}</span>
                            </button>

                            {/* Advanced Options */}
                            {showAdvanced && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Minimum Order Amount */}
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                            {t('minimumOrderAmount')} ({preferences?.currency || 'USD'})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100000"
                                            value={formData.minimumOrderAmount}
                                            onChange={(e) => handleInputChange('minimumOrderAmount', e.target.value)}
                                            placeholder="0.00"
                                            disabled={originalPromoCode.currentUsageCount > 0}
                                            className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.minimumOrderAmount ? 'border-red-500' : ''
                                                } ${originalPromoCode.currentUsageCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        {validationErrors.minimumOrderAmount && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.minimumOrderAmount}</p>
                                        )}
                                        <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                            {t('orderMustBeAtLeastThisAmount')}
                                            {preferences?.currency && preferences.currency !== 'USD' && formData.minimumOrderAmount && (
                                                <span className="block mt-1">
                                                    (≈ ${(parseFloat(formData.minimumOrderAmount) || 0).toFixed(2)} USD)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Maximum Discount Amount */}
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                            {t('maximumDiscountAmount')} ({preferences?.currency || 'USD'})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10000"
                                            value={formData.maximumDiscountAmount}
                                            onChange={(e) => handleInputChange('maximumDiscountAmount', e.target.value)}
                                            placeholder="0.00"
                                            disabled={originalPromoCode.currentUsageCount > 0}
                                            className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.maximumDiscountAmount ? 'border-red-500' : ''
                                                } ${originalPromoCode.currentUsageCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        {validationErrors.maximumDiscountAmount && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.maximumDiscountAmount}</p>
                                        )}
                                        <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                            {t('capMaximumDiscountAmountForPercentage')}
                                            {preferences?.currency && preferences.currency !== 'USD' && formData.maximumDiscountAmount && (
                                                <span className="block mt-1">
                                                    (≈ ${(parseFloat(formData.maximumDiscountAmount) || 0).toFixed(2)} USD)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scope Information (Read-only) */}
                    <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                        <h2 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                            <Globe className="h-5 w-5 mr-2 text-purple-500" />
                            {t('scopeSettings')}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    Promo Code Scope
                                </label>
                                <div className={`flex items-center space-x-2 p-3 ${themeClasses.themeMuted} rounded-lg border ${themeClasses.themeBorder}`}>
                                    {originalPromoCode.scope === 'EventSpecific' ? (
                                        <>
                                            <MapPin className="h-4 w-4 text-purple-500" />
                                            <span className={themeClasses.themeFg}>{t('eventSpecific')}</span>
                                            {originalPromoCode.eventTitle && (
                                                <span className={`${themeClasses.themeMutedFg} ml-2`}>({originalPromoCode.eventTitle})</span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-4 w-4 text-purple-500" />
                                            <span className={themeClasses.themeFg}>{t('organizerWide')}</span>
                                        </>
                                    )}
                                </div>
                                <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                    {t('scopeCannotBeChangedAfterCreation')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date and Usage Settings */}
                    <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                        <h2 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                            {t('usageSettings')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    {t('startDate')} *
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    disabled={originalPromoCode.currentUsageCount > 0}
                                    className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.startDate ? 'border-red-500' : ''
                                        } ${originalPromoCode.currentUsageCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {validationErrors.startDate && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.startDate}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    {t('endDate')} *
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.endDate ? 'border-red-500' : ''
                                        }`}
                                />
                                {validationErrors.endDate && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.endDate}</p>
                                )}
                            </div>

                            {/* Maximum Usage Count */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    {t('maxUsage')} *
                                </label>
                                <input
                                    type="number"
                                    min={originalPromoCode.currentUsageCount}
                                    max="10000"
                                    value={formData.maxUsageCount}
                                    onChange={(e) => handleInputChange('maxUsageCount', e.target.value)}
                                    className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.maxUsageCount ? 'border-red-500' : ''
                                        }`}
                                />
                                {originalPromoCode.currentUsageCount > 0 && (
                                    <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                        {t('currentUsageCannotReduceBelow', { count: originalPromoCode.currentUsageCount })}
                                    </p>
                                )}
                                {validationErrors.maxUsageCount && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.maxUsageCount}</p>
                                )}
                            </div>

                            {/* Maximum Usage Per User */}
                            <div>
                                <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-2`}>
                                    Maximum Usage Per User
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.maxUsagePerUser}
                                    onChange={(e) => handleInputChange('maxUsagePerUser', e.target.value)}
                                    placeholder="No limit"
                                    disabled={originalPromoCode.currentUsageCount > 0}
                                    className={`w-full px-3 py-2 ${themeClasses.themeCard} ${themeClasses.themeFg} ${themeClasses.themeBorder} border rounded-lg focus:ring-2 accent-focus focus:border-transparent theme-transition ${validationErrors.maxUsagePerUser ? 'border-red-500' : ''
                                        } ${originalPromoCode.currentUsageCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {validationErrors.maxUsagePerUser && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.maxUsagePerUser}</p>
                                )}
                                <p className={`mt-1 text-xs ${themeClasses.themeMutedFg}`}>
                                    {t('limitHowManyTimesEachUserCanUse')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Settings */}
                    <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                        <h2 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                            <Users className="h-5 w-5 mr-2 text-indigo-500" />
                            {t('status')} Settings
                        </h2>

                        <div className="space-y-4">
                            {/* Active Status Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.themeFg} mb-1`}>
                                        {t('active')} {t('status')}
                                    </label>
                                    <p className={`text-xs ${themeClasses.themeMutedFg}`}>
                                        {t('inactivePromoCodesCannotBeUsed')}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Status Warning */}
                            {!formData.isActive && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-center">
                                        <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            This promo code will be deactivated and cannot be used by customers.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Insights (if usage exists) */}
                    {originalPromoCode.currentUsageCount > 0 && (
                        <div className={`${themeClasses.themeCard} rounded-lg shadow-sm border ${themeClasses.themeBorder} p-6 theme-transition`}>
                            <h2 className={`text-lg font-semibold ${themeClasses.themeFg} mb-4 flex items-center`}>
                                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                                {t('performanceInsights')}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`p-4 ${themeClasses.themeMuted} rounded-lg`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm ${themeClasses.themeMutedFg}`}>{t('usageRate')}</p>
                                            <p className={`text-lg font-semibold ${themeClasses.themeFg}`}>
                                                {usageStats ? Math.round(usageStats.percentage) : 0}%
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 ${themeClasses.themeMuted} rounded-lg`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm ${themeClasses.themeMutedFg}`}>{t('timesUsed')}</p>
                                            <p className={`text-lg font-semibold ${themeClasses.themeFg}`}>
                                                {originalPromoCode.currentUsageCount}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 ${themeClasses.themeMuted} rounded-lg`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm ${themeClasses.themeMutedFg}`}>{t('remaining')}</p>
                                            <p className={`text-lg font-semibold ${themeClasses.themeFg}`}>
                                                {originalPromoCode.remainingUsage}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center">
                                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {t('promoCodeHasBeenUsedAndLocked')}.
                                        You can still view analytics and adjust the active status.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading || originalPromoCode.currentUsageCount > 0}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${loading || originalPromoCode.currentUsageCount > 0
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'btn-accent shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('updatingEvent')}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {t('saveChanges')}
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/organizer/promo-codes')}
                            className={`flex-1 sm:flex-none px-4 py-3 border ${themeClasses.themeBorder} ${themeClasses.themeMutedFg} rounded-lg hover:${themeClasses.themeMuted} transition-colors`}
                        >
                            {t('cancel')}
                        </button>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            {originalPromoCode.currentUsageCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => router.push(`/organizer/promo-codes/${promoCodeId}/analytics`)}
                                    className={`px-4 py-3 ${themeClasses.themeMuted} ${themeClasses.themeFg} rounded-lg hover:${themeClasses.hover} transition-colors border ${themeClasses.themeBorder}`}
                                    title={t('viewAnalytics')}
                                >
                                    <TrendingUp className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Validation Summary */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                                        Please fix the following errors:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
                                        {Object.entries(validationErrors).map(([field, message]) => (
                                            <li key={field}>{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className={`mt-6 p-4 ${themeClasses.themeMuted} rounded-lg border ${themeClasses.themeBorder}`}>
                        <div className="flex items-start">
                            <Info className={`h-5 w-5 ${themeClasses.themeMutedFg} mr-2 mt-0.5 flex-shrink-0`} />
                            <div className={`text-sm ${themeClasses.themeMutedFg}`}>
                                <p className="font-medium mb-2">{t('editingGuidelines')}:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium text-green-600 dark:text-green-400 mb-1">✓ Safe to {t('edit')}:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>{t('descriptionAndNotes')}</li>
                                            <li>{t('endDateExtendOnly')}</li>
                                            <li>{t('maxUsageIncreaseOnly')}</li>
                                            <li>{t('activeInactiveStatus')}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-medium text-red-600 dark:text-red-400 mb-1">✗ Cannot {t('edit')}:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>{t('promoCodeItself')}</li>
                                            <li>{t('discountTypeAndValue')}</li>
                                            <li>{t('scopeAndEventAssignment')}</li>
                                            <li>{t('anyFieldIfUsed')}</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs">
                                        <strong>Note:</strong> {t('changesEffectImmediately')}.
                                        Promo codes with existing usage are protected to maintain purchase history integrity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPromoCodePage;