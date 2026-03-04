'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/common/Toast';

interface CartItem {
    ticketTypeId: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartData {
    eventId: number;
    eventTheme?: any;
    items: CartItem[];
}

export default function CartPage() {
    const [cartData, setCartData] = useState<CartData | null>(null);
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        const saved = localStorage.getItem('eventCart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Handle both formats: plain array (old) or { eventId, items } (new)
                if (Array.isArray(parsed)) {
                    setCartData({ eventId: 0, items: parsed });
                } else {
                    setCartData(parsed);
                }
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    const removeItem = (ticketTypeId: number) => {
        if (!cartData) return;
        const removedItem = cartData.items.find(i => i.ticketTypeId === ticketTypeId);
        const newItems = cartData.items.filter(item => item.ticketTypeId !== ticketTypeId);
        if (newItems.length === 0) {
            localStorage.removeItem('eventCart');
            setCartData(null);
        } else {
            const newData = { ...cartData, items: newItems };
            localStorage.setItem('eventCart', JSON.stringify(newData));
            setCartData(newData);
        }
        if (removedItem) toast.info('Removed from cart', removedItem.name);
    };

    const updateQuantity = (ticketTypeId: number, newQty: number) => {
        if (!cartData || newQty < 1) return;
        const newItems = cartData.items.map(item => item.ticketTypeId === ticketTypeId ? { ...item, quantity: newQty } : item);
        const newData = { ...cartData, items: newItems };
        localStorage.setItem('eventCart', JSON.stringify(newData));
        setCartData(newData);
    };

    const total = cartData?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    return (
        <div className="pt-20 min-h-screen bg-[#0a0f1c] text-white font-sans overflow-hidden relative">
            <div className="fixed top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>
            <div className="fixed top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f1c]/0 to-transparent pointer-events-none z-0"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center mb-8">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white mr-4 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center">
                        <ShoppingCart className="mr-4 h-8 w-8 text-cyan-400" />
                        Your Cart
                    </h1>
                </div>

                {!cartData || cartData.items.length === 0 ? (
                    <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center shadow-2xl">
                        <ShoppingCart className="mx-auto h-16 w-16 text-gray-600 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-300 mb-4">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added any tickets yet.</p>
                        <Link href="/events" className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
                        <div className="space-y-6">
                            {cartData.items.map((item) => (
                                <div key={item.ticketTypeId} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                        <p className="text-cyan-400 font-medium">${item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-1 border border-white/10">
                                            <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">-</button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">+</button>
                                        </div>
                                        <div className="w-24 text-right font-bold text-xl">${(item.price * item.quantity).toFixed(2)}</div>
                                        <button onClick={() => removeItem(item.ticketTypeId)} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
                            <div>
                                <p className="text-gray-400 mb-1">Total</p>
                                <h3 className="text-4xl font-bold text-white">${total.toFixed(2)}</h3>
                            </div>
                            <button onClick={() => router.push(`/checkout?eventId=${cartData.eventId}`)} className="mt-6 md:mt-0 px-8 py-4 bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400 font-bold rounded-xl flex items-center shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                                Proceed to Checkout
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
