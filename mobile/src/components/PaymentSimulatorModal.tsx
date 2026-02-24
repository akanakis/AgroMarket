import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { CreditCard, ShieldCheck } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface PaymentSimulatorModalProps {
    visible: boolean;
    amount: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentSimulatorModal({
    visible,
    amount,
    onClose,
    onSuccess,
}: PaymentSimulatorModalProps) {
    const { lang } = useLanguage();
    const t = translations[lang];

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setCardNumber('');
            setExpiry('');
            setCvc('');
            setName('');
            setIsProcessing(false);
            setError(null);
        }
    }, [visible]);

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const match = cleaned.match(/.{1,4}/g);
        if (match) {
            return match.join(' ').substring(0, 19);
        }
        return cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };

    const handlePay = () => {
        if (!cardNumber || !expiry || !cvc || !name) {
            setError('Please fill in all card details.');
            return;
        }

        setError(null);
        setIsProcessing(true);

        // Simulate a real payment processing delay
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 2000);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={!isProcessing ? onClose : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <View style={styles.sheet}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <CreditCard size={24} color="#1c1917" />
                                    <Text style={styles.title}>Secure Payment</Text>
                                </View>
                                {!isProcessing && (
                                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                        <Text style={styles.closeText}>Close</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.amountContainer}>
                                <Text style={styles.amountLabel}>Total to pay</Text>
                                <Text style={styles.amountValue}>€{amount.toFixed(2)}</Text>
                            </View>

                            <View style={styles.secureBadge}>
                                <ShieldCheck size={16} color="#16a34a" />
                                <Text style={styles.secureText}>Test Environment Simulating Stripe</Text>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                <Text style={styles.inputLabel}>Cardholder Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Jane Doe"
                                    placeholderTextColor="#a8a29e"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!isProcessing}
                                    autoCapitalize="words"
                                />

                                <Text style={styles.inputLabel}>Card Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="4242 4242 4242 4242"
                                    placeholderTextColor="#a8a29e"
                                    value={cardNumber}
                                    onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                                    keyboardType="number-pad"
                                    maxLength={19}
                                    editable={!isProcessing}
                                />

                                <View style={styles.row}>
                                    <View style={styles.rowItem}>
                                        <Text style={styles.inputLabel}>Expiry Date</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="MM/YY"
                                            placeholderTextColor="#a8a29e"
                                            value={expiry}
                                            onChangeText={(t) => setExpiry(formatExpiry(t))}
                                            keyboardType="number-pad"
                                            maxLength={5}
                                            editable={!isProcessing}
                                        />
                                    </View>
                                    <View style={styles.rowItem}>
                                        <Text style={styles.inputLabel}>CVC</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123"
                                            placeholderTextColor="#a8a29e"
                                            value={cvc}
                                            onChangeText={setCvc}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            secureTextEntry
                                            editable={!isProcessing}
                                        />
                                    </View>
                                </View>

                                {error && (
                                    <Text style={styles.errorText}>{error}</Text>
                                )}

                                <TouchableOpacity
                                    style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
                                    onPress={handlePay}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text style={styles.payBtnText}>Pay €{amount.toFixed(2)}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
    },
    sheet: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1c1917',
    },
    closeBtn: {
        padding: 4,
    },
    closeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#78716c',
    },
    amountContainer: {
        alignItems: 'center',
        backgroundColor: '#fafaf5',
        paddingVertical: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    amountLabel: {
        fontSize: 14,
        color: '#78716c',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1c1917',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#f0fdf4',
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 24,
    },
    secureText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16a34a',
    },
    form: {
        gap: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#44403c',
        marginBottom: -8,
    },
    input: {
        backgroundColor: '#fafaf5',
        borderWidth: 1,
        borderColor: '#e7e5e4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1c1917',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    rowItem: {
        flex: 1,
        gap: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
    },
    payBtn: {
        backgroundColor: '#1c1917',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    payBtnDisabled: {
        backgroundColor: '#78716c',
    },
    payBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
