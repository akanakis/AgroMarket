import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, AlertCircle } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface StripeCheckoutFormProps {
    clientSecret: string;
    onSuccess: () => void;
    lang: Language;
}

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ clientSecret, onSuccess, lang }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const t = translations[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/orders`, // or just handle locally if redirect is 'if_required'
            },
            redirect: 'if_required'
        });

        if (submitError) {
            setError(submitError.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
            <PaymentElement options={{ layout: 'tabs' }} />
            {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 text-lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 size={24} className="animate-spin" />
                        Processing...
                    </>
                ) : (
                    t.placeOrder || "Pay Now"
                )}
            </button>
        </form>
    );
};
