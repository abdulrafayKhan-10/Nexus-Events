/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
    Download,
    Edit,
    Lock,
    AlertTriangle,
    Info
} from 'lucide-react';

interface Event {
    eventId: number;
    title: string;
    date: string;
    venue: string;
    isPublished: boolean;
    status: string;
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
    eventStatus?: string;
    isEventPublished?: boolean;
    ticketsSold?: number;
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

interface CreateTicketTypeData {
    eventId: string;
    name: string;
    description: string;
    price: string;
    quantity: string;
}

interface CheckInResponse {
    ticketNumber: string;
    attendeeName: string;
    eventTitle: string;
    ticketTypeName: string;
    checkInDate: string;
    success: boolean;
}

interface ApiErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
}

interface EditTicketTypeData extends CreateTicketTypeData {
    ticketTypeId: number;
}

const TicketsPage = () => {
    const router = useRouter();
    const { user, isOrganizer } = useAuth();
    const [activeTab, setActiveTab] = useState<'types' | 'validate' | 'checkin'>('types');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [ticketNumber, setTicketNumber] = useState('');
    const [validationResult, setValidationResult] = useState<TicketValidation | null>(null);
    const [validating, setValidating] = useState(false);

    const [checkInNumber, setCheckInNumber] = useState('');
    const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
    const [checkingIn, setCheckingIn] = useState(false);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251';

    const getAuthToken = (): string | null => {
        try {
            return localStorage.getItem('authToken');
        } catch (error) {
            return null;
        }
    };

    const handleApiError = (error: unknown): string => {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'An unexpected error occurred';
    };


    const [formData, setFormData] = useState<CreateTicketTypeData>({
        eventId: '',
        name: '',
        description: '',
        price: '',
        quantity: ''
    });

    const [editFormData, setEditFormData] = useState<EditTicketTypeData>({
        ticketTypeId: 0,
        eventId: '',
        name: '',
        description: '',
        price: '',
        quantity: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user && !isOrganizer) {
            router.push('/');
        }
    }, [user, isOrganizer, router]);

    useEffect(() => {
        if (user && isOrganizer) {
            fetchEvents();
        }
    }, [user, isOrganizer]);

    useEffect(() => {
        if (events.length > 0) {
            fetchTicketTypes();
        }
    }, [events]);

    const fetchEvents = async (): Promise<void> => {
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                setError('Authentication required. Please log in again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/events/my-events`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(data.map((event: any) => ({
                    eventId: event.eventId,
                    title: event.title,
                    date: event.date || event.eventDate || event.startDateTime,
                    venue: event.venueName || event.venue || 'TBD',
                    isPublished: event.isPublished || false,
                    status: event.status || 'Draft'
                })));
                setError(''); 
            } else {
                const errorMessage = `Failed to fetch events (${response.status})`;
                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(`Failed to fetch events: ${errorMessage}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching events:', error);
            }
        }
    };

    const fetchTicketTypes = async (): Promise<void> => {
        try {
            setLoading(true);
            const authToken = getAuthToken();
            if (!authToken) {
                setError('Authentication required. Please log in again.');
                return;
            }

            const allTicketTypes: TicketType[] = [];

            for (const event of events) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/tickets/event/${event.eventId}/ticket-types`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });

                    if (response.ok) {
                        const eventTicketTypes = await response.json();
                        const typesWithEventInfo = eventTicketTypes.map((type: any) => ({
                            ...type,
                            eventTitle: event.title,
                            eventStatus: event.status,
                            isEventPublished: event.isPublished,
                            ticketsSold: (type.quantity || 0) - (type.remainingQuantity || type.quantity || 0)
                        }));
                        allTicketTypes.push(...typesWithEventInfo);
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn(`Failed to fetch ticket types for event ${event.eventId}:`, error);
                    }
                }
            }

            setTicketTypes(allTicketTypes);
            setError(''); 
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(`Failed to fetch ticket types: ${errorMessage}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching ticket types:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const canEditTicketType = (ticketType: TicketType): { canEdit: boolean; reason: string } => {
        if (ticketType.isEventPublished) {
            return {
                canEdit: false,
                reason: 'Event is published. Ticket types cannot be modified to preserve existing sales data.'
            };
        }

        const ticketsSold = ticketType.ticketsSold || 0;
        if (ticketsSold > 0) {
            return {
                canEdit: false,
                reason: `${ticketsSold} ticket(s) already sold. Editing is locked to preserve purchase data.`
            };
        }

        if (ticketType.eventStatus && ticketType.eventStatus.toLowerCase() !== 'draft') {
            return {
                canEdit: false,
                reason: 'Event must be in DRAFT status to modify ticket types.'
            };
        }

        return {
            canEdit: true,
            reason: 'Ticket type can be safely modified.'
        };
    };

    const getEditingStatus = (ticketType: TicketType) => {
        const { canEdit, reason } = canEditTicketType(ticketType);
        const ticketsSold = ticketType.ticketsSold || 0;

        if (!canEdit) {
            return {
                status: 'locked',
                icon: Lock,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                reason: reason
            };
        }

        return {
            status: 'editable',
            icon: Edit,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            reason: 'Safe to edit - no sales yet'
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (isEdit = false) => {
        const errors: Record<string, string> = {};
        const data = isEdit ? editFormData : formData;

        if (!data.eventId) errors.eventId = 'Event is required';
        if (!data.name.trim()) errors.name = 'Ticket type name is required';
        if (!data.price || parseFloat(data.price) < 0) errors.price = 'Valid price is required';
        if (!data.quantity || parseInt(data.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';

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

    const resetEditForm = () => {
        setEditFormData({
            ticketTypeId: 0,
            eventId: '',
            name: '',
            description: '',
            price: '',
            quantity: ''
        });
        setFormErrors({});
        setShowEditForm(false);
        setEditingTicketType(null);
    };

    const openEditForm = (ticketType: TicketType) => {
        const { canEdit } = canEditTicketType(ticketType);

        if (!canEdit) {
            setError(getEditingStatus(ticketType).reason);
            return;
        }

        setEditingTicketType(ticketType);
        setEditFormData({
            ticketTypeId: ticketType.ticketTypeId,
            eventId: ticketType.eventId.toString(),
            name: ticketType.name,
            description: ticketType.description || '',
            price: ticketType.price.toString(),
            quantity: ticketType.quantity.toString()
        });
        setShowEditForm(true);
    };

    const handleCreateTicketType = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) return;

        setFormLoading(true);
        setError('');
        setSuccess('');

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('Authentication required. Please log in again.');
            }

            const payload = {
                eventId: parseInt(formData.eventId),
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity)
            };

            const response = await fetch(`${API_BASE_URL}/api/tickets/ticket-types`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess('Ticket type created successfully!');
                await fetchTicketTypes();
                resetForm();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                let errorMessage = `Failed to create ticket type (${response.status})`;

                try {
                    const errorData: ApiErrorResponse = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }

                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(`Failed to create ticket type: ${errorMessage}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('Error creating ticket type:', error);
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateTicketType = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateForm(true)) return;

        if (editingTicketType) {
            const { canEdit, reason } = canEditTicketType(editingTicketType);
            if (!canEdit) {
                setError(reason);
                return;
            }
        }

        setFormLoading(true);
        setError('');
        setSuccess('');

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('Authentication required. Please log in again.');
            }

            const payload = {
                name: editFormData.name.trim(),
                description: editFormData.description.trim() || null,
                price: parseFloat(editFormData.price),
                quantity: parseInt(editFormData.quantity)
            };

            const response = await fetch(`${API_BASE_URL}/api/tickets/ticket-types/${editFormData.ticketTypeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess('Ticket type updated successfully!');
                await fetchTicketTypes();
                resetEditForm();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                let errorMessage = `Failed to update ticket type (${response.status})`;

                try {
                    const errorData: ApiErrorResponse = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }

                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(`Failed to update ticket type: ${errorMessage}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('Error updating ticket type:', error);
            }
        } finally {
            setFormLoading(false);
        }
    };


    const handleValidateTicket = async (): Promise<void> => {
        if (!ticketNumber.trim()) {
            setError('Please enter a ticket number');
            return;
        }

        setValidating(true);
        setError('');
        setValidationResult(null);

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('Authentication required. Please log in again.');
            }

            const response = await fetch(`${API_BASE_URL}/api/tickets/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(ticketNumber.trim())
            });

            if (response.ok) {
                const data: TicketValidation = await response.json();
                setValidationResult(data);
            } else {
                let errorMessage = `Failed to validate ticket (${response.status})`;

                try {
                    const errorData: ApiErrorResponse = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }

                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(`Failed to validate ticket: ${errorMessage}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('Error validating ticket:', error);
            }
        } finally {
            setValidating(false);
        }
    };

    const handleCheckInTicket = async (): Promise<void> => {
        if (!checkInNumber.trim()) {
            setError('Please enter a ticket number');
            return;
        }

        setCheckingIn(true);
        setError('');
        setCheckInResult(null);

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('Authentication required. Please log in again.');
            }

            const response = await fetch(`${API_BASE_URL}/api/tickets/check-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ ticketNumber: checkInNumber.trim() })
            });

            if (response.ok) {
                const data: CheckInResponse = await response.json();
                setCheckInResult(data);
                setSuccess('Ticket checked in successfully!');
                setCheckInNumber('');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                let errorMessage = `Failed to check in ticket (${response.status})`;

                try {
                    const errorData: ApiErrorResponse = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }

                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(`Failed to check in ticket: ${errorMessage}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('Error checking in ticket:', error);
            }
        } finally {
            setCheckingIn(false);
        }
    };

    const filteredTicketTypes = ticketTypes.filter(ticketType => {
        const matchesSearch = ticketType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticketType.eventTitle && ticketType.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesEvent = !selectedEvent || ticketType.eventId.toString() === selectedEvent;
        return matchesSearch && matchesEvent;
    });

    const editableCount = filteredTicketTypes.filter(tt => canEditTicketType(tt).canEdit).length;
    const lockedCount = filteredTicketTypes.length - editableCount;

    if (!user || !isOrganizer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
                            <p className="text-gray-600 mt-1">Manage ticket types, validate tickets, and handle check-ins</p>
                        </div>
                    </div>
                </div>

                {/* Smart Editing Rules Notice */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Smart Ticket Type Editing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
                        <div>
                            <p className="font-medium mb-1">✅ When you CAN edit:</p>
                            <ul className="space-y-1">
                                <li>• Event is in DRAFT status</li>
                                <li>• No tickets have been sold yet</li>
                                <li>• Event is not published</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium mb-1">🔒 When editing is LOCKED:</p>
                            <ul className="space-y-1">
                                <li>• Event is published (to preserve sales data)</li>
                                <li>• Tickets have already been sold</li>
                                <li>• Event status is not DRAFT</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                            <p className="text-green-700">{success}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('types')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'types'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Ticket className="h-4 w-4 inline mr-2" />
                                Ticket Types ({filteredTicketTypes.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('validate')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'validate'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <QrCode className="h-4 w-4 inline mr-2" />
                                Validate Tickets
                            </button>
                            <button
                                onClick={() => setActiveTab('checkin')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'checkin'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <CheckCircle className="h-4 w-4 inline mr-2" />
                                Check-in
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Ticket Types Tab */}
                {activeTab === 'types' && (
                    <div className="space-y-6">
                        {/* Stats and Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-2xl font-bold text-gray-900">{filteredTicketTypes.length}</div>
                                <div className="text-sm text-gray-600">Total Ticket Types</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-600">{editableCount}</div>
                                <div className="text-sm text-gray-600">Editable Types</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-red-200">
                                <div className="text-2xl font-bold text-red-600">{lockedCount}</div>
                                <div className="text-sm text-gray-600">Locked Types</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center">
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search ticket types..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Events</option>
                                        {events.map(event => (
                                            <option key={event.eventId} value={event.eventId.toString()}>
                                                {event.title} ({event.isPublished ? 'Published' : 'Draft'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Types List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading ticket types...</span>
                                </div>
                            ) : filteredTicketTypes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket types found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm || selectedEvent ? 'Try adjusting your filters' : 'Create your first ticket type'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ticket Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Event & Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Sales & Availability
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Edit Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTicketTypes.map((ticketType) => {
                                                const editStatus = getEditingStatus(ticketType);
                                                const { canEdit } = canEditTicketType(ticketType);
                                                const ticketsSold = ticketType.ticketsSold || 0;

                                                return (
                                                    <tr key={ticketType.ticketTypeId} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{ticketType.name}</div>
                                                                {ticketType.description && (
                                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{ticketType.description}</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">{ticketType.eventTitle || 'Unknown Event'}</div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ticketType.isEventPublished
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-orange-100 text-orange-800'
                                                                    }`}>
                                                                    {ticketType.isEventPublished ? 'Published' : 'Draft'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center text-sm text-gray-900">
                                                                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                                                                RM {ticketType.price.toFixed(2)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center text-sm">
                                                                    <span className="text-gray-600 mr-2">Sold:</span>
                                                                    <span className={`font-medium ${ticketsSold > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                                                                        {ticketsSold}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-900">
                                                                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                                                                    {ticketType.remainingQuantity} / {ticketType.quantity}
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full ${ticketsSold > 0 ? 'bg-blue-600' : 'bg-gray-400'}`}
                                                                        style={{
                                                                            width: `${((ticketType.quantity - ticketType.remainingQuantity) / ticketType.quantity) * 100}%`
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`p-2 rounded-lg ${editStatus.bgColor} ${editStatus.borderColor} border`}>
                                                                <div className="flex items-center">
                                                                    <editStatus.icon className={`h-4 w-4 ${editStatus.color} mr-2`} />
                                                                    <span className={`text-xs font-medium ${editStatus.color}`}>
                                                                        {canEdit ? 'Editable' : 'Locked'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-600 mt-1">
                                                                    {editStatus.reason}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => openEditForm(ticketType)}
                                                                    disabled={!canEdit}
                                                                    className={`p-2 rounded-lg transition-colors ${canEdit
                                                                            ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                                                                            : 'text-gray-400 cursor-not-allowed bg-gray-50'
                                                                        }`}
                                                                    title={canEdit ? 'Edit ticket type' : editStatus.reason}
                                                                >
                                                                    {canEdit ? <Edit className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Validate Ticket</h2>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                        placeholder="Enter ticket number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
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
                                            Validating...
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="h-4 w-4 mr-2" />
                                            Validate
                                        </>
                                    )}
                                </button>
                            </div>

                            {validationResult && (
                                <div className={`mt-6 p-4 rounded-lg border ${validationResult.isValid
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}>
                                    <div className="flex items-center mb-2">
                                        {validationResult.isValid ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                        )}
                                        <h3 className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {validationResult.isValid ? 'Valid Ticket' : 'Invalid Ticket'}
                                        </h3>
                                    </div>

                                    {validationResult.ticket && (
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Ticket Number:</span> {validationResult.ticket.ticketNumber}</p>
                                            <p><span className="font-medium">Event:</span> {validationResult.ticket.eventTitle}</p>
                                            <p><span className="font-medium">Type:</span> {validationResult.ticket.ticketTypeName}</p>
                                            <p><span className="font-medium">Attendee:</span> {validationResult.ticket.attendeeName}</p>
                                            <p><span className="font-medium">Status:</span>
                                                <span className={`ml-1 ${validationResult.ticket.isUsed ? 'text-red-600' : 'text-green-600'}`}>
                                                    {validationResult.ticket.isUsed ? 'Already Used' : 'Not Used'}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    <p className={`mt-2 text-sm ${validationResult.isValid ? 'text-green-700' : 'text-red-700'
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-in Ticket</h2>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={checkInNumber}
                                        onChange={(e) => setCheckInNumber(e.target.value)}
                                        placeholder="Enter ticket number to check-in"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
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
                                            Checking in...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Check-in
                                        </>
                                    )}
                                </button>
                            </div>

                            {checkInResult && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <h3 className="font-medium text-green-800">Ticket Checked In Successfully</h3>
                                    </div>
                                    <div className="space-y-2 text-sm text-green-700">
                                        <p><span className="font-medium">Ticket Number:</span> {checkInResult.ticketNumber}</p>
                                        <p><span className="font-medium">Attendee:</span> {checkInResult.attendeeName}</p>
                                        <p><span className="font-medium">Event:</span> {checkInResult.eventTitle}</p>
                                        <p><span className="font-medium">Type:</span> {checkInResult.ticketTypeName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Create Ticket Type Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Create Ticket Type</h2>
                                    <button
                                        onClick={resetForm}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTicketType} className="space-y-4">
                                    {/* Business Rules Warning */}
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Ticket Creation Requirements</h4>
                                        <ul className="text-xs text-yellow-700 space-y-1">
                                            <li>• Event must be in <strong>DRAFT</strong> status (not published)</li>
                                            <li>• Event must have <strong>no existing ticket sales</strong></li>
                                            <li>• You must be the <strong>event organizer</strong></li>
                                            <li>• If this fails, edit ticket types during event creation instead</li>
                                        </ul>
                                    </div>

                                    {/* Event Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event *
                                        </label>
                                        <select
                                            name="eventId"
                                            value={formData.eventId}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.eventId ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select an event</option>
                                            {events.map(event => (
                                                <option key={event.eventId} value={event.eventId.toString()}>
                                                    {event.title} - {event.isPublished ? '🔒 Published' : '✏️ Draft'}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.eventId && <p className="text-red-500 text-sm mt-1">{formErrors.eventId}</p>}
                                        {events.length === 0 && (
                                            <p className="text-amber-600 text-sm mt-1">
                                                No events found. You need to create an event first before creating ticket types.
                                            </p>
                                        )}
                                    </div>

                                    {/* Rest of the form fields remain the same */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ticket Type Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., General Admission, VIP, Early Bird"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                                            placeholder="Optional description of what this ticket includes..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 ${formErrors.price ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="0.00"
                                            />
                                            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Number of tickets available"
                                            />
                                            {formErrors.quantity && <p className="text-red-500 text-sm mt-1">{formErrors.quantity}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {formLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Create Ticket Type
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
                {showEditForm && editingTicketType && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Edit Ticket Type</h2>
                                    <button
                                        onClick={resetEditForm}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateTicketType} className="space-y-4">
                                    {/* Safe Edit Notice */}
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h4 className="text-sm font-medium text-green-800 mb-2">✅ Safe to Edit</h4>
                                        <p className="text-xs text-green-700">
                                            This ticket type can be safely modified because no tickets have been sold yet
                                            and the event is still in draft status.
                                        </p>
                                    </div>

                                    {/* Event Info (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event
                                        </label>
                                        <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                                            {editingTicketType.eventTitle}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ticket Type Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., General Admission, VIP, Early Bird"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditInputChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                                            placeholder="Optional description of what this ticket includes..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={editFormData.price}
                                                onChange={handleEditInputChange}
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 ${formErrors.price ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="0.00"
                                            />
                                            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={editFormData.quantity}
                                                onChange={handleEditInputChange}
                                                min="1"
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Number of tickets available"
                                            />
                                            {formErrors.quantity && <p className="text-red-500 text-sm mt-1">{formErrors.quantity}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={resetEditForm}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {formLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Ticket Type
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