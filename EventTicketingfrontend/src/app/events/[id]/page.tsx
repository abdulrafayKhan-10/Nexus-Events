/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/events/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    ArrowLeft,
    ShoppingCart,
    Plus,
    Minus,
    Star,
    Share,
    Heart,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    ZoomIn,
    X,
    Image,
    Building,
    Globe
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api';
import { useI18nContext } from '@/components/providers/I18nProvider';
import { useToast } from '@/components/common/Toast';
// Types
interface Event {
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
    bannerImageUrl?: string;
    status: string;
    isPublished: boolean;
    isFeatured: boolean;
    createdAt: string;
    tags?: string;
    maxAttendees: number;
    basePrice: number;
    isOnline: boolean;
    onlineUrl?: string;
    ticketsSold: number;
    availableTickets: number;
    currency?: string;
}

interface TicketType {
    ticketTypeId: number;
    eventId: number;
    eventTitle: string;
    name: string;
    description?: string;
    price: number;
    quantityAvailable: number;
    quantitySold: number;
    quantityRemaining: number;
    saleStartDate?: string;
    saleEndDate?: string;
    minQuantityPerOrder: number;
    maxQuantityPerOrder: number;
    isActive: boolean;
    isOnSale: boolean;
    sortOrder: number;
}

interface CartItem {
    ticketTypeId: number;
    name: string;
    price: number;
    quantity: number;
    maxQuantity: number;
}

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

interface SlideImage {
    id: string;
    url: string;
    title: string;
    subtitle: string;
    type: 'event-banner' | 'event-image' | 'venue';
}

interface UserPreferences {
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

const getThemeClasses = (preferences: UserPreferences | null) => {
    const isDarkMode = true; // Force premium dark mode

    const accentColor = preferences?.accentColor || 'purple'; // Default to neon purple
    const fontSize = preferences?.fontSize || 'medium';
    const compactMode = preferences?.compactMode || false;

    // Font size configurations
    const fontSizes = {
        small: {
            text: 'text-sm',
            heading: 'text-lg',
            title: 'text-xl',
            subtitle: 'text-xs',
            button: 'text-sm',
            label: 'text-xs',
            hero: 'text-4xl md:text-5xl',
            section: 'text-2xl md:text-3xl'
        },
        medium: {
            text: 'text-base',
            heading: 'text-xl',
            title: 'text-2xl',
            subtitle: 'text-sm',
            button: 'text-base',
            label: 'text-sm',
            hero: 'text-5xl md:text-6xl',
            section: 'text-3xl md:text-4xl'
        },
        large: {
            text: 'text-lg',
            heading: 'text-2xl',
            title: 'text-3xl',
            subtitle: 'text-base',
            button: 'text-lg',
            label: 'text-base',
            hero: 'text-6xl md:text-7xl',
            section: 'text-4xl md:text-5xl'
        }
    };

    const currentFont = fontSizes[fontSize as keyof typeof fontSizes] || fontSizes.medium;

    return {
        // Basic colors
        background: 'bg-[#0a0f1c]', // Premium dark background
        backgroundCard: 'bg-gray-800/40 backdrop-blur-xl',
        backgroundSidebar: 'bg-[#0a0f1c]/80 backdrop-blur-xl',
        backgroundInput: 'bg-gray-900/50 backdrop-blur-md',
        backgroundHeader: 'bg-[#0a0f1c]/80 backdrop-blur-xl',
        backgroundFooter: 'bg-[#0a0f1c]',

        // Text colors
        text: 'text-gray-100',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        textHero: 'text-white',

        // Borders
        border: 'border-gray-600/30',
        borderCard: 'border-white/10',

        // Effects
        shadow: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
        hover: 'hover:bg-white/5',

        // Typography & Layout
        fontSize: currentFont,

        // Padding/spacing based on compact mode
        padding: compactMode ? 'p-3' : 'p-6',
        paddingSmall: compactMode ? 'p-2' : 'p-4',
        paddingLarge: compactMode ? 'p-4' : 'p-8',
        paddingSection: compactMode ? 'py-8' : 'py-16',

        // Margins
        margin: compactMode ? 'mb-3' : 'mb-6',
        marginSmall: compactMode ? 'mb-2' : 'mb-4',
        marginLarge: compactMode ? 'mb-4' : 'mb-8',
        marginSection: compactMode ? 'mb-12' : 'mb-20',

        // Spacing
        spacing: compactMode ? 'space-y-2' : 'space-y-4',
        spacingLarge: compactMode ? 'space-y-3' : 'space-y-6',

        // Grid gaps
        gap: compactMode ? 'gap-3' : 'gap-6',

        // Button sizes
        buttonPadding: compactMode ? 'px-4 py-2' : 'px-6 py-3',
        buttonPaddingSmall: compactMode ? 'px-2 py-1' : 'px-3 py-2',

        // Input heights
        inputHeight: compactMode ? 'h-9' : 'h-11',
        searchHeight: compactMode ? 'py-3' : 'py-4',

        // Icon sizes
        iconSize: compactMode ? 'h-4 w-4' : 'h-5 w-5',
        iconSizeSmall: compactMode ? 'h-3 w-3' : 'h-4 w-4',
        iconSizeLarge: compactMode ? 'h-6 w-6' : 'h-8 w-8',

        // Accent colors
        accent: 'bg-neon-purple/80 backdrop-blur-sm',
        accentHover: 'hover:bg-neon-purple',
        accentText: 'text-neon-cyan',
        accentLight: 'bg-neon-purple/20',
        accentBorder: 'border-neon-purple/50',
        accentRing: 'focus:ring-neon-purple/50 focus:border-neon-cyan/50',
        accentGradient: 'from-neon-purple/80 to-neon-fuchsia/80',

        // State info
        isDarkMode,
        accentColor,
        fontSizeValue: fontSize,
        compactMode
    };
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

    console.log('💱 Converting:', amount, fromCurrency, '→', userCurrency);

    if (fromCurrency === userCurrency) {
        return formatCurrencyWithUserPreference(amount, preferences, currentLangData);
    }

    const conversionRates: { [key: string]: { [key: string]: number } } = {
        'USD': {
            'USD': 1,
            'EUR': 0.92,
            'GBP': 0.79,
            'JPY': 149
        },
        'EUR': {
            'USD': 1.09,
            'EUR': 1,
            'GBP': 0.86,
            'JPY': 162
        },
        'GBP': {
            'USD': 1.27,
            'EUR': 1.16,
            'GBP': 1,
            'JPY': 189
        },
        'JPY': {
            'USD': 0.0067,
            'EUR': 0.0062,
            'GBP': 0.0053,
            'JPY': 1
        }
    };

    const rate = conversionRates[fromCurrency]?.[userCurrency] || 1;
    const convertedAmount = amount * rate;

    return formatCurrencyWithUserPreference(convertedAmount, preferences, currentLangData);
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
        default:
            formattedDate = `${weekday}, ${month}/${day}/${year}`;
    }

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
    formattedTime += ` ${timeZoneAbbr}`;

    const result = `${formattedDate} ${t('at')} ${formattedTime}`;

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

const EventHeroSlideshow = ({ images, autoPlay = true, themeClasses }: {
    images: SlideImage[],
    autoPlay?: boolean,
    themeClasses: any
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [showModal, setShowModal] = useState(false);
    const [imageError, setImageError] = useState<Set<number>>(new Set());
    const { t } = useI18nContext();
    useEffect(() => {
        if (!isPlaying || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isPlaying, images.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev + 1) % images.length);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleImageError = (index: number) => {
        setImageError(prev => new Set([...prev, index]));
    };

    if (images.length === 0) {
        return (
            <div className={`${themeClasses.compactMode ? 'h-64' : 'h-64 md:h-96'} bg-gradient-to-r ${themeClasses.accentGradient} flex items-center justify-center`}>
                <Calendar className={`${themeClasses.compactMode ? 'h-16 w-16' : 'h-24 w-24'} text-white opacity-50`} />
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <>
            <div className={`relative ${themeClasses.compactMode ? 'h-64' : 'h-64 md:h-96'} overflow-hidden group`}>
                {/* Main Image */}
                <div className="relative w-full h-full">
                    {!imageError.has(currentIndex) ? (
                        <img
                            src={currentImage.url}
                            alt={currentImage.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                            onError={() => handleImageError(currentIndex)}
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${themeClasses.accentGradient} flex items-center justify-center`}>
                            <div className="text-center text-white">
                                <Image className={`${themeClasses.iconSizeLarge} mx-auto mb-2 opacity-50`} />
                                <p className={themeClasses.fontSize.text}>Image not available</p>
                            </div>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Image Type Badge */}
                    <div className={`absolute ${themeClasses.compactMode ? 'top-3 left-3' : 'top-4 left-4'}`}>
                        <span className={`${themeClasses.buttonPaddingSmall} rounded-full ${themeClasses.fontSize.subtitle} font-medium ${currentImage.type === 'event-banner' ? 'bg-yellow-500' :
                            currentImage.type === 'event-image' ? 'bg-blue-500' : 'bg-green-500'
                            } text-white`}>
                            {currentImage.type === 'event-banner' ? t('eventBanner') :
                                currentImage.type === 'event-image' ? t('eventGallery') : t('venue')}
                        </span>
                    </div>

                    {/* Controls */}
                    {images.length > 1 && (
                        <div className={`absolute ${themeClasses.compactMode ? 'top-3 right-3' : 'top-4 right-4'} flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <button
                                onClick={togglePlayPause}
                                className={`${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm`}
                                title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                            >
                                {isPlaying ? <Pause className={themeClasses.iconSize} /> : <Play className={themeClasses.iconSize} />}
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className={`${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm`}
                                title="View full size"
                            >
                                <ZoomIn className={themeClasses.iconSize} />
                            </button>
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm`}
                                title="Previous image"
                            >
                                <ChevronLeft className={themeClasses.iconSizeLarge} />
                            </button>
                            <button
                                onClick={goToNext}
                                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm`}
                                title="Next image"
                            >
                                <ChevronRight className={themeClasses.iconSizeLarge} />
                            </button>
                        </>
                    )}

                    {/* Dot Indicators */}
                    {images.length > 1 && (
                        <div className={`absolute ${themeClasses.compactMode ? 'bottom-3 right-3' : 'bottom-4 right-4'} flex space-x-2`}>
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`${themeClasses.compactMode ? 'w-2 h-2' : 'w-2 h-2'} rounded-full transition-all ${index === currentIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                    title={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Full Size View */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-6xl max-h-full">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {!imageError.has(currentIndex) ? (
                            <img
                                src={currentImage.url}
                                alt={currentImage.title}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        ) : (
                            <div className={`w-96 h-64 ${themeClasses.backgroundCard} rounded-lg flex items-center justify-center`}>
                                <div className={`text-center ${themeClasses.text}`}>
                                    <Image className={`${themeClasses.iconSizeLarge} mx-auto mb-2 opacity-50`} />
                                    <p>Image not available</p>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-4 left-4 text-white bg-black/50 rounded-lg p-3 max-w-md backdrop-blur-sm">
                            <h3 className={`${themeClasses.fontSize.heading} font-bold`}>{currentImage.title}</h3>
                            <p className="opacity-90 text-sm">{currentImage.subtitle}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const eventId = params.id as string;
    const { t } = useI18nContext();
    const toast = useToast();
    const [event, setEvent] = useState<Event | null>(null);
    const [venue, setVenue] = useState<Venue | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const [isLiked, setIsLiked] = useState(false);
    const [slideImages, setSlideImages] = useState<SlideImage[]>([]);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);

    const themeClasses = getThemeClasses(preferences);

    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
            fetchTicketTypes();
            loadCartFromStorage();
        }
    }, [eventId]);

    useEffect(() => {
        if (event) {
            fetchVenueDetails();
            generateSlideImages();
        }
    }, [event]);

    useEffect(() => {
        if (venue && event) {
            generateSlideImages();
        }
    }, [venue, event]);

    useEffect(() => {
        if (user) {
            loadUserPreferences();
        } else {
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
    }, [user]);

    useEffect(() => {
        if (themeClasses.isDarkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, [themeClasses.isDarkMode]);

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

    const generateSlideImages = () => {
        if (!event) return;

        const images: SlideImage[] = [];

        if (event.bannerImageUrl && event.bannerImageUrl !== 'NULL' && event.bannerImageUrl.trim() !== '') {
            const imageUrl = getImageUrl(event.bannerImageUrl);
            if (imageUrl) {
                images.push({
                    id: 'event-banner',
                    url: imageUrl,
                    title: event.title,
                    subtitle: 'Event Banner',
                    type: 'event-banner'
                });
            }
        }

        if (event.imageUrl &&
            event.imageUrl !== 'NULL' &&
            event.imageUrl.trim() !== '' &&
            event.imageUrl !== event.bannerImageUrl) {
            const imageUrl = getImageUrl(event.imageUrl);
            if (imageUrl) {
                images.push({
                    id: 'event-image',
                    url: imageUrl,
                    title: event.title,
                    subtitle: 'Event Image',
                    type: 'event-image'
                });
            }
        }

        if (venue &&
            venue.imageUrl &&
            venue.imageUrl !== 'NULL' &&
            venue.imageUrl.trim() !== '' &&
            !event.isOnline) {
            const imageUrl = getImageUrl(venue.imageUrl);
            if (imageUrl) {
                images.push({
                    id: 'venue-image',
                    url: imageUrl,
                    title: venue.name,
                    subtitle: `${venue.city}, ${venue.state}`,
                    type: 'venue'
                });
            }
        }

        setSlideImages(images);
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

    const getFullImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        const backendUrl = 'http://localhost:5251';
        return backendUrl + imageUrl;
    };

    const fetchVenueDetails = async () => {
        if (!event) return;

        try {
            const response = await fetch(`http://localhost:5251/api/venues/${event.venueId}`);
            if (response.ok) {
                const data = await response.json();
                setVenue(data);
            }
        } catch (error) {
        }
    };

    const loadCartFromStorage = () => {
        const saved = localStorage.getItem('eventCart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Handle both formats: plain array (old) or { eventId, items } (new)
                const items = Array.isArray(parsed) ? parsed : (parsed.items ?? []);
                setCart(items);
            } catch (error) {
                console.error('Failed to load cart from storage:', error);
            }
        }
    };

    const saveCartToStorage = (cartData: CartItem[]) => {
        const payload = { eventId: Number(eventId), items: cartData };
        localStorage.setItem('eventCart', JSON.stringify(payload));
    };

    const fetchEventDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5251/api/events/${eventId}`);
            if (response.ok) {
                const data = await response.json();
                setEvent(data);
            } else {
                setError('Event not found');
            }
        } catch (error) {
            setError('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketTypes = async () => {
        try {
            const response = await fetch(`http://localhost:5251/api/tickets/event/${eventId}/ticket-types`);
            if (response.ok) {
                const data = await response.json();
                setTicketTypes(data);
                const initialQuantities: { [key: number]: number } = {};
                data.forEach((ticket: TicketType) => {
                    initialQuantities[ticket.ticketTypeId] = 0;
                });
                setQuantities(initialQuantities);
            }
        } catch (error) {
        }
    };

    const updateQuantity = (ticketTypeId: number, change: number) => {
        const ticketType = ticketTypes.find(t => t.ticketTypeId === ticketTypeId);
        if (!ticketType) return;

        setQuantities(prev => {
            const currentQuantity = prev[ticketTypeId] || 0;
            const newQuantity = Math.max(0, Math.min(
                currentQuantity + change,
                Math.min(ticketType.maxQuantityPerOrder, ticketType.quantityRemaining)
            ));
            return { ...prev, [ticketTypeId]: newQuantity };
        });
    };

    const addToCart = (ticketType: TicketType) => {
        const quantity = quantities[ticketType.ticketTypeId] || 0;
        if (quantity === 0) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.ticketTypeId === ticketType.ticketTypeId);
            let newCart;

            if (existingItem) {
                newCart = prevCart.map(item =>
                    item.ticketTypeId === ticketType.ticketTypeId
                        ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxQuantity) }
                        : item
                );
            } else {
                newCart = [...prevCart, {
                    ticketTypeId: ticketType.ticketTypeId,
                    name: ticketType.name,
                    price: ticketType.price,
                    quantity,
                    maxQuantity: ticketType.maxQuantityPerOrder
                }];
            }

            saveCartToStorage(newCart);
            return newCart;
        });

        setQuantities(prev => ({ ...prev, [ticketType.ticketTypeId]: 0 }));
        toast.success('Added to cart!', `${quantity}× ${ticketType.name}`);
    };

    const updateCartQuantity = (ticketTypeId: number, newQuantity: number) => {
        if (newQuantity === 0) {
            setCart(prevCart => {
                const newCart = prevCart.filter(item => item.ticketTypeId !== ticketTypeId);
                saveCartToStorage(newCart);
                return newCart;
            });
        } else {
            setCart(prevCart => {
                const newCart = prevCart.map(item =>
                    item.ticketTypeId === ticketTypeId ? { ...item, quantity: newQuantity } : item
                );
                saveCartToStorage(newCart);
                return newCart;
            });
        }
    };

    const removeFromCart = (ticketTypeId: number) => {
        setCart(prevCart => {
            const newCart = prevCart.filter(item => item.ticketTypeId !== ticketTypeId);
            saveCartToStorage(newCart);
            return newCart;
        });
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const handlePurchase = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (cart.length === 0) {
            alert('Please add tickets to your cart first');
            return;
        }
        router.push(`/checkout?eventId=${eventId}`);
    };

    const formatDate = (dateString: string) => {
        if (preferences) {
            return formatEventDateOnly(dateString, preferences);
        }
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        if (preferences) {
            return formatEventTimeOnly(dateString, preferences);
        }
        // Fallback for when preferences aren't loaded yet
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const shareEvent = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event?.title,
                    text: event?.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Event link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${themeClasses.background} text-gray-100 selection:bg-neon-purple/30 selection:text-neon-purple font-sans transition-colors duration-500`}>
                <div className={`${themeClasses.backgroundCard} backdrop-blur-xl rounded-2xl ${themeClasses.paddingLarge} ${themeClasses.shadow} border ${themeClasses.borderCard}`}>
                    <div className="text-center">
                        <div className={`animate-spin rounded-full ${themeClasses.iconSizeLarge} border-b-2 border-neon-cyan mx-auto ${themeClasses.marginSmall}`}></div>
                        <p className={`${themeClasses.text} ${themeClasses.fontSize.heading}`}>{t('loadingevents')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${themeClasses.background} text-gray-100 selection:bg-neon-purple/30 selection:text-neon-purple font-sans transition-colors duration-500`}>
                <div className={`${themeClasses.backgroundCard} backdrop-blur-xl rounded-2xl ${themeClasses.paddingLarge} ${themeClasses.shadow} border ${themeClasses.borderCard}`}>
                    <div className="text-center">
                        <h1 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('eventNotFound')}</h1>
                        <p className={`${themeClasses.textSecondary} ${themeClasses.marginLarge}`}>{error}</p>
                        <button
                            onClick={() => router.push('/events')}
                            className={`${themeClasses.accent} ${themeClasses.accentHover} text-white ${themeClasses.buttonPadding} rounded-lg ${themeClasses.fontSize.button}`}
                        >
                            {t('backToEvents')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`pt-20 min-h-screen ${themeClasses.background} text-gray-100 selection:bg-neon-purple/30 selection:text-neon-purple font-sans transition-colors duration-500`}>
            {/* Back Button */}
            <div className={`${themeClasses.backgroundHeader} backdrop-blur-xl border-b ${themeClasses.borderCard}`}>
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${themeClasses.searchHeight}`}>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className={`flex items-center ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors ${themeClasses.fontSize.text}`}
                        >
                            <ArrowLeft className={`${themeClasses.iconSize} mr-2`} />
                            {t('backToEvents')}
                        </button>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`${themeClasses.paddingSmall} rounded-full transition-colors ${isLiked ? 'text-red-500' : `${themeClasses.textMuted} hover:text-red-500`}`}
                            >
                                <Heart className={`${themeClasses.iconSize} ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={shareEvent}
                                className={`${themeClasses.paddingSmall} rounded-full ${themeClasses.textMuted} hover:${themeClasses.accentText} transition-colors`}
                            >
                                <Share className={themeClasses.iconSize} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section with Slideshow */}
            <div className="relative">
                {slideImages.length > 0 ? (
                    <EventHeroSlideshow images={slideImages} autoPlay={true} themeClasses={themeClasses} />
                ) : (
                    // Fallback hero section when no images are available
                    <div className={`${themeClasses.compactMode ? 'h-64' : 'h-64 md:h-96'} bg-gradient-to-r ${themeClasses.accentGradient} flex items-center justify-center`}>
                        <Calendar className={`${themeClasses.compactMode ? 'h-16 w-16' : 'h-24 w-24'} text-white opacity-50`} />
                    </div>
                )}

                {/* Event Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/80 to-transparent pt-32 pb-8">
                    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
                        <div className="text-white">
                            <div className={`flex items-center ${themeClasses.marginSmall}`}>
                                <span className={`px-4 py-1.5 bg-neon-purple/80 backdrop-blur-md border border-neon-purple/50 text-white text-sm font-semibold rounded-full mr-4 shadow-[0_0_15px_rgba(139,92,246,0.5)]`}>
                                    {event.categoryName}
                                </span>
                                {event.isFeatured && (
                                    <div className="flex items-center">
                                        <Star className={`${themeClasses.iconSize} mr-1 fill-current text-yellow-400`} />
                                        <span className={themeClasses.fontSize.subtitle}>{t('featured')}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className={`${themeClasses.fontSize.hero} font-bold ${themeClasses.marginSmall} drop-shadow-lg`}>{event.title}</h1>
                            <div className={`flex flex-wrap items-center ${themeClasses.gap} ${themeClasses.fontSize.heading} drop-shadow`}>
                                <div className="flex items-center">
                                    <Calendar className={`${themeClasses.iconSize} mr-2`} />
                                    <span>{formatEventDateTime(event.startDateTime, preferences, { region: 'en-US' }, t)}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className={`${themeClasses.iconSize} mr-2`} />
                                    <span>{event.isOnline ? 'Online Event' : `${event.venueName}, ${event.venueCity}`}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${themeClasses.paddingLarge}`}>
                <div className={`grid grid-cols-1 lg:grid-cols-3 ${themeClasses.gap}`}>
                    {/* Event Details */}
                    <div className="lg:col-span-2">
                        <div className={`${themeClasses.backgroundCard} backdrop-blur-md rounded-2xl ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding} ${themeClasses.marginLarge}`}>
                            <h2 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('aboutThisEvent')}</h2>
                            <div className="prose max-w-none">
                                <p className={`${themeClasses.textSecondary} leading-relaxed whitespace-pre-line ${themeClasses.fontSize.text}`}>{event.description}</p>
                            </div>

                            {event.isOnline && event.onlineUrl && (
                                <div className={`${themeClasses.marginLarge} ${themeClasses.paddingSmall} ${themeClasses.accentLight} border ${themeClasses.accentBorder} rounded-xl backdrop-blur-sm`}>
                                    <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.accentText} ${themeClasses.marginSmall} flex items-center`}>
                                        <Globe className={`${themeClasses.iconSize} mr-2`} />
                                        {t('onlineEvent')}
                                    </h3>
                                    <p className={`${themeClasses.accentText} ${themeClasses.fontSize.text}`}>{t('onlineEventNote')}</p>
                                </div>
                            )}

                            {event.tags && (
                                <div className={themeClasses.marginLarge}>
                                    <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>Tags</h3>
                                    <div className={`flex flex-wrap ${themeClasses.gap}`}>
                                        {event.tags.split(',').map((tag, index) => (
                                            <span key={index} className={`${themeClasses.buttonPaddingSmall} ${themeClasses.backgroundInput} ${themeClasses.text} rounded-full ${themeClasses.fontSize.subtitle} backdrop-blur-sm border ${themeClasses.border}`}>
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Organizer Info */}
                        <div className={`${themeClasses.backgroundCard} backdrop-blur-md rounded-2xl ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding} ${themeClasses.marginLarge}`}>
                            <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('eventOrganizer')}</h3>
                            <div className="flex items-center">
                                <div className={`${themeClasses.iconSizeLarge} ${themeClasses.accentLight} rounded-full flex items-center justify-center backdrop-blur-sm`}>
                                    <Users className={`${themeClasses.iconSize} ${themeClasses.accentText}`} />
                                </div>
                                <div className="ml-4">
                                    <p className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>{event.organizerName}</p>
                                    <p className={`${themeClasses.textSecondary} ${themeClasses.fontSize.text}`}>{t('eventOrganizer')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Venue Info */}
                        {venue && !event.isOnline && (
                            <div className={`${themeClasses.backgroundCard} backdrop-blur-md rounded-2xl ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding}`}>
                                <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('venueInformation')}</h3>
                                <div className="flex items-start">
                                    <div className={`${themeClasses.iconSizeLarge} ${themeClasses.accentLight} rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm`}>
                                        <Building className={`${themeClasses.iconSize} ${themeClasses.accentText}`} />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className={`font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>{venue.name}</p>
                                        <p className={`${themeClasses.textSecondary} ${themeClasses.marginSmall} ${themeClasses.fontSize.text}`}>{venue.address}</p>
                                        <p className={`${themeClasses.textSecondary} ${themeClasses.marginSmall} ${themeClasses.fontSize.text}`}>{venue.city}, {venue.state} {venue.zipCode}</p>
                                        <div className={`flex items-center ${themeClasses.fontSize.subtitle} ${themeClasses.textMuted} ${themeClasses.marginSmall}`}>
                                            <Users className={`${themeClasses.iconSizeSmall} mr-1`} />
                                            <span>{t('capacity')}: {venue.capacity.toLocaleString()}</span>
                                        </div>
                                        {venue.website && (
                                            <a
                                                href={venue.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center ${themeClasses.accentText} hover:${themeClasses.accentHover} ${themeClasses.fontSize.subtitle} font-medium`}
                                            >
                                                <Globe className={`${themeClasses.iconSizeSmall} mr-1`} />
                                                {t('visitWebsite')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ticket Purchase Sidebar */}
                    <div className="lg:col-span-1">
                        <div className={`${themeClasses.backgroundCard} backdrop-blur-md rounded-2xl ${themeClasses.shadow} border ${themeClasses.borderCard} ${themeClasses.padding} sticky top-4`}>
                            {/* Cart Summary at top if items exist */}
                            {cart.length > 0 && (
                                <div className={`${themeClasses.marginLarge} ${themeClasses.paddingSmall} bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]`}>
                                    <div className={`flex items-center justify-between ${themeClasses.marginSmall}`}>
                                        <h4 className={`font-semibold text-neon-cyan flex items-center ${themeClasses.fontSize.text} drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]`}>
                                            <ShoppingCart className={`${themeClasses.iconSizeSmall} mr-2`} />
                                            {t('inYourCart')}
                                        </h4>
                                        <span className={`${themeClasses.fontSize.subtitle} text-cyan-200`}>{getTotalItems()} {t('items')}
                                        </span>
                                    </div>
                                    <div className={themeClasses.spacing}>
                                        {cart.map((item) => (
                                            <div key={item.ticketTypeId} className={`flex justify-between items-center ${themeClasses.fontSize.subtitle}`}>
                                                <span className="text-cyan-100">{item.name} x{item.quantity}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-neon-cyan">{convertAndFormatCurrency(item.price * item.quantity, event?.currency || 'USD', preferences, { region: 'en-US' })}</span>
                                                    <button
                                                        onClick={() => removeFromCart(item.ticketTypeId)}
                                                        className="text-neon-fuchsia hover:text-pink-400 text-xs transition-colors"
                                                    >
                                                        {t('remove')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-neon-cyan/20 pt-2 mt-2">
                                        <div className="flex justify-between font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                                            <span>{t('total')}: {convertAndFormatCurrency(getTotalPrice(), event?.currency || 'USD', preferences, { region: 'en-US' })}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h3 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.text} ${themeClasses.marginSmall}`}>{t('getTickets')}</h3>

                            {/* Event Stats */}
                            <div className={`grid grid-cols-2 ${themeClasses.gap} ${themeClasses.marginLarge}`}>
                                <div className={`text-center ${themeClasses.paddingSmall} bg-neon-purple/10 border border-neon-purple/30 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.1)]`}>
                                    <p className={`${themeClasses.fontSize.title} font-bold text-neon-purple drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]`}>{event.ticketsSold}</p>
                                    <p className={`${themeClasses.fontSize.subtitle} text-gray-300`}>{t('ticketsSold')}</p>
                                </div>
                                <div className={`text-center ${themeClasses.paddingSmall} bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]`}>
                                    <p className={`${themeClasses.fontSize.title} font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]`}>{event.availableTickets}</p>
                                    <p className={`${themeClasses.fontSize.subtitle} text-gray-300`}>{t('available')}</p>
                                </div>
                            </div>

                            {/* Ticket Types */}
                            <div className={themeClasses.spacing}>
                                {ticketTypes.length === 0 ? (
                                    <div className={`text-center ${themeClasses.paddingLarge}`}>
                                        <p className={`${themeClasses.textSecondary} ${themeClasses.fontSize.text}`}>{t('noTicketsAvailable')}</p>
                                    </div>
                                ) : (
                                    ticketTypes.map((ticketType) => (
                                        <div key={ticketType.ticketTypeId} className={`border ${themeClasses.border} rounded-xl ${themeClasses.paddingSmall} ${themeClasses.backgroundInput} backdrop-blur-sm`}>
                                            <div className={`flex justify-between items-start ${themeClasses.marginSmall}`}>
                                                <div className="flex-1">
                                                    <h4 className={`font-semibold ${themeClasses.text} ${themeClasses.fontSize.text}`}>{ticketType.name}</h4>
                                                    {ticketType.description && (
                                                        <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} mt-1`}>{ticketType.description}</p>
                                                    )}
                                                </div>
                                                <p className={`${themeClasses.fontSize.heading} font-bold ${themeClasses.text} ml-4`}>
                                                    {convertAndFormatCurrency(ticketType.price, event?.currency || 'USD', preferences, { region: 'en-US' })}
                                                </p>
                                            </div>

                                            <div className={`flex justify-between items-center ${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} ${themeClasses.marginSmall}`}>
                                                <span>{ticketType.quantityRemaining} {t('remaining')}</span>
                                                <span>{t('maxPerOrder', { max: ticketType.maxQuantityPerOrder })}</span>
                                            </div>

                                            {ticketType.isOnSale && ticketType.quantityRemaining > 0 ? (
                                                <div className={themeClasses.spacing}>
                                                    {/* Quantity Selector */}
                                                    <div className="flex items-center justify-between">
                                                        <span className={`${themeClasses.fontSize.subtitle} font-medium ${themeClasses.text}`}>{t('quantity')}:</span>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => updateQuantity(ticketType.ticketTypeId, -1)}
                                                                disabled={quantities[ticketType.ticketTypeId] === 0}
                                                                className={`${themeClasses.iconSizeLarge} border ${themeClasses.border} rounded flex items-center justify-center ${themeClasses.textMuted} ${themeClasses.hover} disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
                                                            >
                                                                <Minus className={themeClasses.iconSizeSmall} />
                                                            </button>
                                                            <span className={`w-8 text-center font-medium ${themeClasses.text} ${themeClasses.fontSize.text}`}>
                                                                {quantities[ticketType.ticketTypeId] || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(ticketType.ticketTypeId, 1)}
                                                                disabled={quantities[ticketType.ticketTypeId] >= Math.min(ticketType.maxQuantityPerOrder, ticketType.quantityRemaining)}
                                                                className={`${themeClasses.iconSizeLarge} border ${themeClasses.border} rounded flex items-center justify-center ${themeClasses.textMuted} ${themeClasses.hover} disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
                                                            >
                                                                <Plus className={themeClasses.iconSizeSmall} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Add to Cart Button */}
                                                    <button
                                                        onClick={() => addToCart(ticketType)}
                                                        disabled={quantities[ticketType.ticketTypeId] === 0}
                                                        className={`w-full ${themeClasses.accent} ${themeClasses.accentHover} shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:bg-[#0a0f1c]/50 disabled:border-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold ${themeClasses.buttonPadding} rounded-lg transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${themeClasses.fontSize.text}`}
                                                    >
                                                        <ShoppingCart className={`${themeClasses.iconSizeSmall} mr-2`} />
                                                        {t('addToCart')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    disabled
                                                    className={`w-full bg-[#0a0f1c]/50 border border-gray-700 text-gray-500 ${themeClasses.buttonPadding} rounded-lg cursor-not-allowed backdrop-blur-sm ${themeClasses.fontSize.text}`}
                                                >
                                                    {ticketType.quantityRemaining === 0 ? t('soldOut') : t('notAvailable')}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Purchase Button */}
                            {cart.length > 0 && (
                                <div className={`${themeClasses.marginLarge} pt-6 border-t ${themeClasses.border}`}>
                                    <button
                                        onClick={handlePurchase}
                                        className={`w-full bg-neon-cyan/90 hover:bg-neon-cyan text-[#0a0f1c] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] font-bold ${themeClasses.buttonPadding} rounded-xl transition-all duration-300 flex items-center justify-center ${themeClasses.fontSize.heading} transform hover:-translate-y-1 backdrop-blur-sm`}
                                    >
                                        <ShoppingCart className={`${themeClasses.iconSize} mr-2`} />
                                        {t('proceedToCheckout')}
                                    </button>
                                    <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} text-center mt-2`}>
                                        {t('total')}: {convertAndFormatCurrency(getTotalPrice(), event?.currency || 'USD', preferences, { region: 'en-US' })} ({getTotalItems()} {t('tickets')})
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}