/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosResponse, AxiosError } from 'axios';

const getApiBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';
    }
    return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5251';
};

const API_BASE_URL = getApiBaseUrl();


interface User {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

interface AuthResponse {
    token: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    expiresAt: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export interface Event {
    actualRevenue: any;
    eventDate: string | number | Date;
    revenue: number;
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

interface TicketType {
    ticketTypeId: number;
    eventId: number;
    eventTitle?: string;
    name: string;
    description?: string;
    price: number;
    quantityAvailable: number;
    quantitySold: number;
    quantityRemaining: number;
    isActive: boolean;
    isOnSale: boolean;
    isEventPublished?: boolean;
    eventStatus?: string;
    saleStartDate?: string;
    saleEndDate?: string;
    minQuantityPerOrder?: number;
    maxQuantityPerOrder?: number;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface Ticket {
    ticketId: number;
    eventId: number;
    eventTitle: string;
    ticketTypeName: string;
    ticketNumber: string;
    qrCode?: string;
    pricePaid: number;
    status: string;
    purchaseDate: string;
    attendeeFirstName?: string;
    attendeeLastName?: string;
    attendeeEmail?: string;
    eventStartDateTime: string;
    venueName: string;
    venueAddress: string;
}

interface Order {
    orderId: number;
    orderNumber: string;
    eventTitle: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    tickets: Ticket[];
}

interface CreateEventDto {
    title: string;
    description: string;
    shortDescription?: string;
    startDateTime: string;
    endDateTime?: string;
    categoryId: number;
    venueId?: number;
    imageUrl?: string;
    bannerImageUrl?: string;
    tags?: string;
    maxAttendees: number;
    basePrice: number;
    currency: string;
    isOnline: boolean;
    onlineUrl?: string;
}

interface UpdateEventDto {
    title?: string;
    description?: string;
    shortDescription?: string;
    startDateTime?: string;
    endDateTime?: string;
    categoryId?: number;
    venueId?: number;
    imageUrl?: string;
    bannerImageUrl?: string;
    tags?: string;
    maxAttendees?: number;
    basePrice?: number;
    currency?: string;
    isOnline?: boolean;
    onlineUrl?: string;
}

interface CreateTicketTypeDto {
    eventId: number;
    name: string;
    description?: string;
    price: number;
    quantityAvailable: number;
    saleStartDate?: string;
    saleEndDate?: string;
    minQuantityPerOrder?: number;
    maxQuantityPerOrder?: number;
    sortOrder?: number;
}

interface UpdateTicketTypeDto {
    name?: string;
    description?: string;
    price?: number;
    quantityAvailable?: number;
    saleStartDate?: string;
    saleEndDate?: string;
    minQuantityPerOrder?: number;
    maxQuantityPerOrder?: number;
    sortOrder?: number;
    isActive?: boolean;
}

interface Category {
    categoryId: number;
    name: string;
    description?: string;
}

interface CreateCategoryDto {
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

interface CreateVenueDto {
    name: string;
    address: string;
    city: string;
    capacity: number;
    description?: string;
}

interface PurchaseTicketsDto {
    eventId: number;
    ticketItems: {
        ticketTypeId: number;
        quantity: number;
    }[];
    billingEmail: string;
    billingFirstName: string;
    billingLastName: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingZipCode?: string;
    promoCode?: string;
    attendees?: {
        firstName: string;
        lastName: string;
        email: string;
    }[];
}

export interface PromoCode {
    promoCodeId: number;
    code: string;
    description: string;
    type: string;
    value: number;
    formattedValue: string;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    scope: string;
    eventId?: number;
    eventTitle?: string;
    startDate: string;
    endDate: string;
    maxUsageCount: number;
    currentUsageCount: number;
    remainingUsage: number;
    maxUsagePerUser?: number;
    status: string;
    isActive: boolean;
    isValid: boolean;
    invalidReason?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface PromoCodeStats {
    totalPromoCodes: number;
    activePromoCodes: number;
    totalUsages: number;
    totalDiscountGiven: number;
    averageDiscountAmount: number;
    topPerformingCodes: Array<{
        code: string;
        usages: number;
        totalDiscount: number;
    }>;
}

interface PromoCodeAnalytics {
    promoCodeId: number;
    code: string;
    totalUsages: number;
    maxUsages: number;
    remainingUsages: number;
    totalDiscountGiven: number;
    averageDiscountAmount: number;
    totalOrderValue: number;
    conversionRate: number;
    usageByDay: Array<{
        date: string;
        usages: number;
        totalDiscount: number;
        totalOrderValue: number;
    }>;
    usageByEvent: Array<{
        eventId: number;
        eventTitle: string;
        usages: number;
        totalDiscount: number;
        totalOrderValue: number;
    }>;
}

export interface CreatePromoCodeDto {
    code: string;
    description?: string;
    type: number;
    value: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    scope: number;
    eventId?: number;
    startDate: string;
    endDate: string;
    maxUsageCount: number;
    maxUsagePerUser?: number;
}

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

interface ValidatePromoCodeRequest {
    code: string;
    eventId: number;
    orderSubtotal: number;
}

interface PromoCodeValidation {
    isValid: boolean;
    message: string;
    discountAmount: number;
    formattedDiscount: string;
    promoCode?: PromoCode;
}

interface PromoCodeUsage {
    promoCodeUsageId: number;
    promoCode: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    eventTitle: string;
    discountAmount: number;
    orderSubtotal: number;
    usedAt: string;
}

interface OrderSummary {
    eventId: number;
    eventTitle: string;
    items: { ticketTypeId: number; quantity: number; }[];
    subTotal: number;
    serviceFee: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
}

interface CheckInTicketDto {
    ticketNumber: string;
}

interface TicketValidation {
    isValid: boolean;
    ticket?: Ticket;
    message: string;
}

interface UserProfile {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    profileImageUrl?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
    status: string;
    bio?: string;
    website?: string;
    timeZone?: string;
    isOrganizer: boolean;
    roles: string[];
}

interface UpdateUserProfileDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    bio?: string;
    website?: string;
    timeZone?: string;
    profileImageUrl?: string;
}

interface UserOrganization {
    companyName?: string;
    businessLicense?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

interface UpdateUserOrganizationDto {
    companyName?: string;
    businessLicense?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

interface UserPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newBookingNotifications: boolean;
    cancellationNotifications: boolean;
    lowInventoryNotifications: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    defaultTimeZone?: string;
    defaultEventDuration: number;
    defaultTicketSaleStart: number;
    defaultRefundPolicy?: string;
    requireApproval: boolean;
    autoPublish: boolean;
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    accentColor: string;
    fontSize: string;
    compactMode: boolean;
}

interface UpdateUserPreferencesDto {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    newBookingNotifications?: boolean;
    cancellationNotifications?: boolean;
    lowInventoryNotifications?: boolean;
    dailyReports?: boolean;
    weeklyReports?: boolean;
    monthlyReports?: boolean;
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
    loginNotifications?: boolean;
    defaultTimeZone?: string;
    defaultEventDuration?: number;
    defaultTicketSaleStart?: number;
    defaultRefundPolicy?: string;
    requireApproval?: boolean;
    autoPublish?: boolean;
    theme?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
    currency?: string;
    accentColor?: string;
    fontSize?: string;
    compactMode?: boolean;
}

interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

interface ImageUploadResponse {
    success: boolean;
    imageUrl?: string;
    message?: string;
}

interface ImageValidationResult {
    isValid: boolean;
    error?: string;
}

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }


    return config;
});

api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data?.success === false) {
            throw new Error(response.data.message || 'API request failed');
        }

        if (response.data?.success === true && response.data?.data !== undefined) {
            response.data = response.data.data;
        }

        if (process.env.NODE_ENV === 'development') {
        }

        return response;
    },
    (error: AxiosError) => {
        const message = (error.response?.data as any)?.message || error.message || 'Network error';


        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }

        // Create a more detailed error
        const enhancedError = new Error(message);
        (enhancedError as any).status = error.response?.status;
        (enhancedError as any).originalError = error;

        return Promise.reject(enhancedError);
    }
);

export const imageUtils = {
    getImageWithFallback: (
        imageUrl?: string,
        type: 'event-banner' | 'event-image' | 'venue' | 'user' | 'category' = 'event-image'
    ): string => {
        if (imageUrl && imageUrl.trim() !== '') {
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                return imageUrl;
            }
            const fullUrl = imageUrl.startsWith('/') ? `${API_BASE_URL}${imageUrl}` : `${API_BASE_URL}/${imageUrl}`;
            return fullUrl;
        }

        const defaults = {
            'event-banner': '/images/defaults/event-banner.jpg',
            'event-image': '/images/defaults/event-image.jpg',
            'venue': '/images/defaults/venue-placeholder.jpg',
            'user': '/images/defaults/user-avatar.jpg',
            'category': '/images/defaults/category-icon.png'
        };

        return defaults[type];
    },

    resizeImageForPreview: (file: File, maxWidth = 400, maxHeight = 300, quality = 0.8): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const img = new Image();

            img.onload = () => {
                const { width, height } = img;
                const ratio = Math.min(maxWidth / width, maxHeight / height);

                canvas.width = width * ratio;
                canvas.height = height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };

            img.src = URL.createObjectURL(file);
        });
    },

    // Get file size in human readable format
    formatFileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Helper functions for data normalization
const normalizeTicketType = (tt: any): TicketType => ({
    ticketTypeId: tt.ticketTypeId || tt.TicketTypeId,
    eventId: tt.eventId || tt.EventId,
    eventTitle: tt.eventTitle || tt.EventTitle,
    name: tt.name || tt.Name || '',
    description: tt.description || tt.Description || '',
    price: Number(tt.price || tt.Price || 0),
    quantityAvailable: Number(tt.quantityAvailable || tt.QuantityAvailable || 0),
    quantitySold: Number(tt.quantitySold || tt.QuantitySold || 0),
    quantityRemaining: Number(tt.quantityRemaining || tt.QuantityRemaining || 0),
    isActive: tt.isActive !== undefined ? tt.isActive : tt.IsActive !== undefined ? tt.IsActive : true,
    isOnSale: tt.isOnSale !== undefined ? tt.isOnSale : tt.IsOnSale !== undefined ? tt.IsOnSale : true,
    isEventPublished: tt.isEventPublished || tt.IsEventPublished || false,
    eventStatus: tt.eventStatus || tt.EventStatus || 'Draft',
    saleStartDate: tt.saleStartDate || tt.SaleStartDate,
    saleEndDate: tt.saleEndDate || tt.SaleEndDate,
    minQuantityPerOrder: Number(tt.minQuantityPerOrder || tt.MinQuantityPerOrder || 1),
    maxQuantityPerOrder: Number(tt.maxQuantityPerOrder || tt.MaxQuantityPerOrder || 10),
    sortOrder: Number(tt.sortOrder || tt.SortOrder || 0),
    createdAt: tt.createdAt || tt.CreatedAt,
    updatedAt: tt.updatedAt || tt.UpdatedAt
});

// Smart ticketing utility functions
export const canEditTicketType = (ticketType: TicketType): { canEdit: boolean; reason: string } => {
    if (ticketType.quantitySold > 0) {
        return {
            canEdit: false,
            reason: `${ticketType.quantitySold} ticket(s) already sold. Editing locked to preserve purchase data.`
        };
    }

    if (ticketType.isEventPublished) {
        return {
            canEdit: false,
            reason: 'Event is published. Limited editing to preserve sales integrity.'
        };
    }

    return {
        canEdit: true,
        reason: 'Safe to edit - no sales yet and event is unpublished.'
    };
};

export const canCreateTicketTypes = (event: Event): { canCreate: boolean; reason: string } => {
    const totalTicketsSold = event.ticketsSold || 0;

    if (totalTicketsSold > 0) {
        return {
            canCreate: false,
            reason: `Cannot create new ticket types. ${totalTicketsSold} ticket(s) have already been sold.`
        };
    }

    if (event.isPublished) {
        return {
            canCreate: true,
            reason: 'Event is published - new ticket types will be immediately available for sale.'
        };
    }

    return {
        canCreate: true,
        reason: 'Safe to create new ticket types.'
    };
};

// Auth API
export const authApi = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    verify: async (): Promise<UserProfile> => {
        const response = await api.get('/auth/verify');
        return response.data;
    },
};

// Events API - Enhanced for organizers with environment-aware URLs
export const eventsApi = {
    // Public endpoints
    getEvents: async (params?: {
        categoryId?: number;
        search?: string;
        isOnline?: boolean;
        startDate?: string;
        endDate?: string;
        page?: number;
        pageSize?: number;
    }): Promise<Event[]> => {
        const response = await api.get('/events', { params });
        return Array.isArray(response.data) ? response.data : [];
    },

    getEvent: async (id: number): Promise<Event> => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    // Organizer endpoints
    getMyEvents: async (): Promise<Event[]> => {
        const response = await api.get('/events/my-events');
        return Array.isArray(response.data) ? response.data : [];
    },

    createEvent: async (eventData: CreateEventDto): Promise<Event> => {
        const response = await api.post('/events', eventData);
        return response.data;
    },

    updateEvent: async (id: number, eventData: UpdateEventDto): Promise<Event> => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },

    deleteEvent: async (id: number): Promise<boolean> => {
        const response = await api.delete(`/events/${id}`);
        return response.status === 204 || response.status === 200;
    },

    publishEvent: async (id: number): Promise<void> => {
        await api.post(`/events/${id}/publish`);
    },

    unpublishEvent: async (id: number): Promise<void> => {
        await api.post(`/events/${id}/unpublish`);
    },

    // Enhanced create event with image upload support
    createEventWithImages: async (
        eventData: CreateEventDto,
        bannerFile?: File,
        imageFile?: File
    ): Promise<Event> => {
        try {

            const event = await eventsApi.createEvent(eventData);

            if (bannerFile) {
                try {
                    const bannerResult = await imageApi.uploadEventBanner(event.eventId, bannerFile);

                    // Update event with banner URL
                    const updateData: UpdateEventDto = { bannerImageUrl: bannerResult.imageUrl };
                    await eventsApi.updateEvent(event.eventId, updateData);
                } catch (bannerError) {
                }
            }

            // Step 3: Upload image if provided
            if (imageFile) {
                try {
                    const imageResult = await imageApi.uploadEventImage(event.eventId, imageFile);


                    // Update event with image URL
                    const updateData: UpdateEventDto = { imageUrl: imageResult.imageUrl };
                    await eventsApi.updateEvent(event.eventId, updateData);
                } catch (imageError) {
                }
            }

            // Step 4: Return the updated event
            return await eventsApi.getEvent(event.eventId);
        } catch (error: any) {
            throw error;
        }
    },

    // Update event with image handling
    updateEventWithImages: async (
        eventId: number,
        eventData: UpdateEventDto,
        bannerFile?: File,
        imageFile?: File,
        deleteBanner = false,
        deleteImage = false
    ): Promise<Event> => {
        try {


            // Step 1: Update event data
            let updatedEvent = await eventsApi.updateEvent(eventId, eventData);

            // Step 2: Handle banner operations
            if (deleteBanner) {
                await imageApi.deleteEventBanner(eventId);
            } else if (bannerFile) {
                const bannerResult = await imageApi.uploadEventBanner(eventId, bannerFile);
                const updateData: UpdateEventDto = { bannerImageUrl: bannerResult.imageUrl };
                updatedEvent = await eventsApi.updateEvent(eventId, updateData);
            }

            // Step 3: Handle image operations
            if (deleteImage) {
                await imageApi.deleteEventImage(eventId);
            } else if (imageFile) {
                const imageResult = await imageApi.uploadEventImage(eventId, imageFile);
                const updateData: UpdateEventDto = { imageUrl: imageResult.imageUrl };
                updatedEvent = await eventsApi.updateEvent(eventId, updateData);
            }


            return await eventsApi.getEvent(eventId);
        } catch (error: any) {

            throw error;
        }
    }
};

// Categories API
export const categoriesApi = {
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/categories');
        return Array.isArray(response.data) ? response.data : [];
    },

    getCategory: async (id: number): Promise<Category> => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    createCategory: async (categoryData: CreateCategoryDto): Promise<Category> => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    }
};

// Venues API
export const venuesApi = {
    getVenues: async (city?: string): Promise<Venue[]> => {
        const params = city ? { city } : {};
        const response = await api.get('/venues', { params });
        return Array.isArray(response.data) ? response.data : [];
    },

    getVenue: async (id: number): Promise<Venue> => {
        const response = await api.get(`/venues/${id}`);
        return response.data;
    },

    createVenue: async (venueData: CreateVenueDto): Promise<Venue> => {
        const response = await api.post('/venues', venueData);
        return response.data;
    },

    createVenueWithImage: async (
        venueData: CreateVenueDto,
        imageFile?: File
    ): Promise<Venue> => {
        try {

            const venue = await venuesApi.createVenue(venueData);

            if (imageFile) {
                try {
                    const imageResult = await imageApi.uploadVenueImage(venue.venueId, imageFile);
                } catch (imageError) {
                }
            }

            // Step 3: Return updated venue
            return await venuesApi.getVenue(venue.venueId);
        } catch (error: any) {
            throw error;
        }
    }
};

// Image API
export const imageApi = {
    // Validation helper
    validateImageFile: (file: File): ImageValidationResult => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)'
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'File size must be less than 5MB'
            };
        }

        return { isValid: true };
    },

    // Event Images
    uploadEventBanner: async (eventId: number, file: File): Promise<ImageUploadResponse> => {
        try {
            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            const formData = new FormData();
            formData.append('file', file);


            const response = await api.post(`/events/${eventId}/upload-banner`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to upload event banner: ${error.message}`);
        }
    },

    uploadEventImage: async (eventId: number, file: File): Promise<ImageUploadResponse> => {
        try {
            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            const formData = new FormData();
            formData.append('file', file);


            const response = await api.post(`/events/${eventId}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to upload event image: ${error.message}`);
        }
    },

    deleteEventBanner: async (eventId: number): Promise<ImageUploadResponse> => {
        try {
            const response = await api.delete(`/events/${eventId}/banner`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to delete event banner: ${error.message}`);
        }
    },

    deleteEventImage: async (eventId: number): Promise<ImageUploadResponse> => {
        try {
            const response = await api.delete(`/events/${eventId}/image`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to delete event image: ${error.message}`);
        }
    },

    // User Profile Images
    uploadUserProfileImage: async (file: File): Promise<ImageUploadResponse> => {
        try {
            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            const formData = new FormData();
            formData.append('file', file);


            const response = await api.post('/user/upload-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('📸 Profile image upload failed:', error.message);
            throw new Error(`Failed to upload profile image: ${error.message}`);
        }
    },

    deleteUserProfileImage: async (): Promise<ImageUploadResponse> => {
        try {
            const response = await api.delete('/user/profile-image');
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to delete profile image: ${error.message}`);
        }
    },

    // Venue Images
    uploadVenueImage: async (venueId: number, file: File): Promise<ImageUploadResponse> => {
        try {
            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            const formData = new FormData();
            formData.append('file', file);


            const response = await api.post(`/venues/${venueId}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to upload venue image: ${error.message}`);
        }
    },

    deleteVenueImage: async (venueId: number): Promise<ImageUploadResponse> => {
        try {
            const response = await api.delete(`/venues/${venueId}/image`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to delete venue image: ${error.message}`);
        }
    },

    // Category Icons (Admin only)
    uploadCategoryIcon: async (categoryId: number, file: File): Promise<ImageUploadResponse> => {
        try {
            const validation = imageApi.validateImageFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            const formData = new FormData();
            formData.append('file', file);


            const response = await api.post(`/categories/${categoryId}/upload-icon`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to upload category icon: ${error.message}`);
        }
    },

    deleteCategoryIcon: async (categoryId: number): Promise<ImageUploadResponse> => {
        try {
            const response = await api.delete(`/categories/${categoryId}/icon`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to delete category icon: ${error.message}`);
        }
    }
};

// User API
export const userApi = {
    updateProfileWithImage: async (
        profileData: UpdateUserProfileDto,
        profileImageFile?: File,
        deleteImage = false
    ): Promise<UserProfile> => {
        try {

            let updatedProfile = await userApi.updateProfile(profileData);

            if (deleteImage) {
                await imageApi.deleteUserProfileImage();
            } else if (profileImageFile) {
                await imageApi.uploadUserProfileImage(profileImageFile);
                updatedProfile = await userApi.getProfile();
            }

            return updatedProfile;
        } catch (error: any) {
            throw error;
        }
    },

    // Profile management
    getProfile: async (): Promise<UserProfile> => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to load profile: ${error.message}`);
        }
    },

    updateProfile: async (profileData: UpdateUserProfileDto): Promise<UserProfile> => {
        try {
            const response = await api.put('/user/profile', profileData);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
    },

    changePassword: async (passwordData: ChangePasswordDto): Promise<void> => {
        try {
            await api.post('/user/change-password', passwordData);
        } catch (error: any) {
            throw new Error(`Failed to change password: ${error.message}`);
        }
    },

    // Organization management
    getOrganization: async (): Promise<UserOrganization> => {
        try {
            const response = await api.get('/user/organization');
            return response.data;
        } catch (error: any) {
            return {};
        }
    },

    updateOrganization: async (orgData: UpdateUserOrganizationDto): Promise<UserOrganization> => {
        try {
            const response = await api.put('/user/organization', orgData);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to update organization: ${error.message}`);
        }
    },

    // Preferences management
    getPreferences: async (): Promise<UserPreferences> => {
        try {
            const response = await api.get('/user/preferences');
            return response.data;
        } catch (error: any) {
            return {
                emailNotifications: true,
                smsNotifications: false,
                newBookingNotifications: true,
                cancellationNotifications: true,
                lowInventoryNotifications: true,
                dailyReports: false,
                weeklyReports: true,
                monthlyReports: true,
                twoFactorEnabled: false,
                sessionTimeout: 30,
                loginNotifications: true,
                defaultTimeZone: 'America/New_York',
                defaultEventDuration: 120,
                defaultTicketSaleStart: 30,
                defaultRefundPolicy: 'flexible',
                requireApproval: false,
                autoPublish: false,
                theme: 'light',
                language: 'en',
                dateFormat: 'MM/dd/yyyy',
                timeFormat: '12h',
                currency: 'USD',
                accentColor: 'blue',
                fontSize: 'medium',
                compactMode: false
            };
        }
    },

    updatePreferences: async (preferences: Partial<UpdateUserPreferencesDto>): Promise<UserPreferences> => {
        try {


            const response = await api.put('/user/preferences', preferences);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to update preferences: ${error.message}`);
        }
    },

    updateLanguageOnly: async (language: string): Promise<void> => {
        try {

            // Try PATCH method first (if backend supports it)
            try {
                await api.patch('/user/preferences/language', { language });
                return;
            } catch (patchError) {
            }

            const minimalUpdate = {
                language,
                emailNotifications: true,
                smsNotifications: false,
                theme: 'light',
                fontSize: 'medium',
                compactMode: false
            };

            await api.put('/user/preferences', minimalUpdate);
        } catch (error: any) {
            throw error;
        }
    }
};

// Promo Codes API
export const promoCodesApi = {
    // Get all promo codes for the organizer
    getPromoCodes: async (): Promise<PromoCode[]> => {
        try {
            const response = await api.get('/PromoCodes');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            throw new Error(`Failed to load promo codes: ${error.message}`);
        }
    },

    // Get promo code statistics
    getStats: async (): Promise<PromoCodeStats> => {
        try {
            const response = await api.get('/PromoCodes/stats');
            return response.data;
        } catch (error: any) {
            return {
                totalPromoCodes: 0,
                activePromoCodes: 0,
                totalUsages: 0,
                totalDiscountGiven: 0,
                averageDiscountAmount: 0,
                topPerformingCodes: []
            };
        }
    },

    // Get single promo code
    getPromoCode: async (id: number): Promise<PromoCode> => {
        try {
            const response = await api.get(`/PromoCodes/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to load promo code: ${error.message}`);
        }
    },

    // Create a new promo code
    createPromoCode: async (data: CreatePromoCodeDto): Promise<PromoCode> => {
        try {

            // Ensure proper data types
            const payload = {
                code: data.code.trim().toUpperCase(),
                description: data.description?.trim() || null,
                type: Number(data.type),
                value: Number(data.value),
                minimumOrderAmount: data.minimumOrderAmount ? Number(data.minimumOrderAmount) : null,
                maximumDiscountAmount: data.maximumDiscountAmount ? Number(data.maximumDiscountAmount) : null,
                scope: Number(data.scope),
                eventId: data.scope === 0 ? Number(data.eventId) : null,
                startDate: data.startDate,
                endDate: data.endDate,
                maxUsageCount: Number(data.maxUsageCount),
                maxUsagePerUser: data.maxUsagePerUser ? Number(data.maxUsagePerUser) : null
            };

            const response = await api.post('/PromoCodes', payload);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to create promo code: ${error.message}`);
        }
    },

    // Update promo code
    updatePromoCode: async (id: number, data: UpdatePromoCodeDto): Promise<PromoCode> => {
        try {

            const payload = Object.fromEntries(
                Object.entries(data)
                    .filter(([_, value]) => value !== undefined)
                    .map(([key, value]) => [
                        key,
                        typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value
                    ])
            );

            const response = await api.put(`/PromoCodes/${id}`, payload);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to update promo code: ${error.message}`);
        }
    },

    deletePromoCode: async (id: number): Promise<boolean> => {
        try {
            const response = await api.delete(`/PromoCodes/${id}`);
            return response.status === 204 || response.status === 200;
        } catch (error: any) {
            throw new Error(`Failed to delete promo code: ${error.message}`);
        }
    },

    // Get analytics for a promo code
    getAnalytics: async (id: number): Promise<PromoCodeAnalytics> => {
        try {
            const response = await api.get(`/PromoCodes/${id}/analytics`);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to load analytics: ${error.message}`);
        }
    },

    // Get usage history for a promo code
    getUsageHistory: async (id: number): Promise<PromoCodeUsage[]> => {
        try {
            const response = await api.get(`/PromoCodes/${id}/usage-history`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            throw new Error(`Failed to load usage history: ${error.message}`);
        }
    },

    validatePromoCode: async (data: ValidatePromoCodeRequest): Promise<PromoCodeValidation> => {
        try {

            const response = await api.post('/PromoCodes/validate', data);
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to validate promo code: ${error.message}`);
        }
    },

    getEventPromoCodes: async (eventId: number): Promise<PromoCode[]> => {
        try {
            const response = await api.get(`/PromoCodes/event/${eventId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            throw new Error(`Failed to load event promo codes: ${error.message}`);
        }
    }
};

export const ticketsApi = {
    getEventTicketTypes: async (eventId: number): Promise<TicketType[]> => {
        try {
            const response = await api.get(`/tickets/event/${eventId}/ticket-types`);

            const ticketTypes = Array.isArray(response.data) ? response.data : [];
            const normalizedTicketTypes = ticketTypes.map(normalizeTicketType);

            return normalizedTicketTypes;
        } catch (error: any) {
            throw new Error(`Failed to load ticket types: ${error.message}`);
        }
    },

    createTicketType: async (ticketTypeData: CreateTicketTypeDto): Promise<TicketType> => {
        try {

            const payload = {
                eventId: Number(ticketTypeData.eventId),
                name: ticketTypeData.name.trim(),
                description: ticketTypeData.description?.trim() || null,
                price: Number(ticketTypeData.price),
                quantityAvailable: Number(ticketTypeData.quantityAvailable),
                saleStartDate: ticketTypeData.saleStartDate || null,
                saleEndDate: ticketTypeData.saleEndDate || null,
                minQuantityPerOrder: Number(ticketTypeData.minQuantityPerOrder || 1),
                maxQuantityPerOrder: Number(ticketTypeData.maxQuantityPerOrder || 10),
                sortOrder: Number(ticketTypeData.sortOrder || 0)
            };

            const response = await api.post('/tickets/ticket-types', payload);
            const normalizedTicketType = normalizeTicketType(response.data);

            return normalizedTicketType;
        } catch (error: any) {
            throw new Error(`Failed to create ticket type: ${error.message}`);
        }
    },

    updateTicketType: async (id: number, ticketTypeData: UpdateTicketTypeDto): Promise<TicketType> => {
        try {

            const payload = Object.fromEntries(
                Object.entries(ticketTypeData).filter(([_, value]) => value !== undefined)
            );

            const response = await api.put(`/tickets/ticket-types/${id}`, payload);
            const normalizedTicketType = normalizeTicketType(response.data);

            return normalizedTicketType;
        } catch (error: any) {
            throw new Error(`Failed to update ticket type: ${error.message}`);
        }
    },

    deleteTicketType: async (id: number): Promise<boolean> => {
        try {
            const response = await api.delete(`/tickets/ticket-types/${id}`);
            return response.status === 204 || response.status === 200;
        } catch (error: any) {
            throw new Error(`Failed to delete ticket type: ${error.message}`);
        }
    },

    getTicketType: async (id: number): Promise<TicketType> => {
        const response = await api.get(`/tickets/ticket-types/${id}`);
        return normalizeTicketType(response.data);
    },

    // Orders and Purchases
    calculateOrder: async (purchaseData: PurchaseTicketsDto): Promise<OrderSummary> => {
        const response = await api.post('/tickets/calculate-order', purchaseData);
        return response.data;
    },

    purchaseTickets: async (purchaseData: PurchaseTicketsDto): Promise<Order> => {
        const response = await api.post('/tickets/purchase', purchaseData);
        return response.data;
    },

    // User tickets
    getMyTickets: async (): Promise<Ticket[]> => {
        const response = await api.get('/tickets/my-tickets');
        return Array.isArray(response.data) ? response.data : [];
    },

    getMyTicketCount: async (): Promise<{ count: number }> => {
        const response = await api.get('/tickets/my-tickets/count');
        return response.data;
    },

    getTicket: async (id: number): Promise<Ticket> => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    // Validation and Check-in
    validateTicket: async (ticketNumber: string): Promise<TicketValidation> => {
        const response = await api.post('/tickets/validate', JSON.stringify(ticketNumber), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    checkInTicket: async (checkInData: CheckInTicketDto): Promise<Ticket> => {
        const response = await api.post('/tickets/check-in', checkInData);
        return response.data;
    }
};

// Orders API
export const ordersApi = {
    getMyOrders: async (): Promise<Order[]> => {
        const response = await api.get('/orders');
        return Array.isArray(response.data) ? response.data : [];
    },

    getOrder: async (id: number): Promise<Order> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    }
};

// Analytics API (for dashboard stats)
export const analyticsApi = {
    // Get revenue analytics
    getRevenueByEvent: async (period: string = 'all'): Promise<any> => {
        const response = await api.get(`/analytics/revenue-by-event?period=${period}`);
        return response.data;
    },

    // Get ticket sales analytics
    getTicketSales: async (period: string = 'all'): Promise<any> => {
        const response = await api.get(`/analytics/ticket-sales?period=${period}`);
        return response.data;
    },

    // Get event performance
    getEventPerformance: async (eventId?: number): Promise<any> => {
        const url = eventId
            ? `/analytics/event-performance/${eventId}`
            : '/analytics/event-performance';
        const response = await api.get(url);
        return response.data;
    }
};

// Health check and connectivity testing
export const healthApi = {
    checkConnection: async (): Promise<boolean> => {
        try {
            const response = await api.get('/health');
            return response.status === 200;
        } catch {
            return false;
        }
    },

    testAuth: async (): Promise<boolean> => {
        try {
            const response = await api.get('/events/my-events');
            return response.status === 200;
        } catch {
            return false;
        }
    }
};

// Export the configured API instance and environment info
export const apiConfig = {
    baseURL: API_BASE_URL,
    environment: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV === 'development'
};

// Export everything
export default api;

// Export environment-aware helper functions
export const getApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getImageUrl = (imagePath?: string): string => {
    return imageUtils.getImageWithFallback(imagePath);
};

// Admin API
export const adminApi = {
    getAllUsers: async (): Promise<UserProfile[]> => {
        const response = await api.get('/user/all');
        return Array.isArray(response.data) ? response.data : [];
    },

    updateUserRole: async (userId: number, role: string): Promise<UserProfile> => {
        const response = await api.put(`/user/${userId}/role`, { role });
        return response.data;
    }
};