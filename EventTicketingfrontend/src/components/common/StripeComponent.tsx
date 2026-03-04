import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import React, { useState } from 'react';

// Initialize Stripe outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

export function StripePaymentForm({ onPaymentSuccess, isProcessing, setProcessing }: any) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (cardElement) {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setError(error.message || 'Payment failed');
                setProcessing(false);
            } else {
                // Simulate backend payment logic with token setup
                setTimeout(() => {
                    onPaymentSuccess(paymentMethod.id);
                }, 1000);
            }
        }
    };

    return (
        <div className="mt-6 p-4 border border-white/10 rounded-lg bg-[#0f172a]">
            <h3 className="text-xl font-bold text-white mb-4">Payment Details</h3>
            <div className="p-3 bg-white/5 rounded pointer-events-auto">
                <CardElement options={{
                    style: {
                        base: {
                            color: '#fff',
                            fontFamily: 'system-ui, sans-serif',
                            fontSmoothing: 'antialiased',
                            fontSize: '16px',
                            '::placeholder': {
                                color: '#aab7c4'
                            }
                        },
                        invalid: {
                            color: '#fa755a',
                            iconColor: '#fa755a'
                        }
                    }
                }} />
            </div>
            {error && <div className="text-red-400 mt-2 text-sm">{error}</div>}
        </div>
    );
}

export function StripeWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
}
