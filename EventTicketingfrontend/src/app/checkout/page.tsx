/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Lock, ShoppingBag, CheckCircle, Ticket, Calendar, MapPin, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@/components/common/Toast';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface CartItem { ticketTypeId: number; name: string; price: number; quantity: number; }
interface CartData  { eventId: number; items: CartItem[]; }
interface EventInfo { eventId: number; title: string; startDateTime: string; venueName?: string; venueCity?: string; }

const CARD_OPTIONS: any = {
    style: {
        base: { color:'#fff', fontFamily:'system-ui,sans-serif', fontSmoothing:'antialiased', fontSize:'15px', '::placeholder':{color:'#9ca3af'}, iconColor:'#9ca3af' },
        invalid: { color:'#f87171', iconColor:'#f87171' },
    },
};

function CheckoutForm() {
    const router      = useRouter();
    const params      = useSearchParams();
    const stripe      = useStripe();
    const elements    = useElements();
    const toast       = useToast();
    const eventId     = params.get('eventId');

    const [cartData,        setCartData]        = useState<CartData | null>(null);
    const [event,           setEvent]           = useState<EventInfo | null>(null);
    const [processing,      setProcessing]      = useState(false);
    const [succeeded,       setSucceeded]       = useState(false);
    const [orderRef]                            = useState(() => 'NX-' + Math.random().toString(36).substr(2,8).toUpperCase());
    const [firstName,       setFirstName]       = useState('');
    const [lastName,        setLastName]        = useState('');
    const [email,           setEmail]           = useState('');
    const [phone,           setPhone]           = useState('');
    const [promoCode,       setPromoCode]       = useState('');
    const [discount,        setDiscount]        = useState(0);
    const [promoApplied,    setPromoApplied]    = useState(false);
    const [cardError,       setCardError]       = useState('');
    const [showSummary,     setShowSummary]     = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('eventCart');
        if (!saved) { router.replace('/cart'); return; }
        try {
            const parsed = JSON.parse(saved);
            const cart: CartData = Array.isArray(parsed) ? { eventId: Number(eventId)||0, items: parsed } : parsed;
            if (!cart.items?.length) { router.replace('/cart'); return; }
            setCartData(cart);
        } catch { router.replace('/cart'); }
    }, [eventId, router]);

    useEffect(() => {
        if (!eventId) return;
        fetch(`http://localhost:5251/api/events/${eventId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setEvent(d); })
            .catch(() => {});
    }, [eventId]);

    const subtotal    = cartData?.items.reduce((s,i) => s + i.price * i.quantity, 0) ?? 0;
    const discountAmt = Math.min(discount, subtotal);
    const afterDisc   = subtotal - discountAmt;
    const serviceFee  = parseFloat((afterDisc * 0.05).toFixed(2));
    const grandTotal  = afterDisc + serviceFee;

    const applyPromo = () => {
        if (!promoCode.trim()) { toast.warning('Enter a promo code first'); return; }
        const code = promoCode.trim().toUpperCase();
        if (code === 'NEXUS20') {
            setDiscount(subtotal * 0.20); setPromoApplied(true);
            toast.success('Promo applied!', '20% discount added');
        } else if (code === 'WELCOME10') {
            setDiscount(10); setPromoApplied(true);
            toast.success('Promo applied!', '$10 off your order');
        } else {
            toast.error('Invalid promo code', "That code wasn't recognised");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        if (!firstName || !lastName || !email) {
            toast.error('Missing details', 'Please fill in your name and email'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Invalid email', 'Please enter a valid email address'); return;
        }
        setProcessing(true); setCardError('');
        const cardEl = elements.getElement(CardElement);
        if (!cardEl) { setProcessing(false); return; }
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card', card: cardEl,
            billing_details: { name:`${firstName} ${lastName}`, email, phone: phone||undefined },
        });
        if (error) {
            setCardError(error.message || 'Card error');
            toast.error('Payment failed', error.message); setProcessing(false); return;
        }
        // Simulate backend confirmation (Stripe test mode)
        await new Promise(r => setTimeout(r, 1800));
        localStorage.removeItem('eventCart');
        setSucceeded(true); setProcessing(false);
        toast.success('Payment confirmed! 🎉', `Order ${orderRef} placed successfully`);
    };

    if (succeeded) return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center shadow-2xl">
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">You&apos;re in!</h1>
                <p className="text-gray-400 mb-6">Your tickets are confirmed and on their way to <span className="text-cyan-400">{email}</span></p>
                <div className="bg-white/5 rounded-xl p-4 mb-8 text-left space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Order reference</span><span className="text-white font-mono font-bold">{orderRef}</span></div>
                    {event && <div className="flex justify-between text-sm"><span className="text-gray-400">Event</span><span className="text-white font-medium">{event.title}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Total paid</span><span className="text-emerald-400 font-bold">${grandTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Tickets</span><span className="text-white">{cartData?.items.reduce((s,i)=>s+i.quantity,0)} ticket(s)</span></div>
                </div>
                <div className="flex gap-3">
                    <Link href="/events" className="flex-1 text-center py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">Browse more</Link>
                    <Link href="/" className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity">Go home</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back to cart
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* ── Left: form ── */}
                    <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
                        <h1 className="text-3xl font-bold text-white">Checkout</h1>

                        {/* Step 1 – Details */}
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                                Your details
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">First name <span className="text-rose-400">*</span></label>
                                    <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Jane" required
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Last name <span className="text-rose-400">*</span></label>
                                    <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Doe" required
                                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email address <span className="text-rose-400">*</span></label>
                                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@example.com" required
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition" />
                                <p className="text-xs text-gray-500 mt-1">Your tickets will be emailed here</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Phone (optional)</label>
                                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 555 000 0000"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition" />
                            </div>
                        </div>

                        {/* Step 2 – Promo */}
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                                Promo code
                            </h2>
                            <div className="flex gap-3">
                                <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} disabled={promoApplied}
                                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition disabled:opacity-50"
                                    placeholder="e.g. NEXUS20" />
                                <button type="button" onClick={applyPromo} disabled={promoApplied}
                                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                                    {promoApplied ? 'Applied ✓' : 'Apply'}
                                </button>
                            </div>
                            {promoApplied && <p className="mt-2 text-emerald-400 text-xs flex items-center gap-1"><Tag className="h-3 w-3"/>Discount applied — save ${discountAmt.toFixed(2)}</p>}
                            <p className="mt-2 text-gray-500 text-xs">Try: <span className="text-cyan-400 font-mono">NEXUS20</span> or <span className="text-cyan-400 font-mono">WELCOME10</span></p>
                        </div>

                        {/* Step 3 – Payment */}
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                                Payment
                            </h2>
                            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl mb-3">
                                <CardElement options={CARD_OPTIONS} onChange={e => { if (e.error) setCardError(e.error.message); else setCardError(''); }} />
                            </div>
                            {cardError && <p className="text-rose-400 text-sm mb-3">{cardError}</p>}
                            <div className="flex flex-wrap items-center gap-x-2 text-gray-500 text-xs mb-5">
                                <Lock className="h-3 w-3"/>Secured by Stripe · 256-bit TLS
                                <span className="ml-auto text-gray-600 hidden sm:block">Test card: <span className="text-gray-400 font-mono">4242 4242 4242 4242</span></span>
                            </div>
                            <button type="submit" disabled={!stripe || processing}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                                {processing ? (
                                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing…</>
                                ) : (
                                    <><CreditCard className="h-5 w-5"/>Pay ${grandTotal.toFixed(2)}</>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* ── Right: summary ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {event && (
                            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Ticket className="h-6 w-6 text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm leading-snug">{event.title}</h3>
                                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                                            <Calendar className="h-3 w-3"/>
                                            {new Date(event.startDateTime).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
                                        </p>
                                        {event.venueName && (
                                            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                                                <MapPin className="h-3 w-3"/>{event.venueName}{event.venueCity ? `, ${event.venueCity}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                            <button type="button" onClick={()=>setShowSummary(v=>!v)}
                                className="w-full flex items-center justify-between text-white font-semibold text-sm mb-1">
                                <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-cyan-400"/>Order summary</span>
                                {showSummary ? <ChevronUp className="h-4 w-4 text-gray-400"/> : <ChevronDown className="h-4 w-4 text-gray-400"/>}
                            </button>
                            {showSummary && cartData && (
                                <div className="mt-4 space-y-3">
                                    {cartData.items.map(item => (
                                        <div key={item.ticketTypeId} className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white text-sm font-medium">{item.name}</p>
                                                <p className="text-gray-500 text-xs">${item.price.toFixed(2)} × {item.quantity}</p>
                                            </div>
                                            <span className="text-white text-sm font-semibold">${(item.price*item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
                                <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
                                {discountAmt > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400">
                                        <span className="flex items-center gap-1"><Tag className="h-3 w-3"/>Promo discount</span>
                                        <span>−${discountAmt.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-400"><span>Service fee (5%)</span><span className="text-white">${serviceFee.toFixed(2)}</span></div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                                    <span className="text-white">Total</span>
                                    <span className="text-cyan-400">${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-600 text-xs flex items-center justify-center gap-1.5">
                            <Lock className="h-3 w-3"/> All transactions are secure and encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckoutPageInner() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin"/>
            </div>
        }>
            <CheckoutForm/>
        </Suspense>
    );
}

export default function CheckoutPage() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutPageInner/>
        </Elements>
    );
}
