/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';

import {
    Ticket,
    Plus,
    Search,
    QrCode,
    CheckCircle,
    AlertCircle,
    Users,
    DollarSign,
    ArrowLeft,
    Save,
    X,
    Eye,
    Calendar,
    MapPin,
    Filter,
    Download
} from 'lucide-react';
import { useI18n } from '../../../components/providers/I18nProvider';

// Interfaces
interface Event {
    eventId: number;
    title: string;
    date: string;
    venue: string;
}

interface TicketType {
    ticketTypeId: number;
    eventId: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    remainingQuantity: number;
    isActive: boolean;
    eventTitle?: string;
}

interface TicketValidation {
    isValid: boolean;
    ticket?: {
        ticketNumber: string;
        eventTitle: string;
        ticketTypeName: string;
        attendeeName: string;
        isUsed: boolean;
    };
    message: string;
}

interface UserTicket {
    ticketId: number;
    ticketNumber: string;
    eventTitle: string;
    ticketTypeName: string;
    attendeeName: string;
    purchaseDate: string;
    isUsed: boolean;
    eventDate: string;
}

interface CreateTicketTypeData {
    eventId: string;
    name: string;
    description: string;
    price: string;
    quantity: string;
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


const TicketsPage = () => {
    const router = useRouter();
    const { user, isOrganizer } = useAuth();
    const themeClasses = useThemeClasses();
    const { isDark } = useTheme();
    const { t } = useI18n();

    const [activeTab, setActiveTab] = useState<'types' | 'validate' | 'checkin'>('types');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Ticket Types State
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Validation State
    const [ticketNumber, setTicketNumber] = useState('');
    const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
    const [validating, setValidating] = useState(false);

    // Check-in State
    const [checkInNumber, setCheckInNumber] = useState('');
    const [checkInResult, setCheckInResult] = useState<any>(null);
    const [checkingIn, setCheckingIn] = useState(false);

    //Currency
    const [userPreferences, setUserPreferences] = useState<any>(null);
    const [userCurrency, setUserCurrency] = useState<Currency>('USD');

    const [formData, setFormData] = useState<CreateTicketTypeData>({
        eventId: '',
        name: '',
        description: '',
        price: '',
        quantity: ''
    });

    const convertAndFormatCurrency = (amount: number, fromCurrency: string, preferences: UserPreferences | null, currentLangData: any) => {
        const userCurrency = (preferences?.currency && ['USD', 'EUR', 'GBP', 'JPY'].includes(preferences.currency))
            ? preferences.currency
            : 'USD';


        if (fromCurrency === userCurrency) {
            return formatCurrencyWithUserPreference(amount, preferences, currentLangData);
        }

        const conversionRates: { [key: string]: { [key: string]: number } } = {
            'USD': {
                'USD': 1,
                'EUR': 0.92,  // 1 USD = 0.92 EUR
                'GBP': 0.79,  // 1 USD = 0.79 GBP
                'JPY': 149    // 1 USD = 149 JPY
            },
            'EUR': {
                'USD': 1.09,  // 1 EUR = 1.09 USD
                'EUR': 1,
                'GBP': 0.86,  // 1 EUR = 0.86 GBP
                'JPY': 162    // 1 EUR = 162 JPY
            },
            'GBP': {
                'USD': 1.27,  // 1 GBP = 1.27 USD
                'EUR': 1.16,  // 1 GBP = 1.16 EUR
                'GBP': 1,
                'JPY': 189    // 1 GBP = 189 JPY
            },
            'JPY': {
                'USD': 0.0067, // 1 JPY = 0.0067 USD
                'EUR': 0.0062, // 1 JPY = 0.0062 EUR
                'GBP': 0.0053, // 1 JPY = 0.0053 GBP
                'JPY': 1
            }
        };

        const rate = conversionRates[fromCurrency]?.[userCurrency] || 1;
        const convertedAmount = amount * rate;

        return formatCurrencyWithUserPreference(convertedAmount, preferences, currentLangData);
    };

    const formatCurrencyWithUserPreference = (amount: number, preferences: UserPreferences | null, currentLangData: any) => {
        const currency = preferences?.currency ?? 'USD';
        const locale = currentLangData?.region ?? 'en-US';

        try {
            const formatter = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: currency === 'JPY' ? 0 : 2,
                maximumFractionDigits: currency === 'JPY' ? 0 : 2
            });

            return formatter.format(amount);
        } catch (error) {
            const symbols: { [key: string]: string } = {
                'USD': '$',
                'EUR': '\u20AC', // Euro symbol
                'GBP': '\u00A3', // Pound symbol
                'JPY': '\u00A5'  // Yen symbol
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

    const getCurrencySymbol = (currency: string) => {
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '\u20AC', // Euro symbol
            'GBP': '\u00A3', // Pound symbol
            'JPY': '\u00A5'  // Yen symbol
        };

        return symbols[currency] || '$';
    };

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

    const convertToUSD = (amount: number, fromCurrency: string): number => {
        const rate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
        return amount / rate;
    };

    type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

    function isCurrency(value: unknown): value is Currency {
        return typeof value === 'string' &&
            ['USD', 'EUR', 'GBP', 'JPY'].includes(value);
    }

    const fetchUserPreferences = async () => {
        try {
            const response = await fetch(`http://localhost:5251/api/user/preferences`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const preferences = await response.json();
                setUserPreferences(preferences);

                // Use type guard for safe currency assignment
                const currency: Currency = isCurrency(preferences.currency)
                    ? preferences.currency
                    : 'USD';
                setUserCurrency(currency);
            } else {
                setUserCurrency('USD');
            }
        } catch (error) {
            console.error('Failed to fetch user preferences:', error);
            setUserCurrency('USD');
        }
    };

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Check authorization
    useEffect(() => {
        if (user && !isOrganizer) {
            router.push('/');
        }
    }, [user, isOrganizer, router]);

    // Fetch initial data
    useEffect(() => {
        if (user && isOrganizer) {
            fetchUserPreferences();
            fetchEvents();
        }
    }, [user, isOrganizer]);

    // Fetch ticket types after events are loaded
    useEffect(() => {
        if (events.length > 0) {
            fetchTicketTypes();
        }
    }, [events]);

    const fetchEvents = async () => {
        try {
            // Using the correct endpoint from EventsController
            const response = await fetch('http://localhost:5251/api/events/my-events', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(data.map((event: any) => ({
                    eventId: event.eventId,
                    title: event.title,
                    date: event.date || event.eventDate,
                    venue: event.venueName || event.venue || 'TBD'
                })));
            } else {
                setError(t('failedToFetchVenues'));
            }
        } catch (error) {
            setError(t('failedToFetchVenues'));
        }
    };

    const fetchTicketTypes = async () => {
        try {
            setLoading(true);
            const allTicketTypes: TicketType[] = [];

            for (const event of events) {
                try {
                    const response = await fetch(`http://localhost:5251/api/tickets/event/${event.eventId}/ticket-types`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });

                    if (response.ok) {
                        const eventTicketTypes = await response.json();
                        const typesWithEventInfo = eventTicketTypes.map((type: any) => ({
                            ...type,
                            eventTitle: event.title
                        }));
                        allTicketTypes.push(...typesWithEventInfo);
                    }
                } catch (error) {
                    console.error(`Error fetching ticket types for event ${event.eventId}:`, error);
                }
            }

            setTicketTypes(allTicketTypes);
        } catch (error) {
            setError(t('failedToCreateTicketType'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.eventId) errors.eventId = t('eventRequired');
        if (!formData.name.trim()) errors.name = t('ticketTypeNameRequired');
        if (!formData.price || parseFloat(formData.price) < 0) errors.price = t('priceRequired');
        if (!formData.quantity || parseInt(formData.quantity) <= 0) errors.quantity = t('quantityGreaterThanZero');

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            eventId: '',
            name: '',
            description: '',
            price: '',
            quantity: ''
        });
        setFormErrors({});
        setShowCreateForm(false);
    };

    const handleCreateTicketType = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setFormLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                eventId: parseInt(formData.eventId),
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity)
            };


            const response = await fetch('http://localhost:5251/api/tickets/ticket-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();

            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { message: responseText };
            }

            if (response.ok) {
                setSuccess(t('ticketTypeCreatedSuccessfully'));
                await fetchTicketTypes();
                resetForm();
                setTimeout(() => setSuccess(''), 3000);
            } else {

                if (response.status === 400) {
                    setError(`${t('error')}: ${errorData.message || t('invalidInput')}`);
                } else if (response.status === 401) {
                    setError(t('error'));
                } else if (response.status === 403) {
                    setError(t('error'));
                } else if (response.status === 404) {
                    setError(t('noEventsFound'));
                } else {
                    setError(errorData.message || t('failedToCreateTicketType'));
                }
            }
        } catch (error) {
            setError(t('loadError'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleValidateTicket = async () => {
        if (!ticketNumber.trim()) {
            setError(t('enterTicketNumber'));
            return;
        }

        setValidating(true);
        setError('');
        setValidationResult(null);

        try {
            const response = await fetch('http://localhost:5251/api/tickets/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(ticketNumber)
            });

            if (response.ok) {
                const data = await response.json();
                setValidationResult(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t('error'));
            }
        } catch (error) {
            console.error('Error validating ticket:', error);
            setError(t('error'));
        } finally {
            setValidating(false);
        }
    };

    const handleCheckInTicket = async () => {
        if (!checkInNumber.trim()) {
            setError(t('enterTicketNumber'));
            return;
        }

        setCheckingIn(true);
        setError('');
        setCheckInResult(null);

        try {
            const response = await fetch('http://localhost:5251/api/tickets/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ ticketNumber: checkInNumber })
            });

            if (response.ok) {
                const data = await response.json();
                setCheckInResult(data);
                setSuccess(t('ticketCheckedInSuccessfully'));
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t('error'));
            }
        } catch (error) {
            setError(t('error'));
        } finally {
            setCheckingIn(false);
        }
    };

    // Filter ticket types
    const filteredTicketTypes = ticketTypes.filter(ticketType => {
        const matchesSearch = ticketType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticketType.eventTitle && ticketType.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesEvent = !selectedEvent || ticketType.eventId.toString() === selectedEvent;
        return matchesSearch && matchesEvent;
    });

    const getInputStyles = (hasError = false) => {
        const baseStyles = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-opacity-60`;
        const themeStyles = isDark
            ? `${themeClasses.card} ${themeClasses.text} ${themeClasses.border} placeholder-gray-400`
            : `bg-white text-gray-900 border-gray-300 placeholder-gray-600`;
        const errorStyles = hasError ? 'border-red-500' : '';
        return `${baseStyles} ${themeStyles} ${errorStyles}`;
    };

    const getTabStyles = (isActive: boolean) => {
        if (isActive) {
            return 'border-blue-500 text-blue-600 dark:text-blue-400';
        }
        return `border-transparent ${themeClasses.textMuted} hover:${themeClasses.text} hover:border-gray-300 dark:hover:border-gray-600`;
    };

    if (!user || !isOrganizer) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className={`mt-4 ${themeClasses.textMuted}`}>{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.background}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`flex items-center ${themeClasses.textMuted} hover:${themeClasses.text} mb-4 transition-colors`}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('back')}
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className={`text-3xl font-bold ${themeClasses.text}`}>{t('ticketManagement')}</h1>
                            <p className={`${themeClasses.textMuted} mt-1`}>{t('manageTicketTypes')}</p>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">{t('importantTicketLimitations')}</h3>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <li>{t('cannotModifyPublished')}</li>
                        <li>{t('editingLockedAfterSales')}</li>
                        <li>{t('draftStatusForCreation')}</li>
                        <li>{t('createNewEventAlternative')}</li>
                    </ul>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                            <p className="text-green-700 dark:text-green-300">{success}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className={`border-b ${themeClasses.border}`}>
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('types')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${getTabStyles(activeTab === 'types')}`}
                            >
                                <Ticket className="h-4 w-4 inline mr-2" />
                                {t('ticketTypes')}
                            </button>
                            <button
                                onClick={() => setActiveTab('validate')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${getTabStyles(activeTab === 'validate')}`}
                            >
                                <QrCode className="h-4 w-4 inline mr-2" />
                                {t('validateTickets')}
                            </button>
                            <button
                                onClick={() => setActiveTab('checkin')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${getTabStyles(activeTab === 'checkin')}`}
                            >
                                <CheckCircle className="h-4 w-4 inline mr-2" />
                                {t('checkIn')}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Ticket Types Tab */}
                {activeTab === 'types' && (
                    <div className="space-y-6">
                        {/* Create Button & Filters */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('createTicketTypeAction')}
                                </button>
                                <div className={`text-sm ${themeClasses.textMuted}`}>
                                    <span className="font-medium">{t('required')}:</span> {t('onlyWorksForDraft')}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => router.push('/organizer/events/create')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                                >
                                    {t('createNewEventLink')}
                                </button>
                                <span className={themeClasses.textMuted}>|</span>
                                <button
                                    onClick={() => router.push('/organizer/events')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                                >
                                    {t('manageEventsLink')}
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className={`${themeClasses.card} rounded-lg shadow-sm border ${themeClasses.border} p-6`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className={`h-5 w-5 ${themeClasses.textMuted} absolute left-3 top-1/2 transform -translate-y-1/2`} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={t('searchEvents')}
                                        className={`w-full pl-10 pr-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.card} ${themeClasses.text} placeholder-opacity-60 ${isDark ? 'placeholder-gray-400' : 'placeholder-gray-600'}`}
                                    />
                                </div>
                                <div>
                                    <select
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                        className={`w-full px-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.card} ${themeClasses.text}`}
                                    >
                                        <option value="">{t('allEvents')}</option>
                                        {events.map(event => (
                                            <option key={event.eventId} value={event.eventId.toString()}>
                                                {event.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Types List */}
                        <div className={`${themeClasses.card} rounded-lg shadow-sm border ${themeClasses.border}`}>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className={`ml-2 ${themeClasses.textMuted}`}>{t('loadingTicketTypes')}</span>
                                </div>
                            ) : filteredTicketTypes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Ticket className={`h-12 w-12 ${themeClasses.textMuted} mx-auto mb-4`} />
                                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-2`}>{t('noTicketTypesFound')}</h3>
                                    <p className={themeClasses.textMuted}>
                                        {searchTerm || selectedEvent ? t('adjustFiltersOrCreate') : t('createFirstTicketTypePrompt')}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-b ${themeClasses.border}`}>
                                            <tr>
                                                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                                                    {t('ticketType')}
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                                                    {t('event')}
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                                                            {t('price')} ({CURRENCIES[userCurrency as keyof typeof CURRENCIES]?.symbol || '$'})
                                                            <span className="text-xs normal-case ml-1 opacity-75">
                                                                {userCurrency !== 'USD' && '(converted from USD)'}
                                                            </span>                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                                                    {t('availability')}
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textMuted} uppercase tracking-wider`}>
                                                    {t('status')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`${themeClasses.card} divide-y ${themeClasses.border}`}>
                                            {filteredTicketTypes.map((ticketType) => (
                                                <tr key={ticketType.ticketTypeId} className={themeClasses.hover}>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className={`text-sm font-medium ${themeClasses.text}`}>{ticketType.name}</div>
                                                            {ticketType.description && (
                                                                <div className={`text-sm ${themeClasses.textMuted} truncate max-w-xs`}>{ticketType.description}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`text-sm ${themeClasses.text}`}>{ticketType.eventTitle || t('noEventsFound')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center text-sm ${themeClasses.text}`}>
                                                            <DollarSign className={`h-4 w-4 ${themeClasses.textMuted} mr-1`} />
                                                            {formatCurrencyWithUserPreference(
                                                                convertFromUSD(ticketType.price, userCurrency),
                                                                { currency: userCurrency },
                                                                { region: 'en-US' }
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center text-sm ${themeClasses.text}`}>
                                                            <Users className={`h-4 w-4 ${themeClasses.textMuted} mr-1`} />
                                                            {ticketType.remainingQuantity} / {ticketType.quantity}
                                                        </div>
                                                        <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-1`}>
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${((ticketType.quantity - ticketType.remainingQuantity) / ticketType.quantity) * 100}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ticketType.isActive
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {ticketType.isActive ? t('active') : t('inactive')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Validate Tickets Tab */}
                {activeTab === 'validate' && (
                    <div className="space-y-6">
                        <div className={`${themeClasses.card} rounded-lg shadow-sm border ${themeClasses.border} p-6`}>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('validateTicket')}</h2>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                        placeholder={t('enterTicketNumber')}
                                        className={getInputStyles()}
                                    />
                                </div>
                                <button
                                    onClick={handleValidateTicket}
                                    disabled={validating}
                                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {validating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {t('validating')}
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="h-4 w-4 mr-2" />
                                            {t('validate')}
                                        </>
                                    )}
                                </button>
                            </div>

                            {validationResult && (
                                <div className={`mt-6 p-4 rounded-lg border ${validationResult.isValid
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                    }`}>
                                    <div className="flex items-center mb-2">
                                        {validationResult.isValid ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                        )}
                                        <h3 className={`font-medium ${validationResult.isValid
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-red-800 dark:text-red-200'
                                            }`}>
                                            {validationResult.isValid ? t('validTicket') : t('invalidTicket')}
                                        </h3>
                                    </div>

                                    {validationResult.ticket && (
                                        <div className={`space-y-2 text-sm ${validationResult.isValid
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                            }`}>
                                            <p><span className="font-medium">{t('ticketNumber')}:</span> {validationResult.ticket.ticketNumber}</p>
                                            <p><span className="font-medium">{t('event')}:</span> {validationResult.ticket.eventTitle}</p>
                                            <p><span className="font-medium">{t('ticketType')}:</span> {validationResult.ticket.ticketTypeName}</p>
                                            <p><span className="font-medium">{t('attendeeName')}:</span> {validationResult.ticket.attendeeName}</p>
                                            <p><span className="font-medium">{t('status')}:</span>
                                                <span className={`ml-1 ${validationResult.ticket.isUsed ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {validationResult.ticket.isUsed ? t('alreadyUsed') : t('notUsed')}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    <p className={`mt-2 text-sm ${validationResult.isValid
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-red-700 dark:text-red-300'
                                        }`}>
                                        {validationResult.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Check-in Tab */}
                {activeTab === 'checkin' && (
                    <div className="space-y-6">
                        <div className={`${themeClasses.card} rounded-lg shadow-sm border ${themeClasses.border} p-6`}>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('checkInTicket')}</h2>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={checkInNumber}
                                        onChange={(e) => setCheckInNumber(e.target.value)}
                                        placeholder={t('enterTicketNumberCheckIn')}
                                        className={getInputStyles()}
                                    />
                                </div>
                                <button
                                    onClick={handleCheckInTicket}
                                    disabled={checkingIn}
                                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {checkingIn ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {t('checkingIn')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {t('checkIn')}
                                        </>
                                    )}
                                </button>
                            </div>

                            {checkInResult && (
                                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <h3 className="font-medium text-green-800 dark:text-green-200">{t('ticketCheckedInSuccessfully')}</h3>
                                    </div>
                                    <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                                        <p><span className="font-medium">{t('ticketNumber')}:</span> {checkInResult.ticketNumber}</p>
                                        <p><span className="font-medium">{t('attendeeName')}:</span> {checkInResult.attendeeName}</p>
                                        <p><span className="font-medium">{t('event')}:</span> {checkInResult.eventTitle}</p>
                                        <p><span className="font-medium">{t('ticketType')}:</span> {checkInResult.ticketTypeName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Create Ticket Type Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${themeClasses.card} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>{t('createTicketType')}</h2>
                                    <button
                                        onClick={resetForm}
                                        className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors`}
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTicketType} className="space-y-4">
                                    {/* Business Rules Warning */}
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">{t('businessRulesWarning')}</h4>
                                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                                            <li>• {t('eventMustBeDraft')}</li>
                                            <li>• {t('noExistingTicketSales')}</li>
                                            <li>• {t('mustBeEventOrganizer')}</li>
                                            <li>• {t('editTicketsDuringCreation')}</li>
                                        </ul>
                                    </div>

                                    {/* Event Selection */}
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('event')} *
                                        </label>
                                        <select
                                            name="eventId"
                                            value={formData.eventId}
                                            onChange={handleInputChange}
                                            className={getInputStyles(!!formErrors.eventId)}
                                        >
                                            <option value="">{t('selectAnEvent')}</option>
                                            {events.map(event => (
                                                <option key={event.eventId} value={event.eventId.toString()}>
                                                    {event.title} (ID: {event.eventId})
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.eventId && <p className="text-red-500 text-sm mt-1">{formErrors.eventId}</p>}
                                        {events.length === 0 && (
                                            <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                                                {t('needCreateEventFirst')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Ticket Type Name */}
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('ticketTypeName')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={getInputStyles(!!formErrors.name)}
                                            placeholder="e.g., General Admission, VIP, Early Bird"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('description')}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className={getInputStyles()}
                                            placeholder={t('optionalTicketDescription')}
                                        />
                                    </div>

                                    {/* Price and Quantity */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                                {t('price')} *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                className={getInputStyles(!!formErrors.price)}
                                                placeholder="0.00"
                                            />
                                            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                                {t('quantity')} *
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                className={getInputStyles(!!formErrors.quantity)}
                                                placeholder={t('maximumAttendees')}
                                            />
                                            {formErrors.quantity && <p className="text-red-500 text-sm mt-1">{formErrors.quantity}</p>}
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className={`flex justify-end space-x-4 pt-6 border-t ${themeClasses.border}`}>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className={`px-6 py-2 border ${themeClasses.border} ${themeClasses.textMuted} rounded-lg ${themeClasses.hover} transition-colors`}
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {formLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {t('creatingEvent')}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {t('createTicketType')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketsPage;