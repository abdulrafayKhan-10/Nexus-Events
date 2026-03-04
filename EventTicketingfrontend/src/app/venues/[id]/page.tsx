/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TranslationKeys, useI18n } from '@/components/providers/I18nProvider';
import {
    Calendar,
    MapPin,
    Users,
    Globe,
    Phone,
    Mail,
    Star,
    Clock,
    Building,
    ArrowLeft,
    ExternalLink,
    Share,
    Heart,
    Camera,
    Navigation,
    Info,
    CheckCircle,
    XCircle,
    Award,
    Zap,
    Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { useI18nContext } from '@/components/providers/I18nProvider';

// Interfaces based on your database structure
interface Venue {
    venueId: number;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    capacity: number;
    imageUrl?: string;
    contactEmail: string;
    contactPhone: string;
    website?: string;
    isActive: boolean;
    eventCount: number;
}

interface VenueEvent {
    eventId: number;
    title: string;
    startDateTime: string;
    endDateTime: string;
    basePrice: number;
    imageUrl?: string;
    categoryName: string;
    organizerName: string;
    ticketsSold: number;
    availableTickets: number;
    isPublished: boolean;
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
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY'; 
}
const getThemeClasses = (preferences: AttendeePreferences | null) => {
    // Force Premium Dark Mode for consistency
    const isDarkMode = true;

    const accentColor = preferences?.accentColor || 'blue';
    const fontSize = preferences?.fontSize || 'medium';
    const compactMode = preferences?.compactMode || false;

    // Font size configurations - Updated with professional typography classes
    const fontSizes = {
        small: {
            text: 'text-body-small',
            heading: 'text-heading-3',
            title: 'text-heading-1',
            subtitle: 'text-caption',
            button: 'text-button',
            label: 'form-label',
            display: 'text-display',
            metric: 'text-lg'
        },
        medium: {
            text: 'text-body',
            heading: 'text-heading-2',
            title: 'text-display',
            subtitle: 'text-body-small',
            button: 'text-button',
            label: 'form-label',
            display: 'text-display-large',
            metric: 'text-metric'
        },
        large: {
            text: 'text-body-large',
            heading: 'text-heading-1',
            title: 'text-display-large',
            subtitle: 'text-body',
            button: 'text-button',
            label: 'form-label',
            display: 'text-display-large',
            metric: 'text-metric'
        }
    };

    const currentFont = fontSizes[fontSize as keyof typeof fontSizes] || fontSizes.medium;

    return {
        // Deep Space Premium Colors
        background: 'bg-[#0a0f1c]',
        backgroundCard: 'bg-[#0f172a] backdrop-blur-xl',
        backgroundHeader: 'bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-white/10',

        // Text colors
        text: 'text-gray-100',
        textSecondary: 'text-gray-400',
        textMuted: 'text-gray-500',
        textLight: 'text-white',

        // Borders
        border: 'border-white/10',
        borderCard: 'border-white/10',

        // Effects
        shadow: 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        hover: 'hover:bg-white/5',

        // Typography & Layout
        fontSize: currentFont,

        // Padding/spacing based on compact mode
        padding: compactMode ? 'p-4' : 'p-6',
        paddingSmall: compactMode ? 'p-2' : 'p-4',
        paddingLarge: compactMode ? 'p-6' : 'p-8',

        // Margins
        margin: compactMode ? 'mb-4' : 'mb-6',
        marginSmall: compactMode ? 'mb-2' : 'mb-4',
        marginLarge: compactMode ? 'mb-6' : 'mb-8',

        // Spacing between elements
        spacing: compactMode ? 'space-y-4' : 'space-y-6',
        gap: compactMode ? 'gap-4' : 'gap-6',

        // Button sizes
        buttonPadding: compactMode ? 'px-4 py-2' : 'px-6 py-3',

        // Icon sizes
        iconSize: compactMode ? 'h-4 w-4' : 'h-5 w-5',
        iconSizeSmall: compactMode ? 'h-3 w-3' : 'h-4 w-4',
        iconSizeLarge: compactMode ? 'h-12 w-12' : 'h-16 w-16',

        // Accent colors (Neon Cyan)
        accent: 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400',
        accentHover: 'hover:bg-cyan-500/30',
        accentText: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]',
        accentLight: 'bg-cyan-500/10',
        accentBorder: 'border-cyan-500/50',

        // State info
        isDarkMode,
        accentColor: 'neon',
        fontSizeValue: fontSize,
        compactMode
    };
};

export default function VenueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const venueId = params.id as string;
    const { formatDate: i18nFormatDate, formatTime: i18nFormatTime } = useI18nContext();
    const { t, currentLanguage, changeLanguage, availableLanguages } = useI18n();

    const [venue, setVenue] = useState<Venue | null>(null);
    const [events, setEvents] = useState<VenueEvent[]>([]);
    const [preferences, setPreferences] = useState<AttendeePreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'location'>('overview');

    const themeClasses = getThemeClasses(preferences);

    const getCurrencySymbol = (currency: string) => {
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥'
        };
        return symbols[currency] || '$';
    };

    const formatPrice = (price: number, preferences: AttendeePreferences | null) => {
        const currency = preferences?.currency || 'USD';
        const symbol = getCurrencySymbol(currency);

        const conversionRates: { [key: string]: number } = {
            'USD': 1,
            'EUR': 0.92,  
            'GBP': 0.79,  
            'JPY': 149    
        };

        const convertedPrice = price * (conversionRates[currency] || 1);

        if (currency === 'JPY') {
            return `${symbol}${Math.round(convertedPrice).toLocaleString()}`;
        }

        return `${symbol}${convertedPrice.toFixed(2)}`;
    };

    const formatAccountCreationDate = (
        dateString: string,
        preferences: AttendeePreferences | null,
        includeTime = false
    ): string => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const userTimeZone = preferences?.defaultTimeZone || 'UTC';
        const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';
        const timeFormat = preferences?.timeFormat || '12h';

        const zonedDate = new Date(date.toLocaleString("en-US", { timeZone: userTimeZone }));

        const year = zonedDate.getFullYear();
        const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
        const day = String(zonedDate.getDate()).padStart(2, '0');

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const monthFull = monthNames[zonedDate.getMonth()];
        const monthAbbr = monthShort[zonedDate.getMonth()];

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let formattedDate: string;
        switch (dateFormat) {
            case 'dd/MM/yyyy':
                formattedDate = `${day}/${month}/${year}`;
                break;
            case 'yyyy-MM-dd':
                formattedDate = `${year}-${month}-${day}`;
                break;
            case 'MMM dd, yyyy':
                formattedDate = `${monthAbbr} ${parseInt(day)}, ${year}`;
                break;
            case 'dd MMM yyyy':
                formattedDate = `${parseInt(day)} ${monthAbbr} ${year}`;
                break;
            case 'MMMM dd, yyyy':
                formattedDate = `${monthFull} ${parseInt(day)}, ${year}`;
                break;
            case 'dd MMMM yyyy':
                formattedDate = `${parseInt(day)} ${monthFull} ${year}`;
                break;
            case 'EEE, MMM dd, yyyy':
                formattedDate = `${weekdaysShort[zonedDate.getDay()]}, ${monthAbbr} ${parseInt(day)}, ${year}`;
                break;
            case 'EEEE, MMMM dd, yyyy':
                formattedDate = `${weekdays[zonedDate.getDay()]}, ${monthFull} ${parseInt(day)}, ${year}`;
                break;
            default: // MM/dd/yyyy
                formattedDate = `${month}/${day}/${year}`;
        }

        return formattedDate;
    };

    useEffect(() => {
        Promise.all([loadUserPreferences()]);
        if (venueId) {
            fetchVenueDetails();
            fetchVenueEvents();
        }
    }, [venueId]);

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
                emailNotifications: prefsData.emailNotifications || true,
                sessionTimeout: prefsData.sessionTimeout || 30,
                theme: prefsData.theme || 'light',
                language: prefsData.language || 'en',
                dateFormat: prefsData.dateFormat || 'MM/dd/yyyy',
                timeFormat: prefsData.timeFormat || '12h',
                defaultTimeZone: prefsData.defaultTimeZone || 'UTC',
                accentColor: prefsData.accentColor || 'blue',
                fontSize: prefsData.fontSize || 'medium',
                compactMode: prefsData.compactMode || false,
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

    const fetchVenueDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5251/api/venues/${venueId}`);
            if (response.ok) {
                const data = await response.json();
                setVenue(data);
            } else {
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchVenueEvents = async () => {
        try {
            const response = await fetch(`http://localhost:5251/api/venues/${venueId}/events`);
            if (response.ok) {
                const venueEvents = await response.json();
                setEvents(venueEvents);
            }
        } catch (error) {
        }
    };

    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl) return null;

        let finalUrl: string;

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            finalUrl = imageUrl;
            return finalUrl;
        }

        if (imageUrl.startsWith('/')) {
            finalUrl = `http://localhost:5251${imageUrl}`;
            return finalUrl;
        }

        finalUrl = `http://localhost:5251/${imageUrl}`;
        return finalUrl;
    };

    const formatDate = (dateString: string) => {
        if (preferences) {
            return formatAccountCreationDate(dateString, preferences, false);
        }
        const date = new Date(dateString);
        return i18nFormatDate(date);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const format = preferences?.timeFormat || '12h';
        return i18nFormatTime(date, format as '12h' | '24h');
    };

    const shareVenue = async () => {
        if (navigator.share && venue) {
            try {
                await navigator.share({
                    title: venue.name,
                    text: venue.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else if (venue) {
            navigator.clipboard.writeText(window.location.href);
            alert(t('copySuccess'));
        }
    };



    const openMap = () => {
        if (venue?.latitude && venue?.longitude) {
            window.open(`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`, '_blank');
        } else {
            const address = `${venue?.address}, ${venue?.city}, ${venue?.state} ${venue?.zipCode}`;
            window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
        }
    };

    if (loading || !preferences) {
        return (
            <div className={`min-h-screen ${themeClasses?.background || 'bg-gray-50'} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                    <p className={`${themeClasses?.fontSize?.text || 'text-xl'} ${themeClasses?.textSecondary || 'text-gray-600'}`}>
                        {t('loadingVenues')}
                    </p>
                </div>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="text-center">
                    <Building className={`h-16 w-16 ${themeClasses.textMuted} mx-auto mb-4`} />
                    <h1 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text} mb-2`}>
                        {t('eventNotFound')}
                    </h1>
                    <p className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary} mb-6`}>
                        {t('noVenuesFound')}
                    </p>
                    <Link
                        href="/"
                        className={`${themeClasses.accent} ${themeClasses.accentHover} text-white ${themeClasses.buttonPadding} rounded-lg transition-colors ${themeClasses.fontSize.button}`}
                    >
                        {t('backToEvents')}
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = getImageUrl(venue.imageUrl);
    const upcomingEvents = events.filter(event => new Date(event.startDateTime) > new Date());
    const pastEvents = events.filter(event => new Date(event.startDateTime) <= new Date());

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-purple-500/30 selection:text-purple-300 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>

            <div className="relative z-10 w-full min-h-screen">
                {/* Removed Header */}

                <div className="relative pt-20">
                    <div className="relative h-96 bg-gradient-to-r from-purple-400 to-pink-500">
                        {imageUrl && !imageError ? (
                            <img
                                src={imageUrl}
                                alt={venue.name}
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                loading="lazy"
                                onLoad={(e) => {
                                    console.log('IMAGE LOADED SUCCESSFULLY:', e.currentTarget.src);
                                }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.error('IMAGE LOAD FAILED:', target.src);
                                    target.style.display = 'none';
                                    setImageError(true);
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                                <Building className="h-24 w-24 text-white opacity-50" />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-20"></div>
                    </div>

                    {/* Venue Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-30">
                        <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between">
                            <div className="text-white">
                                <h1 className={`${themeClasses.fontSize.display} font-bold mb-2 drop-shadow-lg`}>{venue.name}</h1>
                                <div className={`flex items-center space-x-4 ${themeClasses.fontSize.heading}`}>
                                    <div className="flex items-center">
                                        <MapPin className={`${themeClasses.iconSize} mr-1`} />
                                        {venue.city}, {venue.state}
                                    </div>
                                    <div className="flex items-center">
                                        <Users className={`${themeClasses.iconSize} mr-1`} />
                                        {venue.capacity.toLocaleString()} {t('capacity')}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className={`${themeClasses.iconSize} mr-1`} />
                                        {t('eventsHosted', { count: venue.eventCount })}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="hidden md:flex space-x-6">
                                <div className="text-center text-white">
                                    <div className={`${themeClasses.fontSize.metric} font-bold drop-shadow-lg`}>{upcomingEvents.length}</div>
                                    <div className={`${themeClasses.fontSize.subtitle} opacity-80`}>{t('upcomingEvents')}</div>
                                </div>
                                <div className="text-center text-white">
                                    <div className={`${themeClasses.fontSize.metric} font-bold drop-shadow-lg`}>{venue.eventCount}</div>
                                    <div className={`${themeClasses.fontSize.subtitle} opacity-80`}>{t('totalEvents')}</div>
                                </div>
                                <div className="text-center text-white">
                                    <div className={`${themeClasses.fontSize.metric} font-bold drop-shadow-lg`}>
                                        {(venue.capacity / 1000).toFixed(0)}K
                                    </div>
                                    <div className={`${themeClasses.fontSize.subtitle} opacity-80`}>{t('capacity')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`${themeClasses.backgroundHeader} border-b ${themeClasses.border}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium ${themeClasses.fontSize.label} ${activeTab === 'overview'
                                ? `${themeClasses.accentBorder} ${themeClasses.accentText}`
                                : `border-transparent ${themeClasses.textMuted} hover:${themeClasses.textSecondary}`
                                }`}
                        >
                            {t('overview')}
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`py-4 px-1 border-b-2 font-medium ${themeClasses.fontSize.label} ${activeTab === 'events'
                                ? `${themeClasses.accentBorder} ${themeClasses.accentText}`
                                : `border-transparent ${themeClasses.textMuted} hover:${themeClasses.textSecondary}`
                                }`}
                        >
                            {t('events')} ({upcomingEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('location')}
                            className={`py-4 px-1 border-b-2 font-medium ${themeClasses.fontSize.label} ${activeTab === 'location'
                                ? `${themeClasses.accentBorder} ${themeClasses.accentText}`
                                : `border-transparent ${themeClasses.textMuted} hover:${themeClasses.textSecondary}`
                                }`}
                        >
                            {t('location')} & {t('contactUs')}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className={`max-w-7xl mx-auto px-6 lg:px-8 ${themeClasses.paddingLarge}`}>
                {activeTab === 'overview' && (
                    <div className={`grid grid-cols-1 lg:grid-cols-3 ${themeClasses.gap}`}>
                        {/* Main Content */}
                        <div className={`lg:col-span-2 ${themeClasses.spacing}`}>
                            {/* Description */}
                            <div className={`${themeClasses.backgroundCard} rounded-xl ${themeClasses.shadow} ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                                <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                    About This Venue
                                </h2>
                                <p className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary} leading-relaxed`}>{venue.description}</p>
                            </div>

                            {/* Enhanced Venue Features */}
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-xl ${themeClasses.shadow} ${themeClasses.padding} border ${themeClasses.borderCard} overflow-hidden relative`}>
                                {/* Background Pattern */}
                                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                                    <Building className="w-full h-full text-gray-400" />
                                </div>

                                <div className="relative z-10">
                                    <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ${themeClasses.marginSmall} flex items-center`}>
                                        <Star className={`${themeClasses.iconSize} ${themeClasses.accentText} mr-3`} />
                                        {t('venueCapacity')}
                                    </h2>

                                    <div className={`grid grid-cols-1 md:grid-cols-2 ${themeClasses.gap}`}>
                                        {/* Capacity Card */}
                                        <div className={`group relative overflow-hidden rounded-xl border-2 ${themeClasses.accentBorder} ${themeClasses.accentLight} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                                                <Users className="w-full h-full text-current" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Users className={`h-10 w-10 ${themeClasses.accentText} group-hover:scale-110 transition-transform duration-300`} />
                                                    <span className={`px-2 py-1 ${themeClasses.accentText} bg-white/50 rounded-full text-xs font-bold`}>
                                                        MAX
                                                    </span>
                                                </div>
                                                <div className={`font-bold ${themeClasses.text} text-xl mb-1`}>
                                                    {venue.capacity.toLocaleString()}
                                                </div>
                                                <div className={`${themeClasses.fontSize.text} ${themeClasses.accentText} font-medium`}>
                                                    {t('maximumCapacity')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} mt-2`}>
                                                    {venue.capacity > 10000 ? t('large') : venue.capacity > 5000 ? t('medium') : t('small')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Card */}
                                        <div className={`group relative overflow-hidden rounded-xl border-2 ${venue.isActive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                                                <CheckCircle className="w-full h-full text-current" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    {venue.isActive ? (
                                                        <CheckCircle className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                                                    ) : (
                                                        <XCircle className="h-10 w-10 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                                                    )}
                                                    <span className={`px-2 py-1 ${venue.isActive ? 'text-green-700 bg-green-200' : 'text-red-700 bg-red-200'} rounded-full text-xs font-bold`}>
                                                        {venue.isActive ? 'LIVE' : 'OFF'}
                                                    </span>
                                                </div>
                                                <div className={`font-bold ${themeClasses.text} text-xl mb-1`}>
                                                    {venue.isActive ? t('active') : t('inactive')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.text} ${venue.isActive ? 'text-green-700' : 'text-red-700'} font-medium`}>
                                                    {t('venueStatus')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} mt-2`}>
                                                    {venue.isActive ? t('available') : t('notAvailable')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Experience Card */}
                                        <div className={`group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-purple-50 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                                                <Award className="w-full h-full text-current" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Award className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                                                    <span className="px-2 py-1 text-purple-700 bg-purple-200 rounded-full text-xs font-bold">
                                                        {venue.eventCount > 50 ? 'PRO' : venue.eventCount > 10 ? 'EXP' : 'NEW'}
                                                    </span>
                                                </div>
                                                <div className={`font-bold ${themeClasses.text} text-xl mb-1`}>
                                                    {venue.eventCount}
                                                </div>
                                                <div className={`${themeClasses.fontSize.text} text-purple-700 font-medium`}>
                                                    {t('eventsHosted')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} mt-2`}>
                                                    {venue.eventCount > 50 ? t('popular') :
                                                        venue.eventCount > 10 ? t('featured') :
                                                            t('soon')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating/Reputation Card */}
                                        <div className={`group relative overflow-hidden rounded-xl border-2 border-orange-200 bg-orange-50 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                                                <Zap className="w-full h-full text-current" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Zap className="h-10 w-10 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                                                    <div className="flex">
                                                        {[...Array(venue.eventCount > 20 ? 5 : venue.eventCount > 10 ? 4 : 3)].map((_, i) => (
                                                            <Star key={i} className="h-3 w-3 text-orange-400 fill-current" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className={`font-bold ${themeClasses.text} text-xl mb-1`}>
                                                    {venue.eventCount > 20 ? t('popular') : venue.eventCount > 10 ? t('featured') : t('hot')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.text} text-orange-700 font-medium`}>
                                                    {t('venueStatus')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} mt-2`}>
                                                    {venue.eventCount > 20 ? t('topEventLocations') :
                                                        venue.eventCount > 10 ? t('featured') :
                                                            t('hot')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Venue Stats */}
                                    <div className={`mt-6 p-4 rounded-lg ${themeClasses.backgroundCard} border ${themeClasses.border}`}>
                                        <h3 className={`${themeClasses.fontSize.label} font-semibold ${themeClasses.text} mb-3`}>
                                            {t('quickLinks')}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.accentText}`}>
                                                    {Math.round(venue.capacity / 1000)}K
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('capacity')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.accentText}`}>
                                                    {venue.eventCount}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('events')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.accentText}`}>
                                                    {venue.city}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('location')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`${themeClasses.fontSize.heading} font-bold ${venue.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {venue.isActive ? t('active') : t('inactive')}
                                                </div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('status')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className={themeClasses.spacing}>
                            {/* Contact Card */}
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                                <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                    {t('contactUs')}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Mail className={`${themeClasses.iconSize} ${themeClasses.textMuted} mr-3`} />
                                        <a
                                            href={`mailto:${venue.contactEmail}`}
                                            className={`${themeClasses.accentText} ${themeClasses.accentHover} ${themeClasses.fontSize.text}`}
                                        >
                                            {venue.contactEmail}
                                        </a>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className={`${themeClasses.iconSize} ${themeClasses.textMuted} mr-3`} />
                                        <a
                                            href={`tel:${venue.contactPhone}`}
                                            className={`${themeClasses.accentText} ${themeClasses.accentHover} ${themeClasses.fontSize.text}`}
                                        >
                                            {venue.contactPhone}
                                        </a>
                                    </div>
                                    {venue.website && (
                                        <div className="flex items-center">
                                            <Globe className={`${themeClasses.iconSize} ${themeClasses.textMuted} mr-3`} />
                                            <a
                                                href={venue.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${themeClasses.accentText} ${themeClasses.accentHover} flex items-center ${themeClasses.fontSize.text}`}
                                            >
                                                {t('visitWebsite')}
                                                <ExternalLink className={`${themeClasses.iconSizeSmall} ml-1`} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                                <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                    {t('location')}
                                </h3>
                                <div className={`space-y-2 ${themeClasses.marginSmall}`}>
                                    <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>{venue.address}</div>
                                    <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>
                                        {venue.city}, {venue.state} {venue.zipCode}
                                    </div>
                                    <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>{venue.country}</div>
                                </div>
                                <button
                                    onClick={openMap}
                                    className={`w-full ${themeClasses.accent} ${themeClasses.accentHover} text-white ${themeClasses.buttonPadding} rounded-lg flex items-center justify-center transition-colors ${themeClasses.fontSize.button}`}
                                >
                                    <Navigation className={`${themeClasses.iconSizeSmall} mr-2`} />
                                    View on Map
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className={themeClasses.spacing}>
                        {/* Events Summary */}
                        <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-xl ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                            <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                {t('events')} {t('at')} {venue.name}
                            </h2>
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${themeClasses.gap}`}>
                                <div className={`text-center ${themeClasses.paddingSmall} ${themeClasses.accentLight} rounded-lg`}>
                                    <div className={`${themeClasses.fontSize.metric} font-bold ${themeClasses.accentText}`}>{upcomingEvents.length}</div>
                                    <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>{t('upcomingEvents')}</div>
                                </div>
                                <div className={`text-center ${themeClasses.paddingSmall} bg-green-50 rounded-lg`}>
                                    <div className={`${themeClasses.fontSize.metric} font-bold text-green-600`}>{pastEvents.length}</div>
                                    <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>{t('pastEvents')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        {upcomingEvents.length > 0 ? (
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-xl ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                                <div className={`flex items-center justify-between ${themeClasses.marginLarge}`}>
                                    <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text}`}>
                                        {t('upcomingEvents')} ({upcomingEvents.length})
                                    </h2>
                                    <span className={`px-3 py-1 bg-green-100 text-green-800 ${themeClasses.fontSize.subtitle} font-medium rounded-full`}>
                                        {t('ticketsavailable')}
                                    </span>
                                </div>
                                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${themeClasses.gap}`}>
                                    {upcomingEvents
                                        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
                                        .map((event) => (
                                            <EnhancedEventCard
                                                key={event.eventId}
                                                event={event}
                                                isUpcoming={true}
                                                preferences={preferences}
                                                formatDate={formatDate}
                                                formatTime={formatTime}
                                                t={t as any}
                                            />
                                        ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-xl ${themeClasses.paddingLarge} border ${themeClasses.borderCard} text-center`}>
                                <Calendar className={`${themeClasses.iconSizeLarge} ${themeClasses.textMuted} mx-auto ${themeClasses.marginSmall}`} />
                                <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                    {t('noEventsAvailable')}
                                </h3>
                                <p className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>
                                    {t('eventsWillAppearSoon')}
                                </p>
                            </div>
                        )}

                        {/* Past Events */}
                        {pastEvents.length > 0 && (
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-xl ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                                <div className={`flex items-center justify-between ${themeClasses.marginLarge}`}>
                                    <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text}`}>
                                        {t('pastEvents')} ({pastEvents.length})
                                    </h2>
                                    <span className={`px-3 py-1 bg-gray-100 text-gray-600 ${themeClasses.fontSize.subtitle} font-medium rounded-full`}>
                                        {t('pastEvents')}
                                    </span>
                                </div>
                                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${themeClasses.gap}`}>
                                    {pastEvents
                                        .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())
                                        .slice(0, 6)
                                        .map((event) => (
                                            <EnhancedEventCard
                                                key={event.eventId}
                                                event={event}
                                                isUpcoming={false}
                                                preferences={preferences}
                                                formatDate={formatDate}
                                                formatTime={formatTime}
                                                t={t as any}
                                            />
                                        ))}
                                </div>
                                {pastEvents.length > 6 && (
                                    <div className="text-center mt-6">
                                        <button className={`${themeClasses.buttonPadding} ${themeClasses.backgroundCard} ${themeClasses.hover} ${themeClasses.text} rounded-lg transition-colors ${themeClasses.fontSize.button}`}>
                                            {t('viewAllEvents')} {pastEvents.length} {t('pastEvents')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Events At All */}
                        {events.length === 0 && (
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-xl ${themeClasses.paddingLarge} border ${themeClasses.borderCard} text-center`}>
                                <Building className={`h-20 w-20 ${themeClasses.textMuted} mx-auto ${themeClasses.marginLarge}`} />
                                <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>
                                    {t('noEventsYet')}
                                </h3>
                                <p className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary} ${themeClasses.marginLarge}`}>
                                    {t('eventsWillAppearSoon')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'location' && (
                    <div className={`grid grid-cols-1 lg:grid-cols-2 ${themeClasses.gap}`}>
                        <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                            <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ${themeClasses.marginLarge}`}>
                                {t('venueLocation')}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className={`font-semibold ${themeClasses.text} ${themeClasses.marginSmall} ${themeClasses.fontSize.label}`}>
                                        {t('address')}
                                    </h3>
                                    <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>
                                        <div>{venue.address}</div>
                                        <div>{venue.city}, {venue.state} {venue.zipCode}</div>
                                        <div>{venue.country}</div>
                                    </div>
                                </div>

                                {venue.latitude && venue.longitude && (
                                    <div>
                                        <h3 className={`font-semibold ${themeClasses.text} ${themeClasses.marginSmall} ${themeClasses.fontSize.label}`}>
                                            {t('latitude')} & {t('longitude')}
                                        </h3>
                                        <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary}`}>
                                            {t('latitude')}: {venue.latitude}, {t('longitude')}: {venue.longitude}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={openMap}
                                    className={`w-full ${themeClasses.accent} ${themeClasses.accentHover} text-white ${themeClasses.buttonPadding} rounded-lg flex items-center justify-center transition-colors ${themeClasses.fontSize.button}`}
                                >
                                    <Navigation className={`${themeClasses.iconSize} mr-2`} />
                                    Get Directions
                                </button>
                            </div>
                        </div>

                        <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-lg ${themeClasses.shadow} ${themeClasses.padding} border ${themeClasses.borderCard}`}>
                            <h2 className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ${themeClasses.marginLarge}`}>
                                {t('venueInformation')}
                            </h2>
                            <div className={themeClasses.spacing}>
                                <div>
                                    <h3 className={`font-semibold ${themeClasses.text} mb-3 ${themeClasses.fontSize.label}`}>
                                        {t('contactUs')}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className={`flex items-center p-3 ${themeClasses.backgroundCard} rounded-lg`}>
                                            <Mail className={`${themeClasses.iconSize} ${themeClasses.textMuted} mr-3`} />
                                            <div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('email')}</div>
                                                <a
                                                    href={`mailto:${venue.contactEmail}`}
                                                    className={`${themeClasses.accentText} ${themeClasses.accentHover} font-medium ${themeClasses.fontSize.text}`}
                                                >
                                                    {venue.contactEmail}
                                                </a>
                                            </div>
                                        </div>

                                        <div className={`flex items-center p-3 ${themeClasses.backgroundCard} rounded-lg`}>
                                            <Phone className={`${themeClasses.iconSize} ${themeClasses.textMuted} mr-3`} />
                                            <div>
                                                <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('phoneNumber')}</div>
                                                <a
                                                    href={`tel:${venue.contactPhone}`}
                                                    className={`${themeClasses.accentText} ${themeClasses.accentHover} font-medium ${themeClasses.fontSize.text}`}
                                                >
                                                    {venue.contactPhone}
                                                </a>
                                            </div>
                                        </div>

                                        {venue.website && (
                                            <div className={`flex items-center p-3 ${themeClasses.backgroundCard} rounded-lg`}>
                                                <Globe className={`${themeClasses.iconSize} ${themeClasses.textMuted} mr-3`} />
                                                <div>
                                                    <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>{t('website')}</div>
                                                    <a
                                                        href={venue.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`${themeClasses.accentText} ${themeClasses.accentHover} font-medium flex items-center ${themeClasses.fontSize.text}`}
                                                    >
                                                        {t('visitWebsite')}
                                                        <ExternalLink className={`${themeClasses.iconSizeSmall} ml-1`} />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {/* Close outer container */}
        </div>
    );
}


function EnhancedEventCard({
    event,
    isUpcoming,
    preferences,
    formatDate,
    formatTime,
    t
}: {
    event: VenueEvent;
    isUpcoming: boolean;
    preferences: AttendeePreferences | null;
    formatDate: (dateString: string) => string;
    formatTime: (dateString: string) => string;
    t: (key: keyof TranslationKeys, params?: any) => string;
}) {
    const themeClasses = getThemeClasses(preferences);

    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        if (imageUrl.startsWith('/')) {
            return `http://localhost:5251${imageUrl}`;
        }
        return `http://localhost:5251/${imageUrl}`;
    };

    const formatShortDate = (dateString: string) => {
        return formatDate(dateString);
    };

    const formatPrice = (price: number, preferences: AttendeePreferences | null) => {
        const currency = preferences?.currency || 'USD';
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: 'EUR',
            GBP: 'GBP',
            JPY: 'JPY'
        };
        const rates: Record<string, number> = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149
        };

        const converted = price * (rates[currency] ?? 1);
        if (currency === 'JPY') {
            return `${symbols[currency] ?? '$'}${Math.round(converted).toLocaleString()}`;
        }
        return `${symbols[currency] ?? '$'}${converted.toFixed(2)}`;
    };

    const getDaysUntil = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDaysAgo = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = today.getTime() - eventDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const imageUrl = getImageUrl(event.imageUrl);
    const daysUntil = getDaysUntil(event.startDateTime);
    const daysAgo = getDaysAgo(event.startDateTime);

    return (
        <Link
            href={`/events/${event.eventId}`}
            className={`block ${themeClasses.backgroundCard} rounded-xl ${themeClasses.shadow} overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-2 border ${themeClasses.borderCard} ${!isUpcoming ? 'opacity-90 hover:opacity-100' : ''
                }`}
        >
            <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-white opacity-50" />
                    </div>
                )}

                {/* Event Status Badge */}
                <div className="absolute top-3 left-3">
                    {isUpcoming ? (
                        daysUntil <= 7 ? (
                            <span className={`px-3 py-1 bg-red-500/90 text-white ${themeClasses.fontSize.subtitle} font-bold rounded-full backdrop-blur-sm`}>
                                {daysUntil === 0 ? t('today') : daysUntil === 1 ? t('tomorrow') : t('inDays', { days: daysUntil })}
                            </span>
                        ) : (
                            <span className={`px-3 py-1 bg-green-500/90 text-white ${themeClasses.fontSize.subtitle} font-bold rounded-full backdrop-blur-sm`}>
                                {t('upcoming')}
                            </span>
                        )
                    ) : (
                        <span className={`px-3 py-1 bg-gray-500/90 text-white ${themeClasses.fontSize.subtitle} font-medium rounded-full backdrop-blur-sm`}>
                            {daysAgo === 0 ? t('today') : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                        </span>
                    )}
                </div>

                {/* Date Badge */}
                <div className="absolute bottom-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className={`${themeClasses.fontSize.heading} font-bold text-gray-900`}>
                            {formatShortDate(event.startDateTime)}
                        </div>
                        <div className={`${themeClasses.fontSize.subtitle} text-gray-600`}>
                            {formatTime(event.startDateTime)}
                        </div>
                    </div>
                </div>

                {/* Ticket Status */}
                {isUpcoming && (
                    <div className="absolute top-3 right-3">
                        {event.availableTickets === 0 ? (
                            <span className={`px-2 py-1 bg-red-500/90 text-white ${themeClasses.fontSize.subtitle} font-bold rounded-full backdrop-blur-sm`}>
                                {t('soldOut')}
                            </span>
                        ) : event.availableTickets < 50 ? (
                            <span className={`px-2 py-1 bg-orange-500/90 text-white ${themeClasses.fontSize.subtitle} font-bold rounded-full backdrop-blur-sm`}>
                                {t('limited')}
                            </span>
                        ) : (
                            <span className={`px-2 py-1 bg-blue-500/90 text-white ${themeClasses.fontSize.subtitle} font-medium rounded-full backdrop-blur-sm`}>
                                {t('available')}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 ${themeClasses.accentLight} ${themeClasses.accentText} ${themeClasses.fontSize.subtitle} font-medium rounded-full`}>
                        {event.categoryName}
                    </span>
                    {isUpcoming && (
                        <span className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted}`}>
                            {event.ticketsSold} {t('ticketsSold')}
                        </span>
                    )}
                </div>

                <h3 className={`font-semibold ${themeClasses.text} mb-2 line-clamp-2 ${themeClasses.fontSize.heading}`}>
                    {event.title}
                </h3>

                <div className={`${themeClasses.fontSize.text} ${themeClasses.textSecondary} mb-3`}>
                    {t('by')} {event.organizerName}
                </div>

                <div className="flex items-center justify-between">
                    <span className={`${themeClasses.text} font-medium ${themeClasses.fontSize.text}`}>
                        {t('from')} {formatPrice(event.basePrice, preferences)}
                    </span>
                    {isUpcoming ? (
                        <span className={`text-green-600 ${themeClasses.fontSize.subtitle} font-medium`}>
                            {event.availableTickets} {t('remaining')}
                        </span>
                    ) : (
                        <span className={`${themeClasses.textMuted} ${themeClasses.fontSize.subtitle}`}>
                            {event.ticketsSold} {t('attended')}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

