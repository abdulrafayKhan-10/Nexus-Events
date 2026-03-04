/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api';
import {
    Calendar,
    Search,
    MapPin,
    Clock,
    Filter,
    Star,
    Users,
    Ticket,
    Heart,
    Share,
    Music,
    Briefcase,
    X,
    TrendingUp,
    Award,
    Zap,
    Target,
    Building,
    MapIcon,
    CheckCircle,
    Timer,
    DollarSign,
    Eye,
    ArrowRight,
    Flame,
    Trophy,
    Globe,
    Camera,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    ZoomIn,
    Image
} from 'lucide-react';
import Link from 'next/link';
import { useI18nContext } from '@/components/providers/I18nProvider';
import { useI18n } from '../../hooks/useSafeI18n';

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
    currency: string;
    isOnline: boolean;
    onlineUrl?: string;
    ticketsSold: number;
    availableTickets: number;
}

interface Category {
    categoryId: number;
    name: string;
    description: string;
    iconUrl?: string;
    isActive: boolean;
    eventCount: number;
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

interface SlideshowImage {
    id: string;
    url: string;
    title: string;
    subtitle: string;
    description?: string;
    type: 'featured-banner' | 'event-image' | 'venue' | 'upcoming';
    eventId?: number;
    venueId?: number;
}

interface UserPreferences {
    emailNotifications?: boolean;  // Add ? to make it optional
    sessionTimeout?: number;       // Add ? to make it optional
    theme?: string;               // Add ? to make it optional
    language?: string;            // Add ? to make it optional
    dateFormat?: string;          // Add ? to make it optional
    timeFormat?: string;          // Add ? to make it optional
    defaultTimeZone?: string;
    accentColor?: string;
    fontSize?: string;
    compactMode?: boolean;
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
}

// Enhanced theming system from profile page
const getThemeClasses = (preferences: UserPreferences | null) => {
    // ALWAYS force dark mode to "Deep Space Premium"
    const isDarkMode = true;

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
            ring: 'focus:ring-blue-500 focus:border-blue-500',
            gradient: 'from-blue-600 to-blue-700'
        },
        purple: {
            primary: 'bg-purple-600',
            hover: 'hover:bg-purple-700',
            light: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
            text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
            border: isDarkMode ? 'border-purple-700' : 'border-purple-200',
            ring: 'focus:ring-purple-500 focus:border-purple-500',
            gradient: 'from-purple-600 to-purple-700'
        },
        green: {
            primary: 'bg-green-600',
            hover: 'hover:bg-green-700',
            light: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
            text: isDarkMode ? 'text-green-400' : 'text-green-600',
            border: isDarkMode ? 'border-green-700' : 'border-green-200',
            ring: 'focus:ring-green-500 focus:border-green-500',
            gradient: 'from-green-600 to-green-700'
        },
        orange: {
            primary: 'bg-orange-600',
            hover: 'hover:bg-orange-700',
            light: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
            text: isDarkMode ? 'text-orange-400' : 'text-orange-600',
            border: isDarkMode ? 'border-orange-700' : 'border-orange-200',
            ring: 'focus:ring-orange-500 focus:border-orange-500',
            gradient: 'from-orange-600 to-orange-700'
        },
        pink: {
            primary: 'bg-pink-600',
            hover: 'hover:bg-pink-700',
            light: isDarkMode ? 'bg-pink-900/20' : 'bg-pink-50',
            text: isDarkMode ? 'text-pink-400' : 'text-pink-600',
            border: isDarkMode ? 'border-pink-700' : 'border-pink-200',
            ring: 'focus:ring-pink-500 focus:border-pink-500',
            gradient: 'from-pink-600 to-pink-700'
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
        // Basic colors - PREMIUM DARK THEME
        background: 'bg-dark-900 bg-dark-gradient',
        backgroundCard: 'bg-dark-800/40 backdrop-blur-xl',
        backgroundSidebar: 'bg-dark-800/60 backdrop-blur-xl',
        backgroundInput: 'bg-dark-900/50 backdrop-blur-md',
        backgroundHeader: 'bg-dark-900/80 backdrop-blur-md',
        backgroundFooter: 'bg-dark-900',

        // Text colors
        text: 'text-gray-100',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        textHero: 'text-white',

        // Borders
        border: 'border-white/10',
        borderCard: 'border-white/10',

        // Effects
        shadow: 'shadow-2xl shadow-neon-purple/5 hover:shadow-neon-cyan/10',
        hover: 'hover:bg-white/5 hover:border-white/20 transition-all duration-300',

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

        // Accent colors (using neon accents where applicable)
        accent: 'bg-neon-purple/80 backdrop-blur-md',
        accentHover: 'hover:bg-neon-purple hover:shadow-[0_0_15px_rgba(188,19,254,0.5)]',
        accentText: 'text-neon-cyan',
        accentLight: 'bg-neon-cyan/10',
        accentBorder: 'border-neon-cyan/50',
        accentRing: 'focus:ring-neon-purple/50 focus:border-neon-purple/50',
        accentGradient: 'from-neon-purple to-neon-cyan',

        // State info
        isDarkMode: true, // Force dark mode for premium feel
        accentColor,
        fontSizeValue: fontSize,
        compactMode
    };
};

// Helper function to get timezone abbreviations
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

// ADD this function right after the getTimeZoneAbbreviation function (around line 497):

const formatEventDateTime = (dateTimeString: string, preferences: UserPreferences | null, currentLangData: any, t: any) => {
    const eventDate = new Date(dateTimeString);
    const userTimeZone = preferences?.defaultTimeZone || 'UTC';
    const dateFormat = preferences?.dateFormat || 'MM/dd/yyyy';
    const timeFormat = preferences?.timeFormat || '12h';



    // Create date in user's timezone
    const zonedDate = new Date(eventDate.toLocaleString("en-US", { timeZone: userTimeZone }));

    // Extract date components
    const year = zonedDate.getFullYear();
    const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
    const day = String(zonedDate.getDate()).padStart(2, '0');

    // Month names for text formats
    const monthNames = [
        t('jan'), t('feb'), t('mar'), t('apr'),
        t('may'), t('jun'), t('jul'), t('aug'),
        t('sep'), t('oct'), t('nov'), t('dec')
    ];
    const monthShort = monthNames[zonedDate.getMonth()];

    // Weekday names
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

// Helper component for category icons
const CategoryIcon = ({ categoryName }: { categoryName: string }) => {
    const name = categoryName.toLowerCase();
    const iconClass = "h-6 w-6 text-white";

    if (name.includes('music')) {
        return <Music className={iconClass} />;
    } else if (name.includes('business') || name.includes('conference') || name.includes('corporate')) {
        return <Briefcase className={iconClass} />;
    } else if (name.includes('sport') || name.includes('fitness')) {
        return <Trophy className={iconClass} />;
    } else if (name.includes('art') || name.includes('culture')) {
        return <Award className={iconClass} />;
    } else {
        return <Calendar className={iconClass} />;
    }
};


// Enhanced Image Slideshow Component with theming
const EventGallerySlideshow = ({ images, autoPlay = true, themeClasses }: {
    images: SlideshowImage[],
    autoPlay?: boolean,
    themeClasses: any
}) => {
    const { t } = useI18nContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [showModal, setShowModal] = useState(false);
    const [imageError, setImageError] = useState<Set<number>>(new Set());

    const formatCurrencyWithUserPreference = (amount: number, preferences: UserPreferences | null, currentLangData: any) => {
        const currency = preferences?.currency || 'USD';
        const locale = currentLangData?.region || 'en-US';

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
                'EUR': '�',
                'GBP': '�',
                'JPY': '�'
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

    // Get currency symbol for display purposes
    const getCurrencySymbol = (currency: string) => {
        const symbols: { [key: string]: string } = {
            'USD': '$',  // US Dollar
            'EUR': '�',  // Euro
            'GBP': '�',  // British Pound
            'JPY': '�'   // Japanese Yen
        };

        return symbols[currency] || '$';
    };


    useEffect(() => {
        if (!isPlaying || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 5000);

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
            <div className={`w-full ${themeClasses.compactMode ? 'h-80' : 'h-96'} ${themeClasses.accentGradient} bg-gradient-to-r rounded-2xl flex items-center justify-center`}>
                <div className="text-center text-white">
                    <Camera className={`${themeClasses.compactMode ? 'h-12 w-12' : 'h-16 w-16'} mx-auto mb-4 opacity-50`} />
                    <p className={`${themeClasses.fontSize.heading}`}>{t('noimagesavailable')}</p>
                </div>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <>
            <div className={`relative w-full ${themeClasses.compactMode ? 'h-80' : 'h-96'} rounded-2xl overflow-hidden ${themeClasses.shadow} group ${themeClasses.backgroundCard}`}>
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
                        <div className={`w-full h-full ${themeClasses.accentGradient} bg-gradient-to-r flex items-center justify-center`}>
                            <div className="text-center text-white">
                                <Image className={`${themeClasses.iconSizeLarge} mx-auto mb-2 opacity-50`} />
                                <p className={themeClasses.fontSize.text}>{t('noimagesavailable')}</p>
                            </div>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Image Info */}
                    <div className={`absolute ${themeClasses.compactMode ? 'bottom-4 left-4' : 'bottom-6 left-6'} text-white max-w-lg`}>
                        <div className={`flex items-center ${themeClasses.compactMode ? 'mb-2' : 'mb-3'}`}>
                            <span className={`${themeClasses.buttonPaddingSmall} rounded-full ${themeClasses.fontSize.subtitle} font-medium mr-4 ${currentImage.type === 'featured-banner' ? 'bg-yellow-500' :
                                currentImage.type === 'event-image' ? 'bg-blue-500' :
                                    currentImage.type === 'venue' ? 'bg-green-500' : 'bg-orange-500'
                                }`}>
                                {currentImage.type === 'featured-banner' ? 'Featured' :
                                    currentImage.type === 'event-image' ? 'Event' :
                                        currentImage.type === 'venue' ? 'Venue' : 'This Week'}
                            </span>
                            <span className={`${themeClasses.fontSize.subtitle} opacity-75`}>
                                {currentIndex + 1} of {images.length}
                            </span>
                        </div>
                        <h3 className={`${themeClasses.fontSize.title} font-bold ${themeClasses.compactMode ? 'mb-1' : 'mb-2'} line-clamp-2`}>{currentImage.title}</h3>
                        <p className={`${themeClasses.fontSize.heading} opacity-90 line-clamp-2`}>{currentImage.subtitle}</p>
                        {currentImage.description && (
                            <p className={`${themeClasses.fontSize.text} opacity-75 ${themeClasses.compactMode ? 'mt-1' : 'mt-2'} line-clamp-2`}>{currentImage.description}</p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className={`absolute ${themeClasses.compactMode ? 'top-4 right-4' : 'top-6 right-6'} flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button
                            onClick={togglePlayPause}
                            className={`${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors`}
                            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                        >
                            {isPlaying ? <Pause className={themeClasses.iconSize} /> : <Play className={themeClasses.iconSize} />}
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className={`${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors`}
                            title="View full size"
                        >
                            <ZoomIn className={themeClasses.iconSize} />
                        </button>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all`}
                                title="Previous image"
                            >
                                <ChevronLeft className={themeClasses.iconSizeLarge} />
                            </button>
                            <button
                                onClick={goToNext}
                                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${themeClasses.paddingSmall} bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all`}
                                title="Next image"
                            >
                                <ChevronRight className={themeClasses.iconSizeLarge} />
                            </button>
                        </>
                    )}

                    {/* Dot Indicators */}
                    {images.length > 1 && (
                        <div className={`absolute ${themeClasses.compactMode ? 'bottom-4 right-4' : 'bottom-6 right-6'} flex space-x-2`}>
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`${themeClasses.compactMode ? 'w-2 h-2' : 'w-3 h-3'} rounded-full transition-all ${index === currentIndex
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

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className={`flex space-x-4 ${themeClasses.compactMode ? 'mt-4' : 'mt-6'} overflow-x-auto pb-2`}>
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`flex-shrink-0 ${themeClasses.compactMode ? 'w-20 h-12' : 'w-24 h-16'} rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                ? `${themeClasses.accentBorder} scale-110 ${themeClasses.shadow}`
                                : `${themeClasses.border} hover:${themeClasses.accentBorder} opacity-75 hover:opacity-100`
                                }`}
                            title={image.title}
                        >
                            {!imageError.has(index) ? (
                                <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(index)}
                                />
                            ) : (
                                <div className={`w-full h-full ${themeClasses.backgroundCard} flex items-center justify-center`}>
                                    <Image className={`${themeClasses.iconSizeSmall} ${themeClasses.textMuted}`} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal for Full Size View */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-7xl max-h-full">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
                            title="Close"
                        >
                            <X className="h-6 w-6" />
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

                        <div className="absolute bottom-4 left-4 text-white bg-black/50 rounded-lg p-4 max-w-md backdrop-blur-sm">
                            <h3 className={`${themeClasses.fontSize.heading} font-bold`}>{currentImage.title}</h3>
                            <p className="opacity-90">{currentImage.subtitle}</p>
                            {currentImage.description && (
                                <p className={`${themeClasses.fontSize.text} opacity-75 mt-1`}>{currentImage.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};




export default function EventsHomepage() {
    const { t } = useI18nContext();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const { formatCurrency, currentLangData } = useI18n();
    // State management
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('date');
    const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());
    const [slideshowImages, setSlideshowImages] = useState<SlideshowImage[]>([]);
    const [myTicketCount, setMyTicketCount] = useState<number>(0);

    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const themeClasses = getThemeClasses(preferences);

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
                'EUR': '�',
                'GBP': '�',
                'JPY': '�'
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

        // Add debugging
        console.log('?? Converting:', amount, fromCurrency, '?', userCurrency);

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

    const loadUserPreferences = async () => {
        try {
            const prefsData = await userApi.getPreferences();

            // Add extra debugging
            console.log('?? Raw preferences from API:', prefsData);
            console.log('?? Currency from API:', prefsData.currency);

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

    console.log('?? Debug - Current preferences:', preferences);
    console.log('?? Debug - User currency:', preferences?.currency);

    // 2. SECOND: Add this useEffect with your other useEffects (around line 355-365)
    useEffect(() => {
        if (user) {
            fetchMyTicketCount();
        }
    }, [user]);

    useEffect(() => {
        fetchEvents();
        fetchCategories();
        fetchVenues();
        loadLikedEvents();
    }, []);

    useEffect(() => {
        // Generate slideshow images when data is loaded
        if (events.length > 0 && venues.length > 0) {
            generateSlideshowImages();
        }
    }, [events, venues]);

    useEffect(() => {
        if (user) {
            fetchMyTicketCount();
            loadUserPreferences();
        } else {
            // Set default preferences for non-logged in users
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
                currency: 'USD' // Default currency
            });
        }
    }, [user]);

    // Regenerate slideshow when preferences change
    useEffect(() => {
        if (events.length > 0 && venues.length > 0 && preferences) {
            console.log('?? Regenerating slideshow with new preferences:', preferences.currency);
            generateSlideshowImages();
        }
    }, [preferences]);

    // Apply theme to document body
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (themeClasses.isDarkMode) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
            }
        }
    }, [themeClasses.isDarkMode]);


    const getFullImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return '';

        // If it's already a full URL, return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }

        // Construct full URL with your backend domain
        const backendUrl = 'http://localhost:5251'; // Your backend URL
        return backendUrl + imageUrl;
    };

    const fetchMyTicketCount = async () => {
        try {
            const response = await fetch('http://localhost:5251/api/tickets/my-tickets/count', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMyTicketCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching ticket count:', error);
        }
    };

    const generateSlideshowImages = () => {
        const images: SlideshowImage[] = [];

        // Add featured event banners first (highest priority)
        const featuredEvents = events.filter(event =>
            event.isFeatured &&
            event.isPublished &&
            (event.bannerImageUrl || event.imageUrl)
        );

        featuredEvents.slice(0, 5).forEach(event => {
            const imageUrl = getImageUrl(event.bannerImageUrl || event.imageUrl);
            if (imageUrl) {
                images.push({
                    id: `featured-${event.eventId}`,
                    url: imageUrl,
                    title: event.title,
                    subtitle: `${formatEventDateTime(event.startDateTime, preferences, currentLangData, t)} � ${event.venueName}`,
                    description: `${event.shortDescription || event.description.substring(0, 100)}... � ${t('from')} ${convertAndFormatCurrency(event.basePrice, event.currency, preferences, currentLangData)}`,
                    type: 'featured-banner',
                    eventId: event.eventId
                });
            }
        });

        // Add upcoming events happening this week
        const upcomingEvents = events.filter(event => {
            const daysUntil = getDaysUntilEvent(event.startDateTime);
            return daysUntil <= 7 && daysUntil >= 0 && event.isPublished && (event.bannerImageUrl || event.imageUrl);
        });

        upcomingEvents.slice(0, 4).forEach(event => {
            const daysUntil = getDaysUntilEvent(event.startDateTime);
            const imageUrl = getImageUrl(event.bannerImageUrl || event.imageUrl);
            if (imageUrl) {
                images.push({
                    id: `upcoming-${event.eventId}`,
                    url: imageUrl,
                    title: event.title,
                    subtitle: `${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`} at ${formatEventTimeOnly(event.startDateTime, preferences)}`,
                    description: `${event.isOnline ? t('onlineEvent') : event.venueName} � ${event.ticketsSold} ${t('ticketsSold')}`,
                    type: 'upcoming',
                    eventId: event.eventId
                });
            }
        });

        // Add regular published events
        const regularEvents = events.filter(event =>
            !event.isFeatured &&
            event.isPublished &&
            (event.bannerImageUrl || event.imageUrl) &&
            !upcomingEvents.some(ue => ue.eventId === event.eventId)
        );


        regularEvents.slice(0, 6).forEach(event => {
            const imageUrl = getImageUrl(event.bannerImageUrl || event.imageUrl);
            if (imageUrl) {
                images.push({
                    id: `event-${event.eventId}`,
                    url: imageUrl,
                    title: event.title,
                    subtitle: `${event.categoryName} � ${t('by')} ${event.organizerName}`,
                    description: `${event.availableTickets} ${t('ticketsavailable')} � ${event.venueCity}`,
                    type: 'event-image',
                    eventId: event.eventId
                });
            }
        });

        // Add popular venues
        const venuesWithImages = venues
            .filter(venue => venue.imageUrl && venue.isActive)
            .sort((a, b) => (b.eventCount || 0) - (a.eventCount || 0));

        venuesWithImages.slice(0, 4).forEach(venue => {
            const imageUrl = getImageUrl(venue.imageUrl);
            if (imageUrl) {
                images.push({
                    id: `venue-${venue.venueId}`,
                    url: imageUrl,
                    title: venue.name,
                    subtitle: `${venue.city}, ${venue.state}`,
                    description: `${t('capacity')}: ${venue.capacity.toLocaleString()} � ${venue.eventCount || 0} ${t('eventsHosted')}`,
                    type: 'venue',
                    venueId: venue.venueId
                });
            }
        });

        setSlideshowImages(images);
    };

    const filteredEvents = events.filter(event => {
        if (!event.isPublished) return false;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                (event.title || '').toLowerCase().includes(searchLower) ||
                (event.description || '').toLowerCase().includes(searchLower) ||
                (event.tags || '').toLowerCase().includes(searchLower) ||
                (event.organizerName || '').toLowerCase().includes(searchLower) ||
                (event.venueName || '').toLowerCase().includes(searchLower)
            );
            if (!matchesSearch) return false;
        }
        if (selectedCategoryId && event.categoryId !== selectedCategoryId) return false;
        // Price filter
        if (priceFilter === 'free' && event.basePrice > 0) return false;
        if (priceFilter === 'under50' && (event.basePrice === 0 || event.basePrice > 50)) return false;
        if (priceFilter === '50to100' && (event.basePrice < 50 || event.basePrice > 100)) return false;
        if (priceFilter === 'over100' && event.basePrice < 100) return false;
        // Date filter (inlined to avoid TDZ with const getDaysUntilEvent below)
        if (dateFilter !== 'all') {
            const diffDays = Math.ceil((new Date(event.startDateTime).getTime() - Date.now()) / 86400000);
            if (dateFilter === 'today' && diffDays !== 0) return false;
            if (dateFilter === 'week' && (diffDays < 0 || diffDays > 7)) return false;
            if (dateFilter === 'month' && (diffDays < 0 || diffDays > 30)) return false;
        }
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
        // Default: soonest first
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

    const loadLikedEvents = () => {
        const saved = localStorage.getItem('likedEvents');
        if (saved) {
            setLikedEvents(new Set(JSON.parse(saved)));
        }
    };

    const toggleLike = (eventId: number) => {
        const newLikedEvents = new Set(likedEvents);
        if (newLikedEvents.has(eventId)) {
            newLikedEvents.delete(eventId);
        } else {
            newLikedEvents.add(eventId);
        }
        setLikedEvents(newLikedEvents);
        localStorage.setItem('likedEvents', JSON.stringify([...newLikedEvents]));
    };

    const sampleEvents: Event[] = [
        {
            eventId: 9001,
            title: 'Neon Nights Festival',
            description: 'Live DJs, immersive visuals, and late-night food courts.',
            shortDescription: 'Electronic + visual arts showcase.',
            organizerId: 1,
            organizerName: 'Nexus Collective',
            venueId: 1001,
            venueName: 'Aurora Grand Hall',
            venueCity: 'Neo City',
            categoryId: 1,
            categoryName: 'Music',
            startDateTime: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 7 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
            imageUrl: '/placeholder-event.jpg',
            bannerImageUrl: '/placeholder-event.jpg',
            status: 'Published',
            isPublished: true,
            isFeatured: true,
            createdAt: new Date().toISOString(),
            tags: 'festival, music, edm',
            maxAttendees: 22000,
            basePrice: 79,
            currency: 'USD',
            isOnline: false,
            ticketsSold: 5400,
            availableTickets: 16600
        },
        {
            eventId: 9002,
            title: 'Galactic Dev Summit',
            description: 'Two-day conference on AI, web, and immersive tech.',
            shortDescription: 'Keynotes, workshops, expo.',
            organizerId: 2,
            organizerName: 'Orbit Labs',
            venueId: 1003,
            venueName: 'Pulse Arena',
            venueCity: 'Byte Harbor',
            categoryId: 2,
            categoryName: 'Tech',
            startDateTime: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
            endDateTime: new Date(Date.now() + 14 * 24 * 3600 * 1000 + 8 * 3600 * 1000).toISOString(),
            imageUrl: '/placeholder-event.jpg',
            bannerImageUrl: '/placeholder-event.jpg',
            status: 'Published',
            isPublished: true,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            tags: 'conference, tech, ai',
            maxAttendees: 12000,
            basePrice: 199,
            currency: 'USD',
            isOnline: false,
            ticketsSold: 6200,
            availableTickets: 5800
        }
    ];

    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:5251/api/events');
            if (response.ok) {
                const data = await response.json();
                setEvents(data.length > 0 ? data : sampleEvents);
            } else {
                setEvents(sampleEvents);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
            setEvents(sampleEvents);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5251/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await fetch('http://localhost:5251/api/venues');
            if (response.ok) {
                const data = await response.json();
                setVenues(data);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategoryId(null);
        setPriceFilter('all');
        setDateFilter('all');
        setSortBy('date');
        setShowFilters(false);
    };


    const getDaysUntilEvent = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getVenueInfo = (venueId: number) => {
        return venues.find(v => v.venueId === venueId);
    };

    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl) return null;

        // Handle full URLs
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // Handle relative paths from your LocalImageStorageService
        if (imageUrl.startsWith('/')) {
            return `http://localhost:5251${imageUrl}`;
        }

        // Handle paths without leading slash
        return `http://localhost:5251/${imageUrl}`;
    };

    const shareEvent = async (event: Event) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: event.shortDescription || event.description,
                    url: `${window.location.origin}/events/${event.eventId}`,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/events/${event.eventId}`);
            alert('Event link copied to clipboard!');
        }
    };

    const getCurrencySymbol = (currency: string) => {
        const symbols: { [key: string]: string } = {
            'USD': '$',  // US Dollar
            'EUR': '�',  // Euro
            'GBP': '�',  // British Pound
            'JPY': '�'   // Japanese Yen
        };

        return symbols[currency] || '$'; // Default to $ if currency not found
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                    <p className="text-gray-600 text-xl">{t('loadingevents')}</p>
                </div>
            </div>
        );
    }


    const featuredEvents = filteredEvents.filter(event => event.isFeatured);
    const upcomingEvents = filteredEvents.filter(event =>
        getDaysUntilEvent(event.startDateTime) <= 7 &&
        getDaysUntilEvent(event.startDateTime) >= 0
    );
    const popularVenues = venues
        .filter(venue => venue.isActive)
        .sort((a, b) => (b.eventCount || 0) - (a.eventCount || 0))
        .slice(0, 6);

    return (

        <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-purple-500/30 selection:text-purple-300 font-sans transition-colors duration-500 relative overflow-hidden">
            {/* Animated Background Gradients similar to index */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>

            {/* Main Content */}
            <main className="relative z-10 pt-16">
                <div>
                    <div className="max-w-2xl mx-auto px-6 mt-8">
                        {/* Search Bar - Maintained for functionality */}
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${themeClasses.iconSize} text-gray-400`} />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-14 pr-20 ${themeClasses.compactMode ? 'py-3' : 'py-4'} text-sm text-white ${themeClasses.backgroundInput} backdrop-blur-sm border ${themeClasses.borderCard} rounded-2xl ${themeClasses.accentRing} ${themeClasses.shadow}`}
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.buttonPadding} ${themeClasses.accent} ${themeClasses.accentHover} text-white rounded-xl flex items-center space-x-2 transition-colors backdrop-blur-sm`}
                            >
                                <Filter className={themeClasses.iconSizeSmall} />
                                <span>{t('filters')}</span>
                            </button>
                        </div>

                        {showFilters && (
                            <div className={`mt-4 ${themeClasses.backgroundCard} backdrop-blur-sm border ${themeClasses.borderCard} rounded-2xl p-5 ${themeClasses.shadow} space-y-4`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-semibold text-sm">Filters</span>
                                    <button onClick={clearFilters} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
                                        Clear all
                                    </button>
                                </div>

                                {/* Category */}
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Category</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCategoryId(null)}
                                            className={`px-3 py-1.5 rounded-lg text-xs border ${themeClasses.borderCard} ${selectedCategoryId === null ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300' : 'text-white/70 hover:bg-white/10'} transition-colors`}
                                        >
                                            All
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.categoryId}
                                                onClick={() => setSelectedCategoryId(cat.categoryId)}
                                                className={`px-3 py-1.5 rounded-lg text-xs border ${themeClasses.borderCard} ${selectedCategoryId === cat.categoryId ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300' : 'text-white/70 hover:bg-white/10'} transition-colors`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Date</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[{v:'all',label:'Any Date'},{v:'today',label:'Today'},{v:'week',label:'This Week'},{v:'month',label:'This Month'}].map(opt => (
                                            <button
                                                key={opt.v}
                                                onClick={() => setDateFilter(opt.v)}
                                                className={`px-3 py-1.5 rounded-lg text-xs border ${themeClasses.borderCard} ${dateFilter === opt.v ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'text-white/70 hover:bg-white/10'} transition-colors`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Price</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[{v:'all',label:'Any Price'},{v:'free',label:'Free'},{v:'under50',label:'Under $50'},{v:'50to100',label:'$50–$100'},{v:'over100',label:'$100+'}].map(opt => (
                                            <button
                                                key={opt.v}
                                                onClick={() => setPriceFilter(opt.v)}
                                                className={`px-3 py-1.5 rounded-lg text-xs border ${themeClasses.borderCard} ${priceFilter === opt.v ? 'bg-green-500/30 border-green-500/50 text-green-300' : 'text-white/70 hover:bg-white/10'} transition-colors`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Sort By</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[{v:'date',label:'Soonest First'},{v:'price_asc',label:'Price: Low → High'},{v:'price_desc',label:'Price: High → Low'}].map(opt => (
                                            <button
                                                key={opt.v}
                                                onClick={() => setSortBy(opt.v)}
                                                className={`px-3 py-1.5 rounded-lg text-xs border ${themeClasses.borderCard} ${sortBy === opt.v ? 'bg-orange-500/30 border-orange-500/50 text-orange-300' : 'text-white/70 hover:bg-white/10'} transition-colors`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
                    {/* All Events Grid */}
                    <div className={themeClasses.marginSection}>
                        <div className={`text-center ${themeClasses.marginLarge}`}>
                            <h2 className={`${themeClasses.fontSize.section} font-bold text-white ${themeClasses.marginSmall} drop-shadow-lg`}>
                                {searchTerm ? `${t('searchResults')} (${filteredEvents.length})` : `${t('allEvents')} (${filteredEvents.length})`}
                            </h2>
                            <p className={`text-white/80 ${themeClasses.fontSize.heading} drop-shadow`}>
                                {searchTerm ? t('resultsFor', { term: searchTerm }) : t('exploreAllEvents')}
                            </p>
                        </div>

                        {filteredEvents.length === 0 ? (
                            <div className={`text-center ${themeClasses.paddingSection} ${themeClasses.backgroundCard} backdrop-blur-sm rounded-3xl border ${themeClasses.borderCard} ${themeClasses.shadow}`}>
                                <Calendar className={`${themeClasses.iconSizeLarge} text-white/50 mx-auto ${themeClasses.marginLarge}`} />
                                <h3 className={`${themeClasses.fontSize.title} font-semibold text-white ${themeClasses.marginSmall} drop-shadow`}>
                                    {searchTerm ? t('noEventsFound') : t('noEventsAvailable')}
                                </h3>
                                <p className={`text-white/80 ${themeClasses.marginLarge} ${themeClasses.fontSize.heading} drop-shadow`}>
                                    {searchTerm ? t('adjustSearchOrFilterCriteria') : t('eventsWillAppearSoon')}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={clearFilters}
                                        className={`${themeClasses.backgroundCard} ${themeClasses.hover} text-white ${themeClasses.buttonPadding} rounded-2xl transition-colors backdrop-blur-sm border ${themeClasses.borderCard}`}
                                    >
                                        {t('clearSearch')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${themeClasses.gap}`}>
                                {filteredEvents.map((event: Event, index: number) => {
                                    const venue = getVenueInfo(event.venueId);
                                    const daysUntil = getDaysUntilEvent(event.startDateTime);
                                    const imageUrl = getImageUrl(event.bannerImageUrl || event.imageUrl);

                                    return (
                                        <div key={event.eventId} className={`${themeClasses.backgroundCard} backdrop-blur-sm ${themeClasses.hover} rounded-2xl ${themeClasses.shadow} border ${themeClasses.borderCard} overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:${themeClasses.backgroundCard}`}>
                                            <div className="relative">
                                                <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500">
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
                                                            <Calendar className={`${themeClasses.iconSizeLarge} text-white opacity-50`} />
                                                        </div>
                                                    )}
                                                </div>

                                                {daysUntil <= 3 && daysUntil >= 0 && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`${themeClasses.buttonPaddingSmall} bg-red-500/90 text-white ${themeClasses.fontSize.subtitle} font-bold rounded-full backdrop-blur-sm`}>
                                                            {daysUntil === 0 ? t('today') : daysUntil === 1 ? t('tomorrow') : t('soon')}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3 flex space-x-2">
                                                    <button
                                                        onClick={() => shareEvent(event)}
                                                        className={`${themeClasses.paddingSmall} rounded-full text-white hover:text-blue-400 bg-black/20 hover:bg-white/90 transition-all backdrop-blur-sm`}
                                                    >
                                                        <Share className={themeClasses.iconSizeSmall} />
                                                    </button>
                                                </div>

                                                {event.isFeatured && (
                                                    <div className="absolute bottom-3 left-3">
                                                        <Star className={`${themeClasses.iconSize} text-yellow-400 fill-current`} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className={themeClasses.padding}>
                                                <div className={`flex items-center space-x-2 ${themeClasses.marginSmall}`}>
                                                    <span className={`${themeClasses.buttonPaddingSmall} ${themeClasses.accentLight} ${themeClasses.accentText} ${themeClasses.fontSize.subtitle} font-medium rounded-full`}>
                                                        {event.categoryName}
                                                    </span>
                                                    {event.isOnline && (
                                                        <span className={`${themeClasses.buttonPaddingSmall} bg-green-100/80 text-green-800 ${themeClasses.fontSize.subtitle} font-medium rounded-full flex items-center space-x-1`}>
                                                            <Globe className={themeClasses.iconSizeSmall} />
                                                            <span>Online</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className={`${themeClasses.fontSize.heading} font-semibold ${themeClasses.text} ${themeClasses.marginSmall} line-clamp-2`}>
                                                    {event.title}
                                                </h3>

                                                <p className={`${themeClasses.textSecondary} ${themeClasses.fontSize.subtitle} ${themeClasses.marginSmall} line-clamp-2`}>
                                                    {event.shortDescription || event.description}
                                                </p>

                                                <div className={`${themeClasses.spacing} ${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} ${themeClasses.marginSmall}`}>
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className={themeClasses.iconSizeSmall} />
                                                        <span>
                                                            {formatEventDateTime(event.startDateTime, preferences, currentLangData, t)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className={themeClasses.iconSizeSmall} />
                                                        <span className="line-clamp-1">{event.isOnline ? t('onlineEvent') : `${event.venueName}, ${event.venueCity}`}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <DollarSign className={themeClasses.iconSizeSmall} />
                                                            <span>{t('from')} {convertAndFormatCurrency(event.basePrice, event.currency, preferences, currentLangData)}</span>
                                                        </div>
                                                        {event.availableTickets < 50 && event.availableTickets > 0 && (
                                                            <span className={`text-orange-600 ${themeClasses.fontSize.subtitle} font-medium`}>
                                                                {t('limited')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/events/${event.eventId}`}
                                                    className={`block w-full bg-gradient-to-r ${themeClasses.accentGradient} hover:from-blue-700 hover:to-purple-700 text-white font-semibold ${themeClasses.buttonPadding} rounded-xl text-center transition-all duration-200 transform hover:scale-105 ${themeClasses.fontSize.text}`}
                                                >
                                                    {t('viewAndBook')}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Popular Venues Section - removed */}
                    {false && popularVenues.length > 0 && (
                        <div className={`${themeClasses.marginSection} ${themeClasses.marginSection}`}>
                            <div className={`text-center ${themeClasses.marginLarge}`}>
                                <h2 className={`${themeClasses.fontSize.section} font-bold text-white ${themeClasses.marginSmall} drop-shadow-lg`}>
                                    {t('premierVenues')}
                                </h2>
                                <p className={`text-white/80 ${themeClasses.fontSize.heading} drop-shadow`}>{t('topEventLocations')}</p>
                            </div>

                            <div className="overflow-x-auto pb-4">
                                <div className="flex space-x-6" style={{ width: `${popularVenues.length * 280}px` }}>
                                    {popularVenues.map((venue: Venue, index: number) => {
                                        const venueImageUrl = getImageUrl(venue.imageUrl);

                                        return (
                                            <Link
                                                key={venue.venueId}
                                                href={`/venues/${venue.venueId}`}
                                                className={`block w-64 ${themeClasses.backgroundCard} backdrop-blur-sm ${themeClasses.hover} rounded-2xl ${themeClasses.shadow} border ${themeClasses.borderCard} overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:${themeClasses.backgroundCard} cursor-pointer group`}
                                            >
                                                <div className="relative">
                                                    <div className="h-36 bg-gradient-to-r from-purple-400 to-pink-500">
                                                        {venueImageUrl ? (
                                                            <img
                                                                src={venueImageUrl}
                                                                alt={venue.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Building className={`${themeClasses.iconSizeLarge} text-white opacity-50`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`${themeClasses.buttonPaddingSmall} ${themeClasses.backgroundCard} ${themeClasses.accentText} ${themeClasses.fontSize.subtitle} font-medium rounded-full backdrop-blur-sm`}>
                                                            {(venue.eventCount || 0) > 10 ? t('hot') : t('popular')}
                                                        </span>
                                                    </div>
                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <div className={`${themeClasses.backgroundCard} backdrop-blur-sm rounded-full ${themeClasses.paddingSmall}`}>
                                                            <ArrowRight className={`${themeClasses.iconSize} ${themeClasses.accentText}`} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={themeClasses.paddingSmall}>
                                                    <h3 className={`font-semibold ${themeClasses.text} ${themeClasses.marginSmall} line-clamp-1 group-hover:${themeClasses.accentText} transition-colors ${themeClasses.fontSize.text}`}>
                                                        {venue.name}
                                                    </h3>
                                                    <p className={`${themeClasses.fontSize.subtitle} ${themeClasses.textSecondary} ${themeClasses.marginSmall} flex items-center space-x-1`}>
                                                        <MapPin className={themeClasses.iconSizeSmall} />
                                                        <span>{venue.city}, {venue.state}</span>
                                                    </p>
                                                    <div className={`${themeClasses.fontSize.subtitle} ${themeClasses.textMuted} ${themeClasses.marginSmall} flex items-center space-x-1`}>
                                                        <Users className={themeClasses.iconSizeSmall} />
                                                        <span>{venue.capacity.toLocaleString()} {t('capacity')}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main >

            {/* Footer */}
            <footer className="bg-[#0a0f1c] text-white border-t border-white/10 pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* Company Info */}
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-cyan-400 mr-3" />
                            <h3 className="text-2xl font-bold text-white">NexusEvents</h3>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
                            <Link href="/events" className="text-slate-400 hover:text-white transition-colors">Events</Link>
                            <a href="mailto:support@nexusevents.com" className="text-slate-400 hover:text-white transition-colors">Support</a>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-slate-500 text-sm mb-4 md:mb-0">
                                � {new Date().getFullYear()} NexusEvents. All rights reserved.
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <Globe className="h-4 w-4" />
                                <span>Available Worldwide</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div >

    );
}





