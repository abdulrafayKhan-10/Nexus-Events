'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { eventsApi } from '@/lib/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import {
    DollarSign,
    Users,
    Calendar,
    MapPin,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Wifi,
    WifiOff
} from 'lucide-react';
import { useI18n } from '../../../components/providers/I18nProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';

interface EventRevenueData {
    eventId: number;
    eventName: string;
    totalRevenue: number;
    attendeeCount: number;
    ticketsSold: number;
}

interface RevenueAnalytics {
    totalRevenue: number;
    totalAttendees: number;
    activeEvents: number;
    totalVenues: number;
    events: EventRevenueData[];
}

interface PaymentMethodData {
    paymentMethod: string;
    orderCount: number;
    percentage: number;
    totalAmount: number;
}

interface PaymentAnalytics {
    methods: PaymentMethodData[];
}

interface CapacityData {
    eventId: number;
    eventName: string;
    maxCapacity: number;
    ticketsSold: number;
    utilizationPercentage: number;
}

interface CapacityAnalytics {
    events: CapacityData[];
}

interface AgeGroupData {
    ageGroup: string;
    count: number;
    percentage: number;
}

interface GenderData {
    gender: string;
    count: number;
    percentage: number;
}

interface DemographicsAnalytics {
    ageDistribution: AgeGroupData[];
    genderDistribution: GenderData[];
}

interface CheckInHourlyData {
    hour: string;
    checkInCount: number;
    cumulativeCount: number;
}

interface CheckInAnalytics {
    hourlyPattern: CheckInHourlyData[];
    totalCheckIns: number;
    totalTicketsSold: number;
    attendanceRate: number;
}

interface VenuePerformanceData {
    venueId: number;
    venueName: string;
    eventCount: number;
    avgAttendance: number;
    totalRevenue: number;
    avgRating: number;
}

interface VenueAnalytics {
    performance: VenuePerformanceData[];
}

interface SeasonalTrendData {
    month: string;
    eventCount: number;
    totalRevenue: number;
    totalAttendance: number;
}

interface SeasonalAnalytics {
    monthlyTrends: SeasonalTrendData[];
}

interface TicketTypeData {
    typeName: string;
    price: number;
    sold: number;
}

interface LowAttendanceEventData {
    eventId: number;
    eventName: string;
    maxCapacity: number;
    ticketsSold: number;
    utilizationPercentage: number;
    daysUntilEvent: number;
    ticketTypes: TicketTypeData[];
    potentialIssues: string[];
    recommendations: string[];
}

interface LowAttendanceAnalytics {
    events: LowAttendanceEventData[];
}

interface AnalyticsData {
    revenue: RevenueAnalytics;
    payments: PaymentAnalytics;
    capacity: CapacityAnalytics;
    demographics: DemographicsAnalytics;
    checkIns: CheckInAnalytics;
    venues: VenueAnalytics;
    seasonal: SeasonalAnalytics;
    lowAttendance: LowAttendanceAnalytics;

}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<any>;
    trend?: string;
    color?: string;
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

interface Stats {
    totalEvents: number;
    publishedEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: number;
}


const OrganizerAnalytics: React.FC = () => {
    const themeClasses = useThemeClasses();
    const { isDark } = useTheme();
    const { t } = useI18n();

    const [selectedPeriod, setSelectedPeriod] = useState<string>('last30days');
    const [loading, setLoading] = useState<boolean>(false);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
    const [apiErrors, setApiErrors] = useState<string[]>([]);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';

    const COLORS = isDark
        ? ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#A78BFA', '#22D3EE']
        : ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

    const checkAuth = (): boolean => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');

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
            return true;
        } catch (error) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setAuthStatus('unauthenticated');
            return false;
        }
    };

    const makeAuthenticatedRequest = async (endpoint: string, isOptional: boolean = false): Promise<any> => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setAuthStatus('unauthenticated');
            }

            if (response.status === 400 && endpoint.includes('check-in-patterns')) {
                return { hourlyPattern: [], totalCheckIns: 0, totalTicketsSold: 0, attendanceRate: 0 };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API request failed with status ${response.status}`);
            }

            return response.json();
        } catch (error: any) {
            if (isOptional) {
                return null;
            }
            throw error;
        }
    };

    const fetchAnalyticsData = async (): Promise<void> => {
        if (!checkAuth()) {
            return;
        }

        setLoading(true);
        setApiErrors([]);

        try {
            setLoading(true);

            const eventsResponse = await eventsApi.getMyEvents();

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

            const results = await Promise.allSettled([
                makeAuthenticatedRequest(`/api/analytics/revenue-by-event?period=${selectedPeriod}`),
                makeAuthenticatedRequest(`/api/analytics/payment-methods?period=${selectedPeriod}`),
                makeAuthenticatedRequest(`/api/analytics/event-capacity?period=${selectedPeriod}`),
                makeAuthenticatedRequest(`/api/analytics/attendee-demographics?period=${selectedPeriod}`),
                makeAuthenticatedRequest(`/api/analytics/check-in-patterns?period=${selectedPeriod}`, true), 
                makeAuthenticatedRequest(`/api/analytics/venue-performance?period=${selectedPeriod}`),
                makeAuthenticatedRequest(`/api/analytics/seasonal-trends`),
                makeAuthenticatedRequest(`/api/analytics/low-attendance-events`)
            ]);

            const errors: string[] = [];

            const [
                revenueResult,
                paymentResult,
                capacityResult,
                demographicsResult,
                checkInResult,
                venueResult,
                seasonalResult,
                lowAttendanceResult
            ] = results;

            const revenueData = revenueResult.status === 'fulfilled'
                ? revenueResult.value
                : (() => {
                    errors.push('Revenue data failed to load');
                    return { totalRevenue: 0, totalAttendees: 0, activeEvents: 0, totalVenues: 0, events: [] };
                })();

            const paymentData = paymentResult.status === 'fulfilled'
                ? paymentResult.value
                : (() => {
                    errors.push('Payment data failed to load');
                    return { methods: [] };
                })();

            const capacityData = capacityResult.status === 'fulfilled'
                ? capacityResult.value
                : (() => {
                    errors.push('Capacity data failed to load');
                    return { events: [] };
                })();

            const demographicsData = demographicsResult.status === 'fulfilled'
                ? demographicsResult.value
                : (() => {
                    errors.push('Demographics data failed to load');
                    return { ageDistribution: [], genderDistribution: [] };
                })();

            const checkInData = checkInResult.status === 'fulfilled'
                ? checkInResult.value
                : (() => {
                    return { hourlyPattern: [], totalCheckIns: 0, totalTicketsSold: 0, attendanceRate: 0 };
                })();

            const venueData = venueResult.status === 'fulfilled'
                ? venueResult.value
                : (() => {
                    errors.push('Venue data failed to load');
                    return { performance: [] };
                })();

            const seasonalData = seasonalResult.status === 'fulfilled'
                ? seasonalResult.value
                : (() => {
                    errors.push('Seasonal data failed to load');
                    return { monthlyTrends: [] };
                })();

            const lowAttendanceData = lowAttendanceResult.status === 'fulfilled'
                ? lowAttendanceResult.value
                : (() => {
                    errors.push('Low attendance data failed to load');
                    return { events: [] };
                })();

            setApiErrors(errors);

            setAnalyticsData({
                revenue: revenueData,
                payments: paymentData,
                capacity: capacityData,
                demographics: demographicsData,
                checkIns: checkInData,
                venues: venueData,
                seasonal: seasonalData,
                lowAttendance: lowAttendanceData
            });

        } catch (error: any) {

            setAnalyticsData({
                revenue: { totalRevenue: 0, totalAttendees: 0, activeEvents: 0, totalVenues: 0, events: [] },
                payments: { methods: [] },
                capacity: { events: [] },
                demographics: { ageDistribution: [], genderDistribution: [] },
                checkIns: { hourlyPattern: [], totalCheckIns: 0, totalTicketsSold: 0, attendanceRate: 0 },
                venues: { performance: [] },
                seasonal: { monthlyTrends: [] },
                lowAttendance: { events: [] }
            });
        } finally {
            setLoading(false);
        }
    };

    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

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

    const [stats, setStats] = useState<Stats>({
        totalEvents: 0,
        publishedEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        upcomingEvents: 0
    });

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

    const formatDateWithUserPreference = (dateString: string, preferences: UserPreferences | null) => {
        const date = new Date(dateString);
        const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const monthNames = [
            t('jan'), t('feb'), t('mar'), t('apr'),
            t('may'), t('jun'), t('jul'), t('aug'),
            t('sep'), t('oct'), t('nov'), t('dec')
        ];
        const monthShort = monthNames[date.getMonth()];

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

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (authStatus === 'authenticated') {
            fetchUserPreferences();
            fetchAnalyticsData();
        }
    }, [selectedPeriod, authStatus]);

    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = "blue" }) => (
        <div className={`${themeClasses.card} rounded-lg shadow-md p-6 border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${themeClasses.textMuted}`}>{title}</p>
                    <p className={`text-2xl font-bold ${themeClasses.text}`}>{value}</p>
                    {trend && (
                        <p className={`text-sm ${themeClasses.textMuted} flex items-center mt-1`}>
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {trend}
                        </p>
                    )}
                </div>
                <Icon className="w-8 h-8 text-blue-500" />
            </div>
        </div>
    );

    const CustomTooltip = ({ active, payload, label, isDark }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 shadow-lg`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                    </p>
                ))}
            </div>
        );
    };

    if (authStatus === 'checking') {
        return (
            <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={themeClasses.text}>{t('checkingAuthentication')}</p>
                </div>
            </div>
        );
    }

    if (authStatus === 'unauthenticated') {
        return (
            <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>
                <div className={`text-center ${themeClasses.card} p-8 rounded-lg shadow-md`}>
                    <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>{t('authenticationRequired')}</h2>
                    <p className={`${themeClasses.textMuted} mb-4`}>{t('pleaseLogInToView')}</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        {t('goToLogin')}
                    </button>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`max-w-7xl mx-auto p-6 ${themeClasses.background} min-h-screen`}>
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>{t('analytics')}</h1>
                        <p className={themeClasses.textMuted}>{t('comprehensiveInsights')}</p>
                    </div>
                    <button
                        onClick={fetchAnalyticsData}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('refreshData')}
                    </button>
                </div>

                {/* Show API errors if any */}
                {apiErrors.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{t('someDataCouldntBeLoaded')}</h3>
                        </div>
                        <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                            {apiErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-4">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className={`px-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.card} ${themeClasses.text}`}
                    >
                        <option value="last7days">{t('last7Days')}</option>
                        <option value="last30days">{t('last30Days')}</option>
                        <option value="last3months">{t('last3Months')}</option>
                        <option value="last6months">{t('last6Months')}</option>
                        <option value="lastyear">{t('lastYear')}</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    title={t('totalAttendees')}
                    value={analyticsData.revenue.totalAttendees.toLocaleString()}
                    icon={Users}
                    trend={analyticsData.revenue.totalAttendees > 0 ? t('fromLastMonth') : t('noAttendeesYet')}
                />
                <StatCard
                    title={t('activeEvents')}
                    value={analyticsData.revenue.activeEvents.toString()}
                    icon={Calendar}
                    trend={analyticsData.revenue.activeEvents > 0 ? t('eventsRunning') : t('noActiveEvents')}
                />
                <StatCard
                    title={t('venuesUsed')}
                    value={analyticsData.revenue.totalVenues.toString()}
                    icon={MapPin}
                    trend={analyticsData.revenue.totalVenues > 0 ? t('venuePartnerships') : t('noVenuesYet')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Revenue Events */}
                <div className={`${themeClasses.card} rounded-lg shadow-md p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text}`}>
                        <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                        {t('topRevenueEvents')}
                    </h3>
                    {analyticsData.revenue.events.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.revenue.events.map(event => ({
                                ...event,
                                displayRevenue: parseFloat(convertAndFormatCurrency(event.totalRevenue, 'USD', preferences, { region: 'en-US' }).replace(/[^\d.-]/g, ''))
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                                <XAxis
                                    dataKey="eventName"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    fontSize={12}
                                    tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }}
                                />
                                <YAxis tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        const data = payload[0].payload;
                                        return (
                                            <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 shadow-lg`}>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    Revenue: {convertAndFormatCurrency(data.totalRevenue, 'USD', preferences, { region: 'en-US' })}
                                                    {preferences?.currency && preferences.currency !== 'USD' && (
                                                        <span className="block text-xs opacity-75">
                                                            (≈ ${data.totalRevenue.toFixed(2)} USD)
                                                        </span>
                                                    )}
                                                </p>
                                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    Attendees: {data.attendeeCount}
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar dataKey="displayRevenue" fill={COLORS[0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={`flex items-center justify-center h-64 ${themeClasses.textMuted}`}>
                            <div className="text-center">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>{t('noEventsWithRevenueData')}</p>
                                <p className="text-sm">{t('createAndPublishEvents')} {t('seeRevenueAnalytics')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                <div className={`${themeClasses.card} rounded-lg shadow-md p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>{t('paymentMethodDistribution')}</h3>
                    {analyticsData.payments.methods.length > 0 ? (
                        <div className="flex flex-col lg:flex-row items-center">
                            <ResponsiveContainer width="60%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.payments.methods}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="percentage"
                                    >
                                        {analyticsData.payments.methods.map((entry: PaymentMethodData, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-full lg:w-40% space-y-2">
                                {analyticsData.payments.methods.map((method: PaymentMethodData, index: number) => (
                                    <div key={method.paymentMethod} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className={`text-sm ${themeClasses.text}`}>{method.paymentMethod}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-medium ${themeClasses.text}`}>{method.percentage}%</span>
                                            <br />
                                            <span className={`text-xs ${themeClasses.textMuted}`}>{method.orderCount} {t('orders')}</span>
                                            <br />
                                            <span className={`text-xs font-medium ${themeClasses.text}`}>
                                                {convertAndFormatCurrency(method.totalAmount, 'USD', preferences, { region: 'en-US' })}
                                                {preferences?.currency && preferences.currency !== 'USD' && (
                                                    <span className="block text-xs opacity-75">
                                                        (≈ ${method.totalAmount.toFixed(2)} USD)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`flex items-center justify-center h-64 ${themeClasses.textMuted}`}>
                            <div className="text-center">
                                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>{t('noPaymentDataAvailable')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Capacity Utilization */}
            <div className={`${themeClasses.card} rounded-lg shadow-md p-6 mb-8`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text}`}>
                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                    {t('eventCapacityUtilization')}
                </h3>
                {analyticsData.capacity.events.length > 0 ? (
                    <div className="space-y-4">
                        {analyticsData.capacity.events.map((event: CapacityData) => (
                            <div key={event.eventId} className="flex items-center space-x-4">
                                <div className="w-1/3">
                                    <p className={`font-medium text-sm ${themeClasses.text}`}>{event.eventName}</p>
                                    <p className={`text-xs ${themeClasses.textMuted}`}>{event.ticketsSold}/{event.maxCapacity} {t('tickets')}</p>
                                </div>
                                <div className="flex-1">
                                    <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                                        <div
                                            className={`h-3 rounded-full ${event.utilizationPercentage >= 90 ? 'bg-green-500' :
                                                event.utilizationPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${Math.max(event.utilizationPercentage, 1)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-medium ${themeClasses.text}`}>{event.utilizationPercentage.toFixed(1)}% {t('utilization')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`flex items-center justify-center h-32 ${themeClasses.textMuted}`}>
                        <div className="text-center">
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>{t('noEventsFoundForPeriod')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Seasonal Trends */}
            {analyticsData.seasonal.monthlyTrends.length > 0 && (
                <div className={`${themeClasses.card} rounded-lg shadow-md p-6 mb-8`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text}`}>
                        <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                        {t('monthlyTrends')}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.seasonal.monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                            <XAxis dataKey="month" tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }} />
                            <YAxis yAxisId="left" tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload || !payload.length) return null;
                                    const data = payload[0].payload;
                                    return (
                                        <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 shadow-lg`}>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                                            {payload.map((entry: any, index: number) => (
                                                <p key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} style={{ color: entry.color }}>
                                                    {entry.name === `${t('revenue')} ($)` ? (
                                                        <>
                                                            Revenue: {convertAndFormatCurrency(entry.value, 'USD', preferences, { region: 'en-US' })}
                                                            {preferences?.currency && preferences.currency !== 'USD' && (
                                                                <span className="block text-xs opacity-75">
                                                                    (≈ ${entry.value.toFixed(2)} USD)
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        `${entry.name}: ${entry.value}`
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                            <Bar yAxisId="left" dataKey="eventCount" fill={COLORS[4]} name={t('events')} />
                            <Line yAxisId="right" type="monotone" dataKey="totalRevenue" stroke={COLORS[2]} strokeWidth={2} name={`${t('revenue')} ($)`} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className={`${themeClasses.card} rounded-lg shadow-md p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>{t('genderDistribution')}</h3>
                    {analyticsData.demographics.genderDistribution.some(group => group.count > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.demographics.genderDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                                <XAxis dataKey="gender" tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }} />
                                <YAxis tick={{ fill: isDark ? '#D1D5DB' : '#6B7280' }} />
                                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                <Bar dataKey="count" fill={COLORS[4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={`flex items-center justify-center h-64 ${themeClasses.textMuted}`}>
                            <div className="text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>{t('noDemographicDataAvailable')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Venue Performance */}
                <div className={`${themeClasses.card} rounded-lg shadow-md p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text}`}>
                        <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                        {t('venuePerformance')}
                    </h3>
                    {analyticsData.venues.performance.length > 0 ? (
                        <div className="space-y-4">
                            {analyticsData.venues.performance.map((venue: VenuePerformanceData) => (
                                <div key={venue.venueId} className={`border ${themeClasses.border} rounded-lg p-4`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-semibold ${themeClasses.text}`}>{venue.venueName}</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className={themeClasses.textMuted}>{t('events')}</p>
                                            <p className={`font-medium ${themeClasses.text}`}>{venue.eventCount}</p>
                                        </div>
                                        <div>
                                            <p className={themeClasses.textMuted}>{t('avgAttendance')}</p>
                                            <p className={`font-medium ${themeClasses.text}`}>{venue.avgAttendance}</p>
                                        </div>
                                        <div>
                                            <p className={themeClasses.textMuted}>{t('revenue')}</p>
                                            <p className={`font-medium ${themeClasses.text}`}>
                                                {convertAndFormatCurrency(venue.totalRevenue, 'USD', preferences, { region: 'en-US' })}
                                            </p>
                                            {preferences?.currency && preferences.currency !== 'USD' && (
                                                <p className={`text-xs ${themeClasses.textMuted} opacity-75`}>
                                                    (≈ ${venue.totalRevenue.toFixed(2)} USD)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`flex items-center justify-center h-48 ${themeClasses.textMuted}`}>
                            <div className="text-center">
                                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p>{t('noVenueDataAvailable')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Low Attendance Events */}
            <div className={`${themeClasses.card} rounded-lg shadow-md p-6`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text}`}>
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    {t('eventsNeedingAttention')}
                </h3>
                {analyticsData.lowAttendance.events.length > 0 ? (
                    <div className="space-y-6">
                        {analyticsData.lowAttendance.events.map((event: LowAttendanceEventData) => (
                            <div key={event.eventId} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className={`font-semibold text-lg ${themeClasses.text}`}>{event.eventName}</h4>
                                        <p className={`text-sm ${themeClasses.textMuted}`}>
                                            {event.ticketsSold}/{event.maxCapacity} {t('ticketsSold')} ({event.utilizationPercentage}% {t('utilization')})
                                        </p>
                                        <p className={`text-sm ${themeClasses.text} font-medium`}>
                                            ⏰ {event.daysUntilEvent} {t('daysUntilEvent')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                            <span className="text-red-700 dark:text-red-400 font-bold">{event.utilizationPercentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                {event.ticketTypes.length > 0 && (
                                    <div className="mb-4">
                                        <h5 className={`font-medium ${themeClasses.text} mb-2`}>{t('ticketTypes')}:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                            {event.ticketTypes.map((ticket: TicketTypeData, index: number) => (
                                                <div key={index} className={`${themeClasses.card} p-2 rounded border ${themeClasses.border}`}>
                                                    <p className={`font-medium ${themeClasses.text}`}>{ticket.typeName}</p>
                                                    <p className={themeClasses.textMuted}>
                                                        {convertAndFormatCurrency(ticket.price, 'USD', preferences, { region: 'en-US' })} - {ticket.sold} {t('ticketsSold')}
                                                        {preferences?.currency && preferences.currency !== 'USD' && (
                                                            <span className="block text-xs opacity-75">
                                                                (≈ ${ticket.price.toFixed(2)} USD)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`flex items-center justify-center h-32 ${themeClasses.textMuted}`}>
                        <div className="text-center">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <p>{t('allEventsPerformingWell')}</p>
                            <p className="text-sm">{t('noEventsWithLowAttendance')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerAnalytics;