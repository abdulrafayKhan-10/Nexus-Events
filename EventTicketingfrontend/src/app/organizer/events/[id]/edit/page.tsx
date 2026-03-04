/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/components/providers/I18nProvider'; // Add this import
import {
    Calendar, MapPin, Globe, Users, DollarSign, Plus, Trash2, Save, ArrowLeft,
    AlertCircle, Clock, Edit, Lock, AlertTriangle, Info, X
} from 'lucide-react';
import { useTheme, useThemeClasses } from '@/hooks/useTheme';
import { imageApi, imageUtils, eventsApi } from '@/lib/api';

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

interface TicketType {
    ticketTypeId?: number;
    name: string;
    price: number;
    quantityAvailable: number;
    quantitySold: number;
    description: string;
    isActive: boolean;
    isEventPublished?: boolean;
    eventStatus?: string;
    saleStartDate?: string;
    saleEndDate?: string;
    minQuantityPerOrder?: number;
    maxQuantityPerOrder?: number;
    sortOrder?: number;
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

interface CreateTicketTypeData {
    name: string;
    description: string;
    price: string;
    quantityAvailable: string;
    saleStartDate: string;
    saleEndDate: string;
    minQuantityPerOrder: string;
    maxQuantityPerOrder: string;
    sortOrder: string;
}

interface EditTicketTypeData extends CreateTicketTypeData {
    ticketTypeId: number;
}

const EditEventPage = () => {
    const router = useRouter();
    const params = useParams();
    const eventId = params?.id as string;
    const { user, isOrganizer } = useAuth();
    const { t } = useI18n(); 
    const themeClasses = useThemeClasses();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
    const [showEditTicketForm, setShowEditTicketForm] = useState(false);
    const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
    const [ticketFormLoading, setTicketFormLoading] = useState(false);


    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [deleteBanner, setDeleteBanner] = useState(false);
    const [deleteImage, setDeleteImage] = useState(false);
    const [imageUploadLoading, setImageUploadLoading] = useState(false);

    const [userPreferences, setUserPreferences] = useState<any>(null);
    const [userCurrency, setUserCurrency] = useState<Currency>('USD');

    const [isDragging, setIsDragging] = useState(false);

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

    const [createTicketData, setCreateTicketData] = useState<CreateTicketTypeData>({
        name: '',
        description: '',
        price: '',
        quantityAvailable: '',
        saleStartDate: '',
        saleEndDate: '',
        minQuantityPerOrder: '1',
        maxQuantityPerOrder: '10',
        sortOrder: '0'
    });

    const [editTicketData, setEditTicketData] = useState<EditTicketTypeData>({
        ticketTypeId: 0,
        name: '',
        description: '',
        price: '',
        quantityAvailable: '',
        saleStartDate: '',
        saleEndDate: '',
        minQuantityPerOrder: '1',
        maxQuantityPerOrder: '10',
        sortOrder: '0'
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [ticketFormErrors, setTicketFormErrors] = useState<Record<string, string>>({});

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

    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    const openImageModal = (src: string) => {
        setModalImageSrc(src);
        setShowImageModal(true);
    };

    const ImagePreviewModal = () => (
        showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="relative max-w-4xl max-h-4xl">
                    <img
                        src={modalImageSrc}
                        alt={t('imagePreview')}
                        className="max-w-full max-h-full object-contain"
                    />
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>
        )
    );

    // Load event data and initial data
    useEffect(() => {
        if (user && isOrganizer && eventId) {
            fetchUserPreferences(); 
            loadEventData();
            fetchInitialData();
        } else if (user && !isOrganizer) {
            router.push('/');
        }
    }, [user, isOrganizer, eventId, router]);

    const loadEventData = async () => {
        try {
            setInitialLoading(true);
            setError('');

            // Fetch event details using your API
            const response = await fetch(`http://localhost:5251/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setError(t('loadError'));
                    return;
                }
                throw new Error(t('loadError'));
            }

            const eventData = await response.json();

            const formatDateForInput = (dateValue: any) => {
                if (!dateValue) return '';

                try {
                    const date = new Date(dateValue);
                    if (isNaN(date.getTime())) return '';

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                } catch (error) {
                    console.error('Error formatting date:', error);
                    return '';
                }
            };

            setFormData({
                title: eventData.title || '',
                description: eventData.description || '',
                eventDate: formatDateForInput(eventData.startDateTime || eventData.eventDate),
                endDate: formatDateForInput(eventData.endDateTime),
                location: eventData.location || '',
                isOnline: eventData.isOnline || false,
                maxCapacity: eventData.maxAttendees?.toString() || '',
                categoryId: eventData.categoryId?.toString() || '',
                venueId: eventData.venueId || null,
                imageUrl: eventData.imageUrl || '',
                registrationDeadline: formatDateForInput(eventData.registrationDeadline),
                isPublished: eventData.isPublished || false
            });



            await fetchTicketTypes();

        } catch (error) {
            console.error('Error loading event data:', error);
            setError(t('loadError'));
        } finally {
            setInitialLoading(false);
        }
    };


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent, type: 'banner' | 'image') => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            if (type === 'banner') {
                await handleBannerFileChange({ target: { files: [imageFile] } } as any);
            } else {
                await handleImageFileChange({ target: { files: [imageFile] } } as any);
            }
        } else {
            setError(t('invalidImageFile'));
        }
    };

    const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setError(''); 

            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                setError(t('invalidImageFile') + ': ' + (validation.error || t('imageUploadFailed')));
                return;
            }

            try {
                setImageUploadLoading(true);
                setBannerFile(file);
                const preview = await imageUtils.resizeImageForPreview(file, 800, 400);
                setBannerPreview(preview);
                setDeleteBanner(false);

                setSuccess(t('imageUploadSuccess'));
                setTimeout(() => setSuccess(''), 2000);
            } catch (error) {
                setError(t('imageProcessing') + ' ' + t('imageUploadFailed'));
            } finally {
                setImageUploadLoading(false);
            }
        }
    };

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {

            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                setError(t('invalidImageFile') + ': ' + (validation.error || t('imageUploadFailed')));
                return;
            }

            try {
                setImageUploadLoading(true); 
                setImageFile(file);
                const preview = await imageUtils.resizeImageForPreview(file, 400, 300);
                setImagePreview(preview);
                setDeleteImage(false);

                setSuccess(t('imageUploadSuccess'));
                setTimeout(() => setSuccess(''), 2000);
            } catch (error) {
                setError(t('imageProcessing') + ' ' + t('imageUploadFailed'));
            } finally {
                setImageUploadLoading(false);
            }
        }
    };


    const handleDeleteBanner = () => {
        setBannerFile(null);
        setBannerPreview('');
        setDeleteBanner(true);
        const bannerInput = document.getElementById('banner-upload') as HTMLInputElement;
        if (bannerInput) bannerInput.value = '';
    };

    const handleDeleteImage = () => {
        setImageFile(null);
        setImagePreview('');
        setDeleteImage(true);
        const imageInput = document.getElementById('image-upload') as HTMLInputElement;
        if (imageInput) imageInput.value = '';
    };

    const fetchTicketTypes = async () => {
        try {
            const response = await fetch(`http://localhost:5251/api/tickets/event/${eventId}/ticket-types`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const ticketTypesData = await response.json();
                const mappedTicketTypes = ticketTypesData.map((tt: any) => ({
                    ticketTypeId: tt.ticketTypeId,
                    name: tt.name,
                    price: tt.price,
                    quantityAvailable: tt.quantityAvailable || tt.quantity,
                    quantitySold: tt.quantitySold || 0,
                    description: tt.description || '',
                    isActive: tt.isActive,
                    isEventPublished: tt.isEventPublished,
                    eventStatus: tt.eventStatus,
                    saleStartDate: tt.saleStartDate,
                    saleEndDate: tt.saleEndDate,
                    minQuantityPerOrder: tt.minQuantityPerOrder || 1,
                    maxQuantityPerOrder: tt.maxQuantityPerOrder || 10,
                    sortOrder: tt.sortOrder || 0
                }));

                setTicketTypes(mappedTicketTypes);
            }
        } catch (error) {
            setTicketTypes([]);
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
            }

            const venuesResponse = await fetch('http://localhost:5251/api/venues', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (venuesResponse.ok) {
                const venuesData = await venuesResponse.json();
                setVenues(venuesData);
            }

        } catch (error) {
        }
    };

    const canEditTicketType = (ticketType: TicketType): { canEdit: boolean; reason: string } => {
        if (ticketType.isEventPublished) {
            return {
                canEdit: false,
                reason: t('salesDataIntegrity')
            };
        }

        const ticketsSold = ticketType.quantitySold || 0;
        if (ticketsSold > 0) {
            return {
                canEdit: false,
                reason: t('ticketsSoldCount', { count: ticketsSold })
            };
        }

        if (ticketType.eventStatus && ticketType.eventStatus.toLowerCase() !== 'draft') {
            return {
                canEdit: false,
                reason: t('eventStatusNotDraft')
            };
        }

        return {
            canEdit: true,
            reason: t('safeToEdit')
        };
    };


    const ImageDropZone = ({
        type,
        preview,
        currentImage,
        onFileSelect,
        onDelete,
        children
    }: {
        type: 'banner' | 'image';
        preview: string;
        currentImage: string;
        onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onDelete: () => void;
        children: React.ReactNode;
    }) => (
        <div
            className={`relative ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, type)}
        >
            {children}
            {isDragging && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                        {t('dropImageHere')}
                    </p>
                </div>
            )}
        </div>
    );

    const getEditingStatus = (ticketType: TicketType) => {
        const { canEdit, reason } = canEditTicketType(ticketType);
        const ticketsSold = ticketType.quantitySold || 0;

        if (!canEdit) {
            return {
                status: 'locked',
                icon: Lock,
                color: 'text-red-600',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                borderColor: 'border-red-200 dark:border-red-800',
                reason: reason
            };
        }

        return {
            status: 'editable',
            icon: Edit,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            reason: t('safeToEdit')
        };
    };

    const canCreateTicketTypes = (): { canCreate: boolean; reason: string } => {
        if (formData.isPublished) {
            return {
                canCreate: false,
                reason: t('salesDataIntegrity')
            };
        }

        const totalTicketsSold = ticketTypes.reduce((sum, tt) => sum + (tt.quantitySold || 0), 0);
        if (totalTicketsSold > 0) {
            return {
                canCreate: false,
                reason: t('cannotCreateTicketTypes', { count: totalTicketsSold })
            };
        }

        return {
            canCreate: true,
            reason: t('safeToEdit')
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCreateTicketInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateTicketData(prev => ({ ...prev, [name]: value }));

        if (ticketFormErrors[name]) {
            setTicketFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleEditTicketInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditTicketData(prev => ({ ...prev, [name]: value }));

        if (ticketFormErrors[name]) {
            setTicketFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateTicketForm = (data: CreateTicketTypeData) => {
        const errors: Record<string, string> = {};

        if (!data.name.trim()) errors.name = t('ticketTypeNameRequired');
        if (!data.price || parseFloat(data.price) < 0) errors.price = t('priceRequired');
        if (!data.quantityAvailable || parseInt(data.quantityAvailable) <= 0) errors.quantityAvailable = t('quantityGreaterThanZero');

        setTicketFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openCreateTicketForm = () => {
        const { canCreate, reason } = canCreateTicketTypes();
        if (!canCreate) {
            setError(reason);
            return;
        }

        setCreateTicketData({
            name: '',
            description: '',
            price: '',
            quantityAvailable: '',
            saleStartDate: '',
            saleEndDate: '',
            minQuantityPerOrder: '1',
            maxQuantityPerOrder: '10',
            sortOrder: '0'
        });
        setShowCreateTicketForm(true);
    };

    const openEditTicketForm = (ticketType: TicketType) => {
        const { canEdit, reason } = canEditTicketType(ticketType);
        if (!canEdit) {
            setError(reason);
            return;
        }

        setEditingTicketType(ticketType);
        setEditTicketData({
            ticketTypeId: ticketType.ticketTypeId!,
            name: ticketType.name,
            description: ticketType.description,
            price: convertFromUSD(ticketType.price, userCurrency).toFixed(userCurrency === 'JPY' ? 0 : 2),
            quantityAvailable: ticketType.quantityAvailable.toString(),
            saleStartDate: ticketType.saleStartDate || '',
            saleEndDate: ticketType.saleEndDate || '',
            minQuantityPerOrder: (ticketType.minQuantityPerOrder || 1).toString(),
            maxQuantityPerOrder: (ticketType.maxQuantityPerOrder || 10).toString(),
            sortOrder: (ticketType.sortOrder || 0).toString()
        });
        setShowEditTicketForm(true);
    };

    const handleCreateTicketType = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateTicketForm(createTicketData)) return;

        setTicketFormLoading(true);
        setError('');

        try {
            const payload = {
                eventId: parseInt(eventId),
                name: createTicketData.name.trim(),
                description: createTicketData.description.trim() || null,
                price: convertToUSD(parseFloat(createTicketData.price), userCurrency),
                quantityAvailable: parseInt(createTicketData.quantityAvailable),
                saleStartDate: createTicketData.saleStartDate || null,
                saleEndDate: createTicketData.saleEndDate || null,
                minQuantityPerOrder: parseInt(createTicketData.minQuantityPerOrder),
                maxQuantityPerOrder: parseInt(createTicketData.maxQuantityPerOrder),
                sortOrder: parseInt(createTicketData.sortOrder)
            };

            const response = await fetch('http://localhost:5251/api/tickets/ticket-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess(t('ticketTypeCreatedSuccessfully'));
                await fetchTicketTypes();
                setShowCreateTicketForm(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t('failedToCreateTicketType'));
            }
        } catch (error) {
        } finally {
            setTicketFormLoading(false);
        }
    };

    const handleUpdateTicketType = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateTicketForm(editTicketData)) return;

        setTicketFormLoading(true);
        setError('');

        try {
            const payload = {
                name: editTicketData.name.trim(),
                description: editTicketData.description.trim() || null,
                price: convertToUSD(parseFloat(editTicketData.price), userCurrency),
                quantityAvailable: parseInt(editTicketData.quantityAvailable),
                saleStartDate: editTicketData.saleStartDate || null,
                saleEndDate: editTicketData.saleEndDate || null,
                minQuantityPerOrder: parseInt(editTicketData.minQuantityPerOrder),
                maxQuantityPerOrder: parseInt(editTicketData.maxQuantityPerOrder),
                sortOrder: parseInt(editTicketData.sortOrder)
            };

            const response = await fetch(`http://localhost:5251/api/tickets/ticket-types/${editTicketData.ticketTypeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess(t('ticketTypeUpdatedSuccessfully'));
                await fetchTicketTypes();
                setShowEditTicketForm(false);
                setEditingTicketType(null);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t('failedToUpdateTicketType'));
            }
        } catch (error) {
            setError(t('loadError'));
        } finally {
            setTicketFormLoading(false);
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
        setImageUploadLoading(true);
        setError('');
        setSuccess('');

        try {
            const eventPayload = {
                title: formData.title,
                description: formData.description,
                shortDescription: undefined, 
                startDateTime: formData.eventDate,
                endDateTime: formData.endDate || undefined, 
                categoryId: parseInt(formData.categoryId),
                venueId: formData.isOnline ? undefined : parseInt(formData.venueId?.toString() || '0'),
                imageUrl: formData.imageUrl || undefined, 
                bannerImageUrl: undefined, 
                tags: undefined, 
                maxAttendees: parseInt(formData.maxCapacity),
                basePrice: 0,
                currency: "USD",
                isOnline: formData.isOnline,
                onlineUrl: undefined 
            };

            console.log('Updating event with images:', eventPayload);

            try {
                const updatedEvent = await eventsApi.updateEventWithImages(
                    parseInt(eventId),
                    eventPayload,
                    bannerFile || undefined,
                    imageFile || undefined,
                    deleteBanner,
                    deleteImage
                );

                setSuccess(t('eventUpdatedSuccessfully'));

                setTimeout(() => {
                    router.push(`/organizer/events`);
                }, 2000);
            } catch (imageError: any) {
               
            }

        } catch (error) {
        } finally {
            setLoading(false);
            setImageUploadLoading(false);
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
    };

    if (initialLoading) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className={`mt-4 ${themeClasses.textMuted}`}>{t('loading')}</p>
                </div>
            </div>
        );
    };

    const eventDuration = getEventDuration();
    const { canCreate } = canCreateTicketTypes();
    const editableTickets = ticketTypes.filter(tt => canEditTicketType(tt).canEdit).length;
    const lockedTickets = ticketTypes.length - editableTickets;

    return (
        <div className={`min-h-screen ${themeClasses.background}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className={`flex items-center ${themeClasses.textMuted} hover:${themeClasses.text} mb-4`}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('back')} to {t('events')}
                    </button>
                    <h1 className={`text-3xl font-bold ${themeClasses.text}`}>{t('editEvent')}</h1>
                    <p className={`${themeClasses.textMuted} mt-1`}>{t('updateEventDetails')}</p>

                    {/* Show event duration if multi-day */}
                    {eventDuration && eventDuration > 1 && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Clock className="h-4 w-4 mr-1" />
                            {t('dayEvent', { count: eventDuration })}
                        </div>
                    )}
                </div>

                <div className={`${themeClasses.card} rounded-lg shadow-sm ${themeClasses.border} border`}>
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Basic Information */}
                        <div>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('basicInformation')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('eventTitle')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.title ? 'border-red-500' : ''}`}
                                        placeholder={t('enterEventTitle')}
                                    />
                                    {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('eventDescription')} *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.description ? 'border-red-500' : ''}`}
                                        placeholder={t('describeEventDetail')}
                                    />
                                    {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('category')} *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.categoryId ? 'border-red-500' : ''}`}
                                    >
                                        <option value="" className={themeClasses.textMuted}>{t('selectCategory')}</option>
                                        {categories.map(category => (
                                            <option key={category.categoryId} value={category.categoryId} className={themeClasses.text}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.categoryId && <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>}
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('maxCapacity')} *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxCapacity"
                                        value={formData.maxCapacity}
                                        onChange={handleInputChange}
                                        min="1"
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.maxCapacity ? 'border-red-500' : ''}`}
                                        placeholder={t('maximumAttendees')}
                                    />
                                    {formErrors.maxCapacity && <p className="text-red-500 text-sm mt-1">{formErrors.maxCapacity}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Event Images Section - AFTER (translated) */}
                        <div>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('eventImages')}</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('bannerImage')}
                                    </label>
                                    <p className={`text-xs ${themeClasses.textMuted} mb-3`}>
                                        {t('bannerImageDescription')}
                                    </p>

                                    <div className="mb-4">
                                        {bannerPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={bannerPreview}
                                                    alt={t('imagePreview')}
                                                    className="w-full h-48 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteBanner}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    title={t('removeImage')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : formData.imageUrl && !deleteBanner ? (
                                            <div className="relative">
                                                <img
                                                    src={imageUtils.getImageWithFallback(formData.imageUrl, 'event-banner')}
                                                    alt={t('bannerImage')}
                                                    className="w-full h-48 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteBanner}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    title={t('removeImage')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`w-full h-48 ${themeClasses.border} border-2 border-dashed rounded-lg flex items-center justify-center ${themeClasses.textMuted}`}>
                                                <div className="text-center">
                                                    <Globe className="h-12 w-12 mx-auto mb-2" />
                                                    <p>{t('noBannerImage')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        id="banner-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerFileChange}
                                        className="hidden"
                                        aria-label={t('selectImageFile')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('banner-upload')?.click()}
                                        className={`flex items-center px-4 py-2 ${themeClasses.border} border rounded-lg ${themeClasses.text} ${themeClasses.hover} transition-colors`}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {bannerPreview || formData.imageUrl ? t('changeBanner') : t('uploadBanner')}
                                    </button>
                                </div>

                                {/* Event Image Section */}
                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('eventImage')}
                                    </label>
                                    <p className={`text-xs ${themeClasses.textMuted} mb-3`}>
                                        {t('eventImageDescription')}
                                    </p>

                                    <div className="mb-4">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt={t('imagePreview')}
                                                    className="w-64 h-48 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    title={t('removeImage')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : formData.imageUrl && !deleteImage ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imageUtils.getImageWithFallback(formData.imageUrl, 'event-image')}
                                                    alt={t('eventImage')}
                                                    className="w-64 h-48 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    title={t('removeImage')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`w-64 h-48 ${themeClasses.border} border-2 border-dashed rounded-lg flex items-center justify-center ${themeClasses.textMuted}`}>
                                                <div className="text-center">
                                                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-sm">{t('noEventImage')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="hidden"
                                        aria-label={t('selectImageFile')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className={`flex items-center px-4 py-2 ${themeClasses.border} border rounded-lg ${themeClasses.text} ${themeClasses.hover} transition-colors`}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {imagePreview || formData.imageUrl ? t('changeImage') : t('uploadImage')}
                                    </button>
                                </div>

                                {/* Image Upload Progress */}
                                {imageUploadLoading && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                                            <span className="text-sm text-blue-700 dark:text-blue-300">{t('uploadingImages')}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Image Guidelines */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
                                    <h4 className={`text-sm font-medium ${themeClasses.text} mb-2`}>{t('imageGuidelines')}</h4>
                                    <ul className={`text-xs ${themeClasses.textMuted} space-y-1`}>
                                        <li>• {t('supportedFormats')}: JPEG, PNG, WebP, GIF</li>
                                        <li>• {t('maxFileSize')}: 5MB</li>
                                        <li>• {t('bannerRecommended')}: 1200x400px (3:1 ratio)</li>
                                        <li>• {t('imageRecommended')}: 400x300px (4:3 ratio)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>


                        {/* Date & Time */}
                        <div>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('dateTime')}</h2>

                            {/* Date Range Preview */}
                            {formData.eventDate && formData.endDate && isMultiDayEvent() && (
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                                        <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                            {t('multiDayEvent', { count: eventDuration })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('startDateTime')} *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.eventDate ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.eventDate && <p className="text-red-500 text-sm mt-1">{formErrors.eventDate}</p>}
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('endDateTime')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.endDate ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.endDate && <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>}
                                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                                        {t('leaveEmptySingleSession')}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('registrationDeadline')}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="registrationDeadline"
                                        value={formData.registrationDeadline}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.registrationDeadline ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.registrationDeadline && <p className="text-red-500 text-sm mt-1">{formErrors.registrationDeadline}</p>}
                                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                                        {t('whenRegistrationClose')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('location')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isOnline"
                                        checked={formData.isOnline}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className={`ml-2 text-sm ${themeClasses.text}`}>
                                        {t('onlineEvent')}
                                    </label>
                                </div>

                                {!formData.isOnline && (
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('venue')} *
                                        </label>
                                        <select
                                            name="venueId"
                                            value={formData.venueId || ''}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${formErrors.venueId ? 'border-red-500' : ''}`}
                                        >
                                            <option value="" className={themeClasses.textMuted}>{t('selectVenue')}</option>
                                            {venues.map(venue => (
                                                <option key={venue.venueId} value={venue.venueId} className={themeClasses.text}>
                                                    {t('venueWithCapacity', { name: venue.name, city: venue.city, capacity: venue.capacity })}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.venueId && <p className="text-red-500 text-sm mt-1">{formErrors.venueId}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                        {t('locationDetails')}
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text}`}
                                        placeholder={formData.isOnline ? t('meetingLinkPlatform') : t('additionalLocationInfo')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Ticket Types Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className={`text-lg font-semibold ${themeClasses.text}`}>{t('ticketTypes')}</h2>
                                <button
                                    type="button"
                                    onClick={openCreateTicketForm}
                                    disabled={!canCreate}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${canCreate
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    title={canCreate ? t('addTicketType') : t('cannotCreateTicketTypes')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('addTicketType')}
                                </button>
                            </div>

                            {/* Smart Editing Rules Notice */}
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">{t('smartTicketEditing')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700 dark:text-blue-300">
                                    <div>
                                        <p className="font-medium mb-1">{t('whenCanEdit')}</p>
                                        <ul className="space-y-1">
                                            <li>{t('eventDraftStatus')}</li>
                                            <li>{t('noTicketsSold')}</li>
                                            <li>{t('eventNotPublished')}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">{t('whenEditingLocked')}</p>
                                        <ul className="space-y-1">
                                            <li>{t('eventIsPublished')}</li>
                                            <li>{t('ticketsAlreadySold')}</li>
                                            <li>{t('eventStatusNotDraft')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Types Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className={`${themeClasses.card} p-4 rounded-lg ${themeClasses.border} border`}>
                                    <div className={`text-2xl font-bold ${themeClasses.text}`}>{ticketTypes.length}</div>
                                    <div className={`text-sm ${themeClasses.textMuted}`}>{t('totalTypes')}</div>
                                </div>
                                <div className={`${themeClasses.card} p-4 rounded-lg border-green-200 dark:border-green-800 border`}>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{editableTickets}</div>
                                    <div className={`text-sm ${themeClasses.textMuted}`}>{t('editable')}</div>
                                </div>
                                <div className={`${themeClasses.card} p-4 rounded-lg border-red-200 dark:border-red-800 border`}>
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{lockedTickets}</div>
                                    <div className={`text-sm ${themeClasses.textMuted}`}>{t('locked')}</div>
                                </div>
                            </div>

                            {ticketTypes.length === 0 ? (
                                <div className={`text-center py-8 ${themeClasses.border} border rounded-lg ${themeClasses.isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                    <Users className={`h-12 w-12 ${themeClasses.textMuted} mx-auto mb-4`} />
                                    <h3 className={`text-lg font-medium ${themeClasses.text} mb-2`}>{t('noTicketTypesYet')}</h3>
                                    <p className={`${themeClasses.textMuted} mb-4`}>{t('addTicketTypesToStart')}</p>
                                    {canCreate && (
                                        <button
                                            type="button"
                                            onClick={openCreateTicketForm}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('createFirstTicketType')}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ticketTypes.map((ticket, index) => {
                                        const editStatus = getEditingStatus(ticket);
                                        const { canEdit } = canEditTicketType(ticket);

                                        return (
                                            <div key={ticket.ticketTypeId || index} className={`p-6 ${themeClasses.border} border rounded-lg ${themeClasses.card}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <h3 className={`text-lg font-medium ${themeClasses.text}`}>
                                                                {ticket.name || `${t('ticketTypeName')} ${index + 1}`}
                                                            </h3>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${editStatus.bgColor} ${editStatus.borderColor} border`}>
                                                                <div className="flex items-center">
                                                                    <editStatus.icon className={`h-3 w-3 ${editStatus.color} mr-1`} />
                                                                    <span className={editStatus.color}>
                                                                        {canEdit ? t('editable') : t('locked')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {ticket.description && (
                                                            <p className={`${themeClasses.textMuted} mb-4`}>{ticket.description}</p>
                                                        )}

                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <span className={`font-medium ${themeClasses.textMuted}`}>{t('price')}:</span>
                                                                <p className={`${themeClasses.text} font-medium`}>
                                                                    {formatCurrencyWithUserPreference(
                                                                        convertFromUSD(ticket.price, userCurrency),
                                                                        { currency: userCurrency },
                                                                        { region: 'en-US' }
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className={`font-medium ${themeClasses.textMuted}`}>{t('quantity')}:</span>
                                                                <p className={themeClasses.text}>{ticket.quantityAvailable}</p>
                                                            </div>
                                                            <div>
                                                                <span className={`font-medium ${themeClasses.textMuted}`}>{t('ticketsSold')}:</span>
                                                                <p className={`font-medium ${ticket.quantitySold > 0 ? 'text-blue-600 dark:text-blue-400' : themeClasses.text}`}>
                                                                    {ticket.quantitySold}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className={`font-medium ${themeClasses.textMuted}`}>Status:</span>
                                                                <p className={themeClasses.text}>{ticket.isActive ? 'Active' : 'Inactive'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Progress bar for sales */}
                                                        <div className="mt-4">
                                                            <div className={`w-full ${themeClasses.isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                                                                <div
                                                                    className={`h-2 rounded-full ${ticket.quantitySold > 0 ? 'bg-blue-600' : 'bg-gray-400'}`}
                                                                    style={{
                                                                        width: `${(ticket.quantitySold / ticket.quantityAvailable) * 100}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                                                                {ticket.quantityAvailable - ticket.quantitySold} remaining
                                                            </p>
                                                        </div>

                                                        {/* Edit status explanation */}
                                                        <div className={`mt-4 text-xs ${themeClasses.textMuted}`}>
                                                            <strong>Edit Status:</strong> {editStatus.reason}
                                                        </div>
                                                    </div>

                                                    <div className="ml-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditTicketForm(ticket)}
                                                            disabled={!canEdit}
                                                            className={`p-2 rounded-lg transition-colors ${canEdit
                                                                ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                                                                : `${themeClasses.textMuted} cursor-not-allowed ${themeClasses.isDark ? 'bg-gray-800' : 'bg-gray-50'}`
                                                                }`}
                                                            title={canEdit ? t('editTicketType') : editStatus.reason}
                                                        >
                                                            {canEdit ? <Edit className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Publishing Options */}
                        <div>
                            <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>{t('publishingOptions')}</h2>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <strong>Note:</strong> {t('usePublishButtons')}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled
                                />
                                <label className={`ml-2 text-sm ${themeClasses.textMuted}`}>
                                    {t('published')} ({t('makeVisiblePublic')}) - {formData.isPublished ? t('currentlyPublished') : t('currentlyUnpublished')}
                                </label>
                            </div>
                            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                                {t('usePublishButtons')}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className={`flex justify-end space-x-4 pt-6 border-t ${themeClasses.border}`}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className={`px-6 py-2 ${themeClasses.border} border ${themeClasses.text} rounded-lg ${themeClasses.hover} transition-colors`}
                                disabled={loading}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {t('updatingEvent')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {t('update')} {t('events')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {showCreateTicketForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${themeClasses.card} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>{t('createTicketType')}</h2>
                                    <button
                                        onClick={() => setShowCreateTicketForm(false)}
                                        className={`${themeClasses.textMuted} hover:${themeClasses.text}`}
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTicketType} className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('ticketTypeName')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={createTicketData.name}
                                            onChange={handleCreateTicketInputChange}
                                            className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${ticketFormErrors.name ? 'border-red-500' : ''}`}
                                            placeholder="e.g., General Admission, VIP, Early Bird"
                                        />
                                        {ticketFormErrors.name && <p className="text-red-500 text-sm mt-1">{ticketFormErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('ticketDescription')}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={createTicketData.description}
                                            onChange={handleCreateTicketInputChange}
                                            rows={3}
                                            className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text}`}
                                            placeholder={t('optionalTicketDescription')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                                {t('price')} ({CURRENCIES[userCurrency as keyof typeof CURRENCIES]?.symbol || '$'}) *
                                                <span className={`text-xs ${themeClasses.textMuted} ml-2`}>
                                                    (Converted from USD)
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={createTicketData.price}
                                                onChange={handleCreateTicketInputChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${ticketFormErrors.price ? 'border-red-500' : ''}`}
                                                placeholder="0.00"
                                            />
                                            {ticketFormErrors.price && <p className="text-red-500 text-sm mt-1">{ticketFormErrors.price}</p>}
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                                {t('quantity')} *
                                            </label>
                                            <input
                                                type="number"
                                                name="quantityAvailable"
                                                value={createTicketData.quantityAvailable}
                                                onChange={handleCreateTicketInputChange}
                                                min="1"
                                                className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${ticketFormErrors.quantityAvailable ? 'border-red-500' : ''}`}
                                                placeholder={t('quantity')}
                                            />
                                            {ticketFormErrors.quantityAvailable && <p className="text-red-500 text-sm mt-1">{ticketFormErrors.quantityAvailable}</p>}
                                        </div>
                                    </div>

                                    <div className={`flex justify-end space-x-4 pt-6 border-t ${themeClasses.border}`}>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateTicketForm(false)}
                                            className={`px-6 py-2 ${themeClasses.border} border ${themeClasses.text} rounded-lg ${themeClasses.hover} transition-colors`}
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={ticketFormLoading}
                                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {ticketFormLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {t('loading')}...
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

                {/* Edit Ticket Type Modal */}
                {showEditTicketForm && editingTicketType && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${themeClasses.card} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>{t('editTicketType')}</h2>
                                    <button
                                        onClick={() => {
                                            setShowEditTicketForm(false);
                                            setEditingTicketType(null);
                                        }}
                                        className={`${themeClasses.textMuted} hover:${themeClasses.text}`}
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await handleUpdateTicketType(e);
                                        window.location.href = 'http://localhost:3000/organizer/events';
                                    } catch (error) {
                                        console.error('Update failed:', error);
                                    }
                                }} className="space-y-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">✅ {t('safeToEdit')}</h4>
                                        <p className="text-xs text-green-700 dark:text-green-300">
                                            {t('safeToEdit')} - {t('noTicketsSold')} {t('eventDraftStatus')}.
                                        </p>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('ticketTypeName')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editTicketData.name}
                                            onChange={handleEditTicketInputChange}
                                            className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${ticketFormErrors.name ? 'border-red-500' : ''}`}
                                            placeholder="e.g., General Admission, VIP, Early Bird"
                                        />
                                        {ticketFormErrors.name && <p className="text-red-500 text-sm mt-1">{ticketFormErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                            {t('ticketDescription')}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={editTicketData.description}
                                            onChange={handleEditTicketInputChange}
                                            rows={3}
                                            className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text}`}
                                            placeholder={t('optionalTicketDescription')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                                {t('price')} ({CURRENCIES[userCurrency as keyof typeof CURRENCIES]?.symbol || '$'}) *
                                                <span className={`text-xs ${themeClasses.textMuted} ml-2`}>
                                                    (Converted from USD)
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={editTicketData.price}
                                                onChange={handleEditTicketInputChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${ticketFormErrors.price ? 'border-red-500' : ''}`}
                                                placeholder="0.00"
                                            />
                                            {ticketFormErrors.price && <p className="text-red-500 text-sm mt-1">{ticketFormErrors.price}</p>}
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                                                {t('quantity')} *
                                            </label>
                                            <input
                                                type="number"
                                                name="quantityAvailable"
                                                value={editTicketData.quantityAvailable}
                                                onChange={handleEditTicketInputChange}
                                                min="1"
                                                className={`w-full px-4 py-2 ${themeClasses.card} ${themeClasses.border} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.text} ${ticketFormErrors.quantityAvailable ? 'border-red-500' : ''}`}
                                                placeholder={t('quantity')}
                                            />
                                            {ticketFormErrors.quantityAvailable && <p className="text-red-500 text-sm mt-1">{ticketFormErrors.quantityAvailable}</p>}
                                        </div>
                                    </div>

                                    <div className={`flex justify-end space-x-4 pt-6 border-t ${themeClasses.border}`}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditTicketForm(false);
                                                setEditingTicketType(null);
                                            }}
                                            className={`px-6 py-2 ${themeClasses.border} border ${themeClasses.text} rounded-lg ${themeClasses.hover} transition-colors`}
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={ticketFormLoading}
                                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {ticketFormLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {t('loading')}...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {t('updateTicketType')}
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

export default EditEventPage;