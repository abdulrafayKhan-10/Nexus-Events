/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/organizer/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { eventsApi } from '@/lib/api';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';
import { useI18nContext } from '@/components/providers/I18nProvider';
import {
    Calendar,
    Users,
    DollarSign,
    TrendingUp,
    Plus,
    Eye,
    Edit,
    Trash2,
    MapPin,
    Clock,
    Tag,
    Globe,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';

interface Event {
    eventDate: string | number | Date;
    revenue: number;
    eventId: number;
    actualRevenue?: number;
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

interface Stats {
    totalEvents: number;
    publishedEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: number;
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

const OrganizerDashboard: React.FC = () => {
    const { user, isOrganizer } = useAuth();
    const { isDark, isCompact } = useTheme();
    const themeClasses = useThemeClasses();

    const { t, formatCurrency } = useI18nContext();

    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalEvents: 0,
        publishedEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        upcomingEvents: 0
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && isOrganizer) {
            fetchUserPreferences();
            fetchDashboardData();
        }
    }, [user, isOrganizer]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const eventsResponse = await eventsApi.getMyEvents();

            // Fetch enhanced revenue analytics for each event
            let totalActualRevenue = 0;

            for (const event of eventsResponse) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/tickets/event/${event.eventId}/revenue`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const revenueData = await response.json();
                        event.actualRevenue = revenueData.grossRevenue || 0;
                        totalActualRevenue += event.actualRevenue;
                    } else {
                        event.actualRevenue = 0;
                    }
                } catch (error) {
                    console.error(`Failed to fetch revenue for event ${event.eventId}`);
                    event.actualRevenue = 0;
                }
            }

            setEvents(eventsResponse);

            const now = new Date();
            const totalEvents = eventsResponse.length;
            const publishedEvents = eventsResponse.filter(event => event.isPublished).length;
            const upcomingEvents = eventsResponse.filter(event =>
                new Date(event.startDateTime || event.eventDate) > now && event.isPublished
            ).length;
            const totalTicketsSold = eventsResponse.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);

            setStats({
                totalEvents,
                publishedEvents,
                totalTicketsSold,
                totalRevenue: totalActualRevenue,
                upcomingEvents
            });

        } catch (error) {
            setError(t('dashboardError'));
        } finally {
            setLoading(false);
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

    const handlePublishEvent = async (eventId: number, currentStatus: boolean) => {
        try {
            const endpoint = currentStatus ? 'unpublish' : 'publish';
            // Use environment variable instead of hardcoded URL
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setEvents(events.map(event =>
                    event.eventId === eventId
                        ? { ...event, isPublished: !currentStatus }
                        : event
                ));

                setStats(prev => ({
                    ...prev,
                    publishedEvents: currentStatus ? prev.publishedEvents - 1 : prev.publishedEvents + 1
                }));
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to update event status');
            }
        } catch (error) {
            console.error('Error updating event status:', error);
            setError('Failed to update event status');
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            // Use environment variable instead of hardcoded URL
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const deletedEvent = events.find(e => e.eventId === eventId);
                setEvents(events.filter(event => event.eventId !== eventId));

                setStats(prev => ({
                    ...prev,
                    totalEvents: prev.totalEvents - 1,
                    publishedEvents: deletedEvent?.isPublished ? prev.publishedEvents - 1 : prev.publishedEvents
                }));
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Failed to delete event');
        }
    };

    const handleRefresh = async () => {
        await fetchDashboardData();
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

    const getCurrencySymbol = (currency: string) => {
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥'
        };

        return symbols[currency] || '$';
    };

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

    const StatCard: React.FC<{
        icon: React.ElementType;
        title: string;
        value: string | number;
        subtitle?: string;
        trend?: 'up' | 'down';
        trendValue?: string;
        color?: string;
    }> = ({ icon: Icon, title, value, subtitle, trend, trendValue, color = 'blue' }) => {
        return (
            <div className={`relative overflow-hidden rounded-2xl bg-gray-800/40 border border-white/10 backdrop-blur-xl p-6 transition-all duration-300 transform hover:-translate-y-1 group hover:shadow-[0_8px_32px_0_rgba(139,92,246,0.15)]`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-neon-purple/5 rounded-full blur-2xl group-hover:bg-neon-purple/10 transition-colors"></div>
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-gray-100 mb-1">{value}</h3>
                        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
                    </div>
                    <div className={`p-3 rounded-xl bg-neon-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]`}>
                        <Icon className="h-6 w-6 text-neon-cyan" />
                    </div>
                </div>
                {trend && (
                    <div className={`mt-4 flex items-center text-xs font-medium ${trend === 'up' ? 'text-neon-cyan' : 'text-red-400'}`}>
                        {trend === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
        );
    };

    const EventCard: React.FC<{ event: Event }> = ({ event }) => {
        const startDateTime = event.startDateTime || event.eventDate;

        return (
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-neon-purple/30 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] group">
                <div className={`flex justify-between items-start ${isCompact ? 'mb-3' : 'mb-4'}`}>
                    <div className="flex-1 pr-4">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{event.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{event.description}</p>

                        <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                            {startDateTime && (
                                <div className="flex items-center bg-gray-800/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                                    <Clock className="h-3.5 w-3.5 mr-1.5 text-neon-cyan" />
                                    <span>{formatEventDateTime(event.startDateTime, preferences, { region: 'en-US' }, t)}</span>
                                </div>
                            )}
                            {event.venueName && (
                                <div className="flex items-center bg-gray-800/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-fuchsia-400" />
                                    <span>{event.venueName}</span>
                                </div>
                            )}
                            {event.ticketsSold !== undefined && (
                                <div className="flex items-center bg-gray-800/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                                    <Users className="h-3.5 w-3.5 mr-1.5 text-neon-purple" />
                                    <span>{event.ticketsSold} sold</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${event.isPublished
                            ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/30'
                            : 'bg-gray-800/40 text-gray-400 border-white/10 backdrop-blur-sm'
                            }`}>
                            {event.isPublished ? t('published') : t('draft')}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${event.isOnline
                            ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30'
                            : 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30'
                            }`}>
                            {event.isOnline ? t('online') : t('inPerson')}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.location.href = `/organizer/events/${event.eventId}/edit`}
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800/40 hover:bg-white/5 backdrop-blur-sm rounded-lg transition-colors border border-white/10"
                        >
                            <Edit className="h-4 w-4 mr-1.5" />
                            {t('edit')}
                        </button>
                        <button
                            onClick={() => window.location.href = `/events/${event.eventId}`}
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800/40 hover:bg-white/5 backdrop-blur-sm rounded-lg transition-colors border border-white/10"
                        >
                            <Eye className="h-4 w-4 mr-1.5" />
                            {t('view')}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePublishEvent(event.eventId, event.isPublished)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${event.isPublished
                                ? 'text-gray-400 bg-gray-800/40 hover:bg-white/5 border-white/10 backdrop-blur-sm'
                                : 'text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 border-neon-cyan/30'
                                }`}
                        >
                            {event.isPublished ? t('unpublish') : t('publish')}
                        </button>
                        <button
                            onClick={() => handleDeleteEvent(event.eventId)}
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`${isCompact ? 'p-4' : 'p-8'} min-h-screen ${themeClasses.themeBg}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-border mx-auto"></div>
                            <p className={`mt-4 ${themeClasses.themeMutedFg}`}>{t('loadingDashboard')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-gray-100 selection:bg-neon-purple/30 selection:text-neon-purple font-sans transition-colors duration-500 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
            {/* Dark background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-cyan/10 blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            {t('dashboard')}
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">
                            {t('welcomeBack', { name: user?.firstName })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center px-4 py-2.5 text-sm font-semibold text-gray-300 bg-gray-800/40 hover:bg-white/5 backdrop-blur-md rounded-xl transition-all duration-300 border border-white/10"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {t('refresh')}
                        </button>
                        <button
                            onClick={() => window.location.href = '/organizer/events/create'}
                            className="flex items-center px-5 py-2.5 text-sm font-bold text-[#0a0f1c] bg-neon-cyan/90 hover:bg-neon-cyan rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            {t('createEvent')}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between animate-fade-in-up">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                            <p className="text-red-400 font-medium">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 p-1">
                            ×
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        icon={Calendar}
                        title={t('totalEvents')}
                        value={stats.totalEvents}
                        subtitle={t('publishedCount', { count: stats.publishedEvents })}
                        color="blue"
                    />
                    <StatCard
                        icon={Users}
                        title={t('ticketsSold')}
                        value={stats.totalTicketsSold.toLocaleString()}
                        color="green"
                    />
                    <StatCard
                        icon={() => (
                            <div className="flex items-center justify-center w-6 h-6 text-white font-bold text-lg">
                                {getCurrencySymbol(preferences?.currency || 'USD')}
                            </div>
                        )}
                        title={t('totalRevenue')}
                        value={convertAndFormatCurrency(stats.totalRevenue, 'USD', preferences, { region: 'en-US' })}
                        color="purple"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title={t('upcomingEvents')}
                        value={stats.upcomingEvents}
                        color="orange"
                    />
                </div>

                {/* Recent Events */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white relative inline-block">
                            {t('yourEvents')}
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                        </h2>
                        {events.length > 6 && (
                            <button
                                onClick={() => window.location.href = '/organizer/events'}
                                className="text-neon-cyan hover:text-cyan-300 text-sm font-semibold transition-colors flex items-center"
                            >
                                {t('viewAllEvents')} <ArrowUp className="h-4 w-4 ml-1 rotate-45" />
                            </button>
                        )}
                    </div>

                    {events.length === 0 ? (
                        <div className="text-center py-20 px-4 glass-card rounded-3xl border border-slate-800">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                                <Calendar className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{t('noEventsYet')}</h3>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">{t('createFirstEventPrompt')}</p>
                            <button
                                onClick={() => window.location.href = '/organizer/events/create'}
                                className="inline-flex items-center px-6 py-3 text-base font-bold text-[#0a0f1c] bg-neon-cyan/90 hover:bg-neon-cyan rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                {t('createYourFirstEvent')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {events.slice(0, 6).map((event) => (
                                <EventCard key={event.eventId} event={event} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;