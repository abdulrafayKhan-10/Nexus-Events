/* eslint-disable @typescript-eslint/no-unused-vars */
// app/events/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Users, ArrowLeft, ShoppingCart, Plus, Minus, Star, Share, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useThemeClasses } from '@/hooks/useTheme';
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
    currency: string;
    isOnline: boolean;
    onlineUrl?: string;
    ticketsSold: number;
    availableTickets: number;
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

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const themeClasses = useThemeClasses();
    const toast = useToast();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
            fetchTicketTypes();
            loadCartFromStorage();
        }
    }, [eventId]);

    const loadCartFromStorage = () => {
        const savedCart = localStorage.getItem('eventCart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                const items = Array.isArray(parsed) ? parsed : (parsed.items ?? []);
                setCart(items);
            } catch (error) {
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
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
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
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Event link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="text-center">
                    <h1 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>Event Not Found</h1>
                    <p className={`${themeClasses.textMuted} mb-8`}>{error}</p>
                    <button
                        onClick={() => router.push('/events')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.background}`}>
            {/* Back Button */}
            <div className={`${themeClasses.card} ${themeClasses.border} border-b`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className={`flex items-center ${themeClasses.textMuted} hover:${themeClasses.text}`}
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Events
                        </button>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-2 rounded-full ${isLiked ? 'text-red-500' : `${themeClasses.textMuted} hover:text-red-500`}`}
                            >
                                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={shareEvent}
                                className={`p-2 rounded-full ${themeClasses.textMuted} hover:text-blue-500`}
                            >
                                <Share className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative">
                <div className="h-64 md:h-96 bg-gradient-to-r from-blue-600 to-purple-700">
                    {event.bannerImageUrl || event.imageUrl ? (
                        <img
                            src={event.bannerImageUrl || event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="h-24 w-24 text-white opacity-50" />
                        </div>
                    )}
                </div>

                {/* Event Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-white">
                            <div className="flex items-center mb-2">
                                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full mr-4">
                                    {event.categoryName}
                                </span>
                                {event.isFeatured && (
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                                        <span className="text-sm">Featured</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">{event.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-lg">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    <span>{formatDate(event.startDateTime)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    <span>{formatTime(event.startDateTime)}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    <span>{event.isOnline ? 'Online Event' : `${event.venueName}, ${event.venueCity}`}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Event Details */}
                    <div className="lg:col-span-2">
                        <div className={`${themeClasses.card} rounded-lg shadow-md ${themeClasses.border} border p-6 mb-6`}>
                            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>About This Event</h2>
                            <div className="prose max-w-none">
                                <p className={`${themeClasses.textMuted} leading-relaxed whitespace-pre-line`}>{event.description}</p>
                            </div>

                            {event.isOnline && event.onlineUrl && (
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Online Event</h3>
                                    <p className="text-blue-700 dark:text-blue-300">This event will be held online. Access details will be provided after purchase.</p>
                                </div>
                            )}

                            {event.tags && (
                                <div className="mt-6">
                                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.split(',').map((tag, index) => (
                                            <span key={index} className={`px-3 py-1 ${themeClasses.isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-full text-sm`}>
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Organizer Info */}
                        <div className={`${themeClasses.card} rounded-lg shadow-md ${themeClasses.border} border p-6`}>
                            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Event Organizer</h3>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className={`font-medium ${themeClasses.text}`}>{event.organizerName}</p>
                                    <p className={themeClasses.textMuted}>Event Organizer</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Purchase Sidebar */}
                    <div className="lg:col-span-1">
                        <div className={`${themeClasses.card} rounded-lg shadow-md ${themeClasses.border} border p-6 sticky top-4`}>
                            {/* Cart Summary at top if items exist */}
                            {cart.length > 0 && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center">
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            In Your Cart
                                        </h4>
                                        <span className="text-sm text-green-700 dark:text-green-300">{getTotalItems()} items</span>
                                    </div>
                                    <div className="space-y-2">
                                        {cart.map((item) => (
                                            <div key={item.ticketTypeId} className="flex justify-between items-center text-sm">
                                                <span className="text-green-800 dark:text-green-200">{item.name} x{item.quantity}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-green-900 dark:text-green-100">${(item.price * item.quantity).toFixed(2)}</span>
                                                    <button
                                                        onClick={() => removeFromCart(item.ticketTypeId)}
                                                        className="text-red-500 hover:text-red-700 text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                                        <div className="flex justify-between font-bold text-green-900 dark:text-green-100">
                                            <span>Total: ${getTotalPrice().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>Get Tickets</h3>

                            {/* Event Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{event.ticketsSold}</p>
                                    <p className={`text-sm ${themeClasses.textMuted}`}>Tickets Sold</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{event.availableTickets}</p>
                                    <p className={`text-sm ${themeClasses.textMuted}`}>Available</p>
                                </div>
                            </div>

                            {/* Ticket Types */}
                            <div className="space-y-4">
                                {ticketTypes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className={themeClasses.textMuted}>No tickets available yet</p>
                                    </div>
                                ) : (
                                    ticketTypes.map((ticketType) => (
                                        <div key={ticketType.ticketTypeId} className={`${themeClasses.border} border rounded-lg p-4`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h4 className={`font-semibold ${themeClasses.text}`}>{ticketType.name}</h4>
                                                    {ticketType.description && (
                                                        <p className={`text-sm ${themeClasses.textMuted} mt-1`}>{ticketType.description}</p>
                                                    )}
                                                </div>
                                                <p className={`text-lg font-bold ${themeClasses.text} ml-4`}>
                                                    ${ticketType.price.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className={`flex justify-between items-center text-sm ${themeClasses.textMuted} mb-3`}>
                                                <span>{ticketType.quantityRemaining} remaining</span>
                                                <span>Max {ticketType.maxQuantityPerOrder} per order</span>
                                            </div>

                                            {ticketType.isOnSale && ticketType.quantityRemaining > 0 ? (
                                                <div className="space-y-3">
                                                    {/* Quantity Selector */}
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-sm font-medium ${themeClasses.text}`}>Quantity:</span>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => updateQuantity(ticketType.ticketTypeId, -1)}
                                                                disabled={quantities[ticketType.ticketTypeId] === 0}
                                                                className={`w-8 h-8 ${themeClasses.border} border rounded flex items-center justify-center ${themeClasses.textMuted} ${themeClasses.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className={`w-8 text-center font-medium ${themeClasses.text}`}>
                                                                {quantities[ticketType.ticketTypeId] || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(ticketType.ticketTypeId, 1)}
                                                                disabled={quantities[ticketType.ticketTypeId] >= Math.min(ticketType.maxQuantityPerOrder, ticketType.quantityRemaining)}
                                                                className={`w-8 h-8 ${themeClasses.border} border rounded flex items-center justify-center ${themeClasses.textMuted} ${themeClasses.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Add to Cart Button */}
                                                    <button
                                                        onClick={() => addToCart(ticketType)}
                                                        disabled={quantities[ticketType.ticketTypeId] === 0}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                                    >
                                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
                                                >
                                                    {ticketType.quantityRemaining === 0 ? 'Sold Out' : 'Not Available'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Purchase Button */}
                            {cart.length > 0 && (
                                <div className={`mt-6 pt-6 border-t ${themeClasses.border}`}>
                                    <button
                                        onClick={handlePurchase}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-lg"
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Proceed to Checkout
                                    </button>
                                    <p className={`text-sm ${themeClasses.textMuted} text-center mt-2`}>
                                        Total: ${getTotalPrice().toFixed(2)} ({getTotalItems()} tickets)
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