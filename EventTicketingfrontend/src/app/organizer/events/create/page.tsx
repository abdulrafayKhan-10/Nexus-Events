/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/components/providers/I18nProvider'; // Add this import
import { Calendar, MapPin, Globe, Users, DollarSign, Plus, Trash2, Save, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';


interface Category {
    categoryId: number;
    name: string;
    description?: string;
}

interface Venue {
    venueId: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    description?: string;
}

interface TicketTypeFormData {
    name: string;
    price: number;
    quantity: number;
    description: string;
    isActive: boolean;
}

interface EventFormData {
    title: string;
    description: string;
    eventDate: string;
    endDate: string;
    location: string;
    isOnline: boolean;
    maxCapacity: string;
    categoryId: string;
    venueId: number | null;
    imageUrl: string;
    registrationDeadline: string;
    isPublished: boolean;
}

interface Event {
    eventDate: string | number | Date;
    revenue: number;
    actualRevenue?: number;
    eventId: number;
    title: string;
    description: string;
    shortDescription?: string;
    organizerId: number;
    organizerName: string;
    venueId: number;
    venueName: string;
    venueCity: string;
    categoryId: number;
    categoryName: string;
    startDateTime: string;
    endDateTime: string;
    imageUrl?: string;
    basePrice: number;
    currency: string;
    isOnline: boolean;
    ticketsSold: number;
    availableTickets: number;
    status: string;
    isPublished: boolean;
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

const CreateEventPage = () => {
    const router = useRouter();
    const { user, isOrganizer } = useAuth();
    const { t } = useI18n();
    const themeClasses = useThemeClasses();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userPreferences, setUserPreferences] = useState<any>(null);
    const [userCurrency, setUserCurrency] = useState<Currency>('USD');
    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        eventDate: '',
        endDate: '',
        location: '',
        isOnline: false,
        maxCapacity: '',
        categoryId: '',
        venueId: null,
        imageUrl: '',
        registrationDeadline: '',
        isPublished: false
    });

    const [ticketTypes, setTicketTypes] = useState<TicketTypeFormData[]>([
        {
            name: 'General Admission',
            price: 0,
            quantity: 100,
            description: '',
            isActive: true
        }
    ]);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user && isOrganizer) {
            fetchUserPreferences();
            fetchInitialData();
        } else if (user && !isOrganizer) {
            router.push('/');
        }
    }, [user, isOrganizer, router]);

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

    const fetchInitialData = async () => {
        try {
            const categoriesResponse = await fetch('http://localhost:5251/api/categories', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);
            } else {
                const mockCategories: Category[] = [
                    { categoryId: 1, name: t('technology'), description: 'Tech events' },
                    { categoryId: 2, name: t('business'), description: 'Business events' },
                    { categoryId: 3, name: t('music'), description: 'Music events' },
                    { categoryId: 4, name: t('sports'), description: 'Sports events' },
                    { categoryId: 5, name: t('education'), description: 'Educational events' }
                ];
                setCategories(mockCategories);
            }

            const venuesResponse = await fetch('http://localhost:5251/api/venues', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (venuesResponse.ok) {
                const venuesData = await venuesResponse.json();
                setVenues(venuesData);
            } else {
                const mockVenues: Venue[] = [
                    { venueId: 1, name: 'KLCC Convention Center', address: 'Kuala Lumpur City Centre', city: 'Kuala Lumpur', capacity: 1000 },
                    { venueId: 2, name: 'Sunway Convention Centre', address: 'Bandar Sunway', city: 'Petaling Jaya', capacity: 800 },
                    { venueId: 3, name: 'Mid Valley Exhibition Centre', address: 'Mid Valley City', city: 'Kuala Lumpur', capacity: 500 },
                    { venueId: 4, name: 'Penang International Convention Centre', address: 'Georgetown', city: 'Penang', capacity: 600 }
                ];
                setVenues(mockVenues);
            }

        } catch (error) {
            setError(t('loadError'));

            setCategories([
                { categoryId: 1, name: t('technology'), description: 'Tech events' },
                { categoryId: 2, name: t('business'), description: 'Business events' },
                { categoryId: 3, name: t('music'), description: 'Music events' },
                { categoryId: 4, name: t('sports'), description: 'Sports events' },
                { categoryId: 5, name: t('education'), description: 'Educational events' }
            ]);

            setVenues([
                { venueId: 1, name: 'KLCC Convention Center', address: 'Kuala Lumpur City Centre', city: 'Kuala Lumpur', capacity: 1000 },
                { venueId: 2, name: 'Sunway Convention Centre', address: 'Bandar Sunway', city: 'Petaling Jaya', capacity: 800 },
                { venueId: 3, name: 'Mid Valley Exhibition Centre', address: 'Mid Valley City', city: 'Kuala Lumpur', capacity: 500 }
            ]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when field is updated
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleTicketTypeChange = (index: number, field: keyof TicketTypeFormData, value: string | number | boolean) => {
        setTicketTypes(prev => prev.map((ticket, i) =>
            i === index ? { ...ticket, [field]: value } : ticket
        ));
    };

    const addTicketType = () => {
        setTicketTypes(prev => [...prev, {
            name: '',
            price: 0,
            quantity: 0,
            description: '',
            isActive: true
        }]);
    };

    const removeTicketType = (index: number) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(prev => prev.filter((_, i) => i !== index));
        }
    };

    const isMultiDayEvent = () => {
        if (!formData.eventDate || !formData.endDate) return false;

        const start = new Date(formData.eventDate);
        const end = new Date(formData.endDate);

        return start.toDateString() !== end.toDateString();
    };

    const getEventDuration = () => {
        if (!formData.eventDate || !formData.endDate) return null;

        const start = new Date(formData.eventDate);
        const end = new Date(formData.endDate);
        const diffInMs = end.getTime() - start.getTime();
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        return diffInDays > 0 ? diffInDays : null;
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = t('eventTitleRequired');
        }

        if (!formData.description.trim()) {
            errors.description = t('descriptionRequired');
        }

        if (!formData.eventDate) {
            errors.eventDate = t('startDateTimeRequired');
        }

        if (formData.endDate && formData.eventDate) {
            const start = new Date(formData.eventDate);
            const end = new Date(formData.endDate);

            if (end <= start) {
                errors.endDate = t('endDateAfterStart');
            }
        }

        if (!formData.categoryId) {
            errors.categoryId = t('categoryRequired');
        }

        if (!formData.isOnline && !formData.venueId) {
            errors.venueId = t('venueRequired');
        }

        if (!formData.maxCapacity || parseInt(formData.maxCapacity) <= 0) {
            errors.maxCapacity = t('maxCapacityRequired');
        }

        if (formData.registrationDeadline && formData.eventDate) {
            const regDeadline = new Date(formData.registrationDeadline);
            const eventStart = new Date(formData.eventDate);

            if (regDeadline >= eventStart) {
                errors.registrationDeadline = t('registrationDeadlineBeforeEvent');
            }
        }

        ticketTypes.forEach((ticket, index) => {
            if (!ticket.name.trim()) {
                errors[`ticketName_${index}`] = t('ticketTypeNameRequired');
            }
            if (ticket.quantity <= 0) {
                errors[`ticketQuantity_${index}`] = t('quantityGreaterThanZero');
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError(t('fixErrorsBelow'));
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Format dates properly for API
            const formatDateForApi = (dateString: string) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                return date.toISOString();
            };

            // Prepare event data
            const eventPayload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                shortDescription: null,
                startDateTime: formatDateForApi(formData.eventDate),
                endDateTime: formData.endDate ? formatDateForApi(formData.endDate) : null,
                categoryId: parseInt(formData.categoryId),
                venueId: formData.isOnline ? null : (formData.venueId ? parseInt(formData.venueId.toString()) : null),
                imageUrl: formData.imageUrl || null,
                bannerImageUrl: null,
                tags: null,
                maxAttendees: parseInt(formData.maxCapacity),
                basePrice: 0,
                currency: "USD",
                isOnline: formData.isOnline,
                onlineUrl: formData.isOnline ? formData.location : null,
                isPublished: formData.isPublished,
                registrationDeadline: formData.registrationDeadline ? formatDateForApi(formData.registrationDeadline) : null
            };

            const eventResponse = await fetch('http://localhost:5251/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(eventPayload)
            });

            if (!eventResponse.ok) {
                const errorData = await eventResponse.json();
                console.error('Event creation failed:', errorData);
                throw new Error(errorData.message || t('failedToCreateEvent'));
            }

            const createdEvent = await eventResponse.json();
            const ticketCreationResults = [];
            let failedTickets = 0;

            for (const [index, ticketType] of ticketTypes.entries()) {
                try {
                    const ticketPayload = {
                        eventId: createdEvent.eventId,
                        name: ticketType.name.trim(),
                        description: ticketType.description?.trim() || null,
                        price: Number(ticketType.price),
                        quantityAvailable: Number(ticketType.quantity),
                        saleStartDate: null,
                        saleEndDate: null,
                        minQuantityPerOrder: 1,
                        maxQuantityPerOrder: Math.min(10, Number(ticketType.quantity)),
                        sortOrder: index
                    };

                    if (!ticketPayload.name) {
                        throw new Error(`Ticket ${index + 1}: ${t('ticketTypeNameRequired')}`);
                    }
                    if (ticketPayload.price < 0) {
                        throw new Error(`Ticket ${index + 1}: ${t('priceRequired')}`);
                    }
                    if (ticketPayload.quantityAvailable <= 0) {
                        throw new Error(`Ticket ${index + 1}: ${t('quantityGreaterThanZero')}`);
                    }


                    const ticketResponse = await fetch('http://localhost:5251/api/tickets/ticket-types', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify(ticketPayload)
                    });


                    if (!ticketResponse.ok) {
                        const ticketErrorText = await ticketResponse.text();

                        let ticketError;
                        try {
                            ticketError = JSON.parse(ticketErrorText);
                        } catch {
                            ticketError = { message: ticketErrorText };
                        }

                        failedTickets++;


                    } else {
                        const createdTicketType = await ticketResponse.json();
                        console.log(`Ticket type ${index + 1} created successfully:`, createdTicketType);
                        ticketCreationResults.push(createdTicketType);
                    }
                } catch (ticketError) {
                    console.error(`Error creating ticket type ${index + 1}:`, ticketError);
                    failedTickets++;
                }
            }

            if (failedTickets === 0) {
                setSuccess(t('eventCreatedSuccessfully'));
            } else if (failedTickets < ticketTypes.length) {
                setSuccess(t('eventCreatedSuccessfully'));
            } else {
                setSuccess(t('eventCreatedSuccessfully'));
            }

            setTimeout(() => {
                router.push('/organizer/dashboard');
            }, 3000);

        } catch (error) {
            setError(error instanceof Error ? error.message : t('failedToCreateEvent'));
        } finally {
            setLoading(false);
        }
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

    const eventDuration = getEventDuration();

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"></div>
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-slate-400 hover:text-white transition-colors mb-4 group font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        {t('back')}
                    </button>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{t('createNewEvent')}</h1>
                    <p className="text-slate-400 text-lg">{t('fillEventDetails')}</p>

                    {/* Show event duration if multi-day */}
                    {eventDuration && eventDuration > 1 && (
                        <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                            <Clock className="h-4 w-4 mr-2" />
                            {t('dayEvent', { count: eventDuration })}
                        </div>
                    )}
                </div>

                <div className="glass-card rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-emerald-300 font-medium">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-300">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-10">
                        {/* Section: Basic Information */}
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-2">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mr-3 border border-purple-500/30">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">1</span>
                                    </span>
                                    {t('basicInformation')}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('eventTitle')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 ${formErrors.title ? 'border-red-500' : ''}`}
                                        placeholder={t('enterEventTitle')}
                                    />
                                    {formErrors.title && <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('eventDescription')} *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 ${formErrors.description ? 'border-red-500' : ''}`}
                                        placeholder={t('describeEventDetail')}
                                    />
                                    {formErrors.description && <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('category')} *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 ${formErrors.categoryId ? 'border-red-500' : ''}`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        <option value="" className="text-slate-500">{t('selectCategory')}</option>
                                        {categories.map(category => (
                                            <option key={category.categoryId} value={category.categoryId} className="bg-slate-900 text-white">
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.categoryId && <p className="text-red-400 text-sm mt-1">{formErrors.categoryId}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('maxCapacity')} *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxCapacity"
                                        value={formData.maxCapacity}
                                        onChange={handleInputChange}
                                        min="1"
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 ${formErrors.maxCapacity ? 'border-red-500' : ''}`}
                                        placeholder={t('maximumAttendees')}
                                    />
                                    {formErrors.maxCapacity && <p className="text-red-400 text-sm mt-1">{formErrors.maxCapacity}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('eventImageUrl')}
                                    </label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                        placeholder={t('enterImageUrl')}
                                    />
                                    {formData.imageUrl && (
                                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-700/50 h-48 relative block w-full bg-slate-800">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={formData.imageUrl} alt="Event Preview" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium pointer-events-none data-[loaded=true]:hidden">Image Preview</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section: Date & Time */}
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-2">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-3 border border-cyan-500/30">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">2</span>
                                    </span>
                                    {t('dateTime')}
                                </h2>
                            </div>

                            {/* Date Range Preview */}
                            {formData.eventDate && formData.endDate && isMultiDayEvent() && (
                                <div className="ml-11 mb-2 p-4 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 rounded-r-xl">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-blue-400 mr-3" />
                                        <span className="text-blue-300 font-medium tracking-wide">
                                            {t('multiDayEvent', { count: eventDuration })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('startDateTime')} *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 color-scheme-dark ${formErrors.eventDate ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.eventDate && <p className="text-red-400 text-sm mt-1">{formErrors.eventDate}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('endDateTime')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 color-scheme-dark ${formErrors.endDate ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.endDate && <p className="text-red-400 text-sm mt-1">{formErrors.endDate}</p>}
                                    <p className="text-xs text-slate-500 mt-2">
                                        {t('leaveEmptySingleSession')}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('registrationDeadline')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="registrationDeadline"
                                        value={formData.registrationDeadline}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 color-scheme-dark ${formErrors.registrationDeadline ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.registrationDeadline && <p className="text-red-400 text-sm mt-1">{formErrors.registrationDeadline}</p>}
                                    <p className="text-xs text-slate-500 mt-2">
                                        {t('whenRegistrationClose')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Location */}
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-2">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mr-3 border border-emerald-500/30">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">3</span>
                                    </span>
                                    {t('location')}
                                </h2>
                            </div>
                            <div className="space-y-6 pl-11">
                                <div className="flex items-center bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                                    <input
                                        type="checkbox"
                                        name="isOnline"
                                        checked={formData.isOnline}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 transition-colors"
                                    />
                                    <label className="ml-3 text-sm font-medium text-slate-300">
                                        {t('onlineEvent')} (Virtual Delivery)
                                    </label>
                                </div>

                                {!formData.isOnline && (
                                    <div className="animate-fade-in-up">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            {t('venue')} *
                                        </label>
                                        <select
                                            name="venueId"
                                            value={formData.venueId || ''}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 ${formErrors.venueId ? 'border-red-500' : ''}`}
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="" className="text-slate-500">{t('selectVenue')}</option>
                                            {venues.map(venue => (
                                                <option key={venue.venueId} value={venue.venueId} className="bg-slate-900 text-white">
                                                    {t('venueWithCapacity', { name: venue.name, city: venue.city, capacity: venue.capacity })}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.venueId && <p className="text-red-400 text-sm mt-1">{formErrors.venueId}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {t('locationDetails')}
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                                        placeholder={formData.isOnline ? t('meetingLinkPlatform') : t('additionalLocationInfo')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Ticket Types */}
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mr-3 border border-amber-500/30">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">4</span>
                                    </span>
                                    {t('ticketTypes')}
                                </h2>
                                <button
                                    type="button"
                                    onClick={addTicketType}
                                    className="flex items-center px-4 py-2 text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all duration-300"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    {t('addTicketType')}
                                </button>
                            </div>

                            <div className="space-y-4 pl-11">
                                {ticketTypes.map((ticket, index) => (
                                    <div key={index} className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl relative group hover:border-amber-500/30 transition-all duration-300 animate-fade-in-up">
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="text-lg font-bold text-slate-200 flex items-center">
                                                <span className="mr-2 text-amber-500">#</span> {t('ticketTypeName')} {index + 1}
                                            </h3>
                                            {ticketTypes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTicketType(index)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                    title="Remove Ticket Type"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    {t('ticketTypeName')} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={ticket.name}
                                                    onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                                                    className={`w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 ${formErrors[`ticketName_${index}`] ? 'border-red-500' : ''}`}
                                                    placeholder="e.g., VIP, General"
                                                />
                                                {formErrors[`ticketName_${index}`] && (
                                                    <p className="text-red-400 text-sm mt-1">{formErrors[`ticketName_${index}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    {t('price')} ({CURRENCIES[userCurrency as keyof typeof CURRENCIES]?.symbol || '$'}) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={ticket.price}
                                                    onChange={(e) => handleTicketTypeChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    {t('quantity')} *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={ticket.quantity}
                                                    onChange={(e) => handleTicketTypeChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    min="1"
                                                    className={`w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 ${formErrors[`ticketQuantity_${index}`] ? 'border-red-500' : ''}`}
                                                    placeholder="100"
                                                />
                                                {formErrors[`ticketQuantity_${index}`] && (
                                                    <p className="text-red-400 text-sm mt-1">{formErrors[`ticketQuantity_${index}`]}</p>
                                                )}
                                            </div>

                                            <div className="md:col-span-3">
                                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                                    {t('ticketDescription')}
                                                </label>
                                                <textarea
                                                    value={ticket.description}
                                                    onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                                                    placeholder={t('optionalTicketDescription')}
                                                />
                                            </div>

                                            <div className="md:col-span-3">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={ticket.isActive}
                                                        onChange={(e) => handleTicketTypeChange(index, 'isActive', e.target.checked)}
                                                        className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0 transition-colors"
                                                    />
                                                    <label className="ml-3 text-sm font-medium text-slate-300">
                                                        {t('ticketActive')}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section: Publishing Options */}
                        <div className="space-y-6">
                            <div className="border-b border-slate-800 pb-2">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center mr-3 border border-fuchsia-500/30">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">5</span>
                                    </span>
                                    {t('publishingOptions')}
                                </h2>
                            </div>
                            <div className="pl-11 bg-slate-900/30 p-5 rounded-2xl border border-slate-800 ml-11">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.isPublished}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-fuchsia-500 focus:ring-fuchsia-500/50 focus:ring-offset-0 transition-colors"
                                    />
                                    <label className="ml-3 text-base font-semibold text-white">
                                        {t('publishEventImmediately')}
                                    </label>
                                </div>
                                <p className="text-sm text-slate-400 mt-2 ml-8">
                                    {t('publishUnpublishLater')}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 mt-12 pt-8 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-300 border border-slate-700"
                                disabled={loading}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-8 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:from-purple-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        {t('creatingEvent')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        {t('createEvent')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx global>{`
                .color-scheme-dark {
                    color-scheme: dark;
                }
            `}</style>
        </div>
    );
};;

export default CreateEventPage;