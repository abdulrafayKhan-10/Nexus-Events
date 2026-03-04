/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { userApi } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import { DollarSign } from 'lucide-react';
import { useI18nContext } from '@/components/providers/I18nProvider';

interface Order {
    orderId: number;
    orderNumber: string;
    eventId: number;
    eventTitle: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    tickets: Array<{
        ticketId: number;
        ticketNumber: string;
        ticketTypeName: string;
        attendeeFirstName: string;
        attendeeLastName: string;
        attendeeEmail: string;
        qrCode: string;
    }>;
}

interface TicketData {
    ticketId: number;
    eventId: number;
    eventTitle: string;
    ticketTypeId: number;
    ticketTypeName: string;
    ticketNumber: string;
    qrCode: string;
    pricePaid: number;
    currency?: string;
    status: string;
    purchaseDate: string;
    checkInDate?: string;
    attendeeFirstName: string;
    attendeeLastName: string;
    attendeeEmail: string;
    eventStartDateTime: string;
    venueName: string;
    venueAddress: string;
}


interface Event {
    eventId: number;
    title: string;
    description: string;
    bannerImageUrl?: string;
    imageUrl?: string;
    startDateTime: string;
    endDateTime: string;
    venueName: string;
    venueCity: string;
    isOnline: boolean;
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

const getThemeClasses = (preferences: UserPreferences | null) => {
    const isDarkMode = preferences?.theme === 'dark' ||
        (preferences?.theme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const accentColor = preferences?.accentColor || 'blue';
    const fontSize = preferences?.fontSize || 'medium';
    const compactMode = preferences?.compactMode || false;

    // Accent color configurations
    const accentColors = {
        blue: {
            primary: 'bg-blue-600',
            hover: 'hover:bg-blue-700',
            light: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
            text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
            border: isDarkMode ? 'border-blue-700' : 'border-blue-200',
            ring: 'focus:ring-blue-500 focus:border-blue-500'
        },
        purple: {
            primary: 'bg-purple-600',
            hover: 'hover:bg-purple-700',
            light: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
            text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
            border: isDarkMode ? 'border-purple-700' : 'border-purple-200',
            ring: 'focus:ring-purple-500 focus:border-purple-500'
        },
        green: {
            primary: 'bg-green-600',
            hover: 'hover:bg-green-700',
            light: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
            text: isDarkMode ? 'text-green-400' : 'text-green-600',
            border: isDarkMode ? 'border-green-700' : 'border-green-200',
            ring: 'focus:ring-green-500 focus:border-green-500'
        },
        orange: {
            primary: 'bg-orange-600',
            hover: 'hover:bg-orange-700',
            light: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
            text: isDarkMode ? 'text-orange-400' : 'text-orange-600',
            border: isDarkMode ? 'border-orange-700' : 'border-orange-200',
            ring: 'focus:ring-orange-500 focus:border-orange-500'
        },
        pink: {
            primary: 'bg-pink-600',
            hover: 'hover:bg-pink-700',
            light: isDarkMode ? 'bg-pink-900/20' : 'bg-pink-50',
            text: isDarkMode ? 'text-pink-400' : 'text-pink-600',
            border: isDarkMode ? 'border-pink-700' : 'border-pink-200',
            ring: 'focus:ring-pink-500 focus:border-pink-500'
        }
    };

    const currentAccent = accentColors[accentColor as keyof typeof accentColors] || accentColors.blue;

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
        // Basic colors
        background: isDarkMode ? 'bg-gray-900' : 'bg-white',
        backgroundCard: isDarkMode ? 'bg-gray-800/95' : 'bg-white/95',
        backgroundOverlay: isDarkMode ? 'bg-black/60' : 'bg-black/40',

        // Text colors
        text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
        textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        textLight: isDarkMode ? 'text-gray-200' : 'text-white',

        // Borders
        border: isDarkMode ? 'border-gray-600' : 'border-gray-200',
        borderCard: isDarkMode ? 'border-gray-600/30' : 'border-gray-200',

        // Effects
        shadow: isDarkMode ? 'shadow-2xl shadow-black/50' : 'shadow-lg',
        hover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',

        // Typography & Layout
        fontSize: currentFont,

        // Padding/spacing based on compact mode
        padding: compactMode ? 'p-4' : 'p-6',
        paddingSmall: compactMode ? 'p-2' : 'p-4',
        paddingLarge: compactMode ? 'p-6' : 'py-12',

        // Margins
        margin: compactMode ? 'mb-4' : 'mb-6',
        marginSmall: compactMode ? 'mb-2' : 'mb-4',
        marginLarge: compactMode ? 'mb-6' : 'mb-8',

        // Spacing between elements
        spacing: compactMode ? 'space-y-2' : 'space-y-4',
        gap: compactMode ? 'gap-2' : 'gap-4',

        // Button sizes
        buttonPadding: compactMode ? 'px-4 py-2' : 'px-6 py-3',

        // Icon sizes
        iconSize: compactMode ? 'h-4 w-4' : 'h-5 w-5',
        iconSizeSmall: compactMode ? 'h-3 w-3' : 'h-4 w-4',
        iconSizeLarge: compactMode ? 'h-12 w-12' : 'h-16 w-16',

        // Accent colors
        accent: currentAccent.primary,
        accentHover: currentAccent.hover,
        accentText: currentAccent.text,
        accentLight: currentAccent.light,
        accentBorder: currentAccent.border,

        // State info
        isDarkMode,
        accentColor,
        fontSizeValue: fontSize,
        compactMode
    };
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

const formatCurrencyWithUserPreference = (amount: number, preferences: UserPreferences | null, currentLangData: any) => {
    const currency = preferences?.currency ?? 'USD';
    const locale = currentLangData?.region ?? 'en-US';

    try {
        // Use Intl.NumberFormat for proper currency formatting
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'JPY' ? 0 : 2,
            maximumFractionDigits: currency === 'JPY' ? 0 : 2
        });

        return formatter.format(amount);
    } catch (error) {
        // Fallback: Simple symbol mapping
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥'
        };

        const symbol = symbols[currency] || '$';

        // For JPY, don't show decimal places
        if (currency === 'JPY') {
            const wholeAmount = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return `${symbol}${wholeAmount}`;
        }

        // For other currencies, show 2 decimal places
        const formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${symbol}${formattedAmount}`;
    }
};

const convertAndFormatCurrency = (amount: number, fromCurrency: string, preferences: UserPreferences | null, currentLangData: any) => {
    // Ensure we always have a valid user currency
    const userCurrency = (preferences?.currency && ['USD', 'EUR', 'GBP', 'JPY'].includes(preferences.currency))
        ? preferences.currency
        : 'USD';

    // If currencies match, just format
    if (fromCurrency === userCurrency) {
        return formatCurrencyWithUserPreference(amount, {
            ...preferences,
            currency: userCurrency
        } as UserPreferences, currentLangData);
    }

    // Conversion rates for your 4 supported currencies (approximate rates)
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

    return formatCurrencyWithUserPreference(convertedAmount, {
        ...preferences,
        currency: userCurrency
    } as UserPreferences, currentLangData);
};

const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
        'USD': '$',  // US Dollar
        'EUR': '€',  // Euro
        'GBP': '£',  // British Pound
        'JPY': '¥'   // Japanese Yen
    };

    return symbols[currency] || '$';
};

const formatEventDateTime = (dateTimeString: string, preferences: UserPreferences | null, currentLangData: any, t: any) => {
    const eventDate = new Date(dateTimeString);
    const userTimeZone = preferences?.defaultTimeZone || 'UTC';
    const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';
    const timeFormat = preferences?.timeFormat || '12h';

    console.log('📅 Formatting date with preferences:', {
        dateFormat,
        timeFormat,
        userTimeZone,
        originalDate: dateTimeString
    });

    // Create date in user's timezone
    const zonedDate = new Date(eventDate.toLocaleString("en-US", { timeZone: userTimeZone }));

    // Extract date components
    const year = zonedDate.getFullYear();
    const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const day = String(zonedDate.getDate()).padStart(2, '0');

    // Month names for text formats
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthShort = monthNames[zonedDate.getMonth()];

    // Weekday names
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

    console.log('📅 Final formatted result:', result);
    return result;
};

const formatEventDateOnly = (dateTimeString: string, preferences: UserPreferences | null) => {
    const eventDate = new Date(dateTimeString);
    const userTimeZone = preferences?.defaultTimeZone || 'UTC';
    const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';

    const zonedDate = new Date(eventDate.toLocaleString("en-US", { timeZone: userTimeZone }));

    const year = zonedDate.getFullYear();
    const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const day = String(zonedDate.getDate()).padStart(2, '0');

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthShort = monthNames[zonedDate.getMonth()];

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = weekdays[zonedDate.getDay()];

    switch (dateFormat) {
        case 'dd/MM/yyyy':
            return `${weekday}, ${day}/${month}/${year}`;
        case 'yyyy-MM-dd':
            return `${weekday}, ${year}-${month}-${day}`;
        case 'MMM dd, yyyy':
            return `${weekday}, ${monthShort} ${parseInt(day)}, ${year}`;
        case 'dd MMM yyyy':
            return `${weekday}, ${parseInt(day)} ${monthShort} ${year}`;
        default: // MM/dd/yyyy
            return `${weekday}, ${month}/${day}/${year}`;
    }
};

const formatEventTimeOnly = (dateTimeString: string, preferences: UserPreferences | null) => {
    const eventDate = new Date(dateTimeString);
    const userTimeZone = preferences?.defaultTimeZone || 'UTC';
    const timeFormat = preferences?.timeFormat || '12h';

    const zonedDate = new Date(eventDate.toLocaleString("en-US", { timeZone: userTimeZone }));

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

    const timeZoneAbbr = getTimeZoneAbbreviation(userTimeZone);
    return `${formattedTime} ${timeZoneAbbr}`;
};

export default function OrderConfirmationPage() {
    const router = useRouter();
    const { t } = useI18nContext();
    const { formatCurrency, currentLangData } = useI18n();
    const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    const themeClasses = getThemeClasses(preferences);

    useEffect(() => {
        Promise.all([fetchOrder(), loadUserPreferences()]);
    }, [orderId]);

    useEffect(() => {
        if (order && order.eventId) {
            fetchEventDetails();
        }
    }, [order]);

    // Apply theme to document body
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

    const loadUserPreferences = async () => {
        try {
            const prefsData = await userApi.getPreferences();
            setPreferences({
                emailNotifications: prefsData.emailNotifications ?? true,
                sessionTimeout: prefsData.sessionTimeout ?? 30,
                theme: prefsData.theme ?? 'light',
                language: prefsData.language ?? 'en',
                dateFormat: prefsData.dateFormat ?? 'MM/dd/yyyy',
                timeFormat: prefsData.timeFormat ?? '12h',
                defaultTimeZone: prefsData.defaultTimeZone ?? 'UTC',
                accentColor: prefsData.accentColor ?? 'blue',
                fontSize: prefsData.fontSize ?? 'medium',
                compactMode: prefsData.compactMode ?? false,
                currency: (prefsData.currency && ['USD', 'EUR', 'GBP', 'JPY'].includes(prefsData.currency))
                    ? prefsData.currency as 'USD' | 'EUR' | 'GBP' | 'JPY'
                    : 'USD'  
            });
        } catch (error) {
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
                compactMode: false,
                currency: 'USD'  
            });
        }
    };

    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl || imageUrl === 'NULL' || imageUrl.trim() === '') return null;

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        if (imageUrl.startsWith('/')) {
            return `http://localhost:5251${imageUrl}`;
        }

        return `http://localhost:5251/${imageUrl}`;
    };

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5251/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrder(data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchEventDetails = async () => {
        if (!order) return;

        try {
            const response = await fetch(`http://localhost:5251/api/events/${order.eventId}`);
            if (response.ok) {
                const eventData = await response.json();
                setEvent(eventData);
            }
        } catch (error) {
        }
    };

    const formatDate = (dateString: string): string => {
        if (preferences) {
            return formatEventDateOnly(dateString, preferences);
        }
        // Fallback for when preferences aren't loaded yet
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    };

    const formatTime = (dateString: string): string => {
        if (preferences) {
            return formatEventTimeOnly(dateString, preferences);
        }
        // Fallback for when preferences aren't loaded yet
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading || !preferences) {
        return (
            <div className={`min-h-screen ${themeClasses?.background || 'bg-gray-50'} flex items-center justify-center`}>
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600`}></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="text-center">
                    <h1 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text}`}>{t('orderNotFound')}</h1>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative"
            style={{
                backgroundImage: event?.bannerImageUrl
                    ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${getImageUrl(event.bannerImageUrl)})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                transform: 'scaleX(-1)'
            }}
        >
            {/* Content */}
            <div className={`relative z-10 ${themeClasses.paddingLarge}`} style={{ transform: 'scaleX(-1)' }}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Success Header */}
                    <div className={`text-center ${themeClasses.marginLarge}`}>
                        <CheckCircle className={`${themeClasses.iconSizeLarge} text-green-500 mx-auto ${themeClasses.marginSmall} drop-shadow-lg`} />
                        <h1 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.textLight} ${themeClasses.marginSmall} drop-shadow-lg`}>
                            {t('purchaseSuccessful')}
                        </h1>
                        <p className={`${themeClasses.fontSize.heading} ${themeClasses.textLight} drop-shadow`}>
                            {t('ticketsConfirmedSentEmail')}
                        </p>
                    </div>

                    {/* Event Info Banner */}
                    {event && (
                        <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding} ${themeClasses.marginLarge}`}>
                            <h2 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('eventDetails')}</h2>
                            <div className="flex items-start space-x-4">
                                <div className="flex-1">
                                    <h3 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>{event.title}</h3>
                                    <div className={`${themeClasses.spacing} ${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>
                                        <div className="flex items-center">
                                            <Calendar className={`${themeClasses.iconSizeSmall} mr-2 ${themeClasses.accentText}`} />
                                            <span className={`${themeClasses.text} font-medium`}>
                                                {formatDate(event.startDateTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className={`${themeClasses.iconSizeSmall} mr-2 ${themeClasses.accentText}`} />
                                            <span className={`${themeClasses.text} font-medium`}>
                                                {formatTime(event.startDateTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className={`${themeClasses.iconSize} mr-2`} />
                                            <span>{event.isOnline ? t('onlineEvent') : `${event.venueName}, ${event.venueCity}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Details */}
                    <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding} ${themeClasses.marginLarge}`}>
                        <h2 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('orderDetails')}</h2>

                        <div className={`grid grid-cols-2 ${themeClasses.gap} ${themeClasses.marginSmall}`}>
                            <div>
                                <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>{t('orderNumber')}</p>
                                <p className={`font-semibold ${themeClasses.text} ${themeClasses.fontSize.text}`}>{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>{t('totalAmount')}</p>
                                <p className={`font-semibold ${themeClasses.text} ${themeClasses.fontSize.text}`}>
                                    {convertAndFormatCurrency(order.totalAmount, order.currency, preferences, currentLangData)}
                                </p>
                            </div>
                        </div>

                        <div className={`grid grid-cols-2 ${themeClasses.gap}`}>
                            <div>
                                <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>{t('orderDate')}</p>
                                <p className={`font-semibold ${themeClasses.text} ${themeClasses.fontSize.text}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>{t('status')}</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${themeClasses.fontSize.subtitle} font-medium bg-green-100 text-green-800`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tickets */}
                    <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding} ${themeClasses.marginLarge}`}>
                        <div className={`flex items-center justify-between ${themeClasses.marginSmall}`}>
                            <h2 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text}`}>{t('yourTickets')}</h2>
                            <span className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>{order.tickets.length} {t('ticketsCount')}</span>
                        </div>

                        <div className={themeClasses.spacing}>
                            {order.tickets.map((ticket, index) => (
                                <div key={ticket.ticketId} className={`border ${themeClasses.borderCard} rounded-lg ${themeClasses.paddingSmall} ${themeClasses.background} bg-opacity-50`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className={`flex items-center space-x-2 ${themeClasses.marginSmall}`}>
                                                <span className={`${themeClasses.accentLight} ${themeClasses.accentText} ${themeClasses.fontSize.subtitle} font-medium px-2.5 py-0.5 rounded-full`}>
                                                    {t('ticketNumber')} #{index + 1}
                                                </span>
                                                <span className={`${themeClasses.fontSize.text} font-medium ${themeClasses.text}`}>{ticket.ticketTypeName}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>
                                                    {ticket.attendeeFirstName} {ticket.attendeeLastName}
                                                </p>
                                                <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary}`}>{ticket.attendeeEmail}</p>
                                                <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted} font-mono`}>
                                                    {ticket.ticketNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-center ml-4">
                                            <div className={`${themeClasses.compactMode ? 'w-12 h-12' : 'w-16 h-16'} ${themeClasses.background} border-2 border-dashed ${themeClasses.border} rounded flex items-center justify-center ${themeClasses.marginSmall}`}>
                                                <span className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('qrCode')}</span>
                                            </div>
                                            <button className={`${themeClasses.fontSize.subtitle} ${themeClasses.accentText} ${themeClasses.accentHover} flex items-center`}>
                                                <Download className={`${themeClasses.iconSizeSmall} mr-1`} />
                                                {t('download')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Important Notice */}
                        <div className={`mt-6 ${themeClasses.paddingSmall} bg-yellow-50 border border-yellow-200 rounded-lg`}>
                            <h4 className={`${themeClasses.fontSize.text} font-medium text-yellow-800 mb-1`}>{t('importantNotice')}</h4>
                            <p className={`${themeClasses.fontSize.subtitle} text-yellow-700`}>
                                {t('bringTicketsAndId')}
                            </p>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className={`text-center ${themeClasses.spacing}`}>
                        <div className={`flex flex-col sm:flex-row ${themeClasses.gap} justify-center`}>
                            <Link
                                href="/mytickets"
                                className={`inline-flex items-center justify-center ${themeClasses.accent} bg-opacity-90 ${themeClasses.accentHover} text-white ${themeClasses.buttonPadding} rounded-lg font-semibold transition-colors backdrop-blur-sm ${themeClasses.shadow} ${themeClasses.fontSize.button}`}
                            >
                                <Ticket className={`${themeClasses.iconSize} mr-2`} />
                                {t('viewMyTickets')}
                            </Link>

                            <Link
                                href="/events"
                                className={`inline-flex items-center justify-center ${themeClasses.backgroundCard} ${themeClasses.hover} ${themeClasses.text} ${themeClasses.buttonPadding} rounded-lg font-semibold transition-colors backdrop-blur-sm border ${themeClasses.borderCard} ${themeClasses.shadow} ${themeClasses.fontSize.button}`}
                            >
                                {t('browseMoreEvents')}
                            </Link>
                        </div>

                        <p className={`${themeClasses.fontSize.text} ${themeClasses.textLight} drop-shadow`}>
                            {t('checkEmailForDetails')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}