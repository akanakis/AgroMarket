import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, Banknote, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import * as API from '../services/apiService';
import PaymentSimulatorModal from '../components/PaymentSimulatorModal';

export default function CartScreen({ navigation }: any) {
    const { user, accessToken } = useAuth();
    const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal } = useCart();
    const { lang } = useLanguage();
    const t = translations[lang];

    const [showCheckout, setShowCheckout] = useState(false);
    const [fullName, setFullName] = useState(user?.name || '');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [completedOrderId, setCompletedOrderId] = useState<number | null>(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

    const submitOrderToBackend = async () => {
        try {
            if (!accessToken) throw new Error("Not authenticated");
            const newOrder = await API.createOrder({
                // @ts-ignore
                customer_name: fullName,
                total: cartTotal,
                status: 'Pending',
                customer_id: user?.id || undefined,
                items: cart.map((item) => ({
                    product_id: parseInt(item.id),
                    quantity: item.quantity,
                    price: item.price,
                })),
            }, accessToken);

            clearCart();
            setCompletedOrderId(newOrder.id);
            setIsPaymentModalVisible(false);
            setOrderPlaced(true);
        } catch (err: any) {
            Alert.alert(t.error, err.message);
        }
    };

    const handlePlaceOrder = () => {
        if (!fullName.trim() || !address.trim() || !phone.trim()) {
            Alert.alert(t.missingInfo, t.missingInfoMsg);
            return;
        }

        if (paymentMethod === 'card') {
            setIsPaymentModalVisible(true);
        } else {
            submitOrderToBackend();
        }
    };

    if (orderPlaced) {
        return (
            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Check size={40} color="#16a34a" />
                </View>
                <Text style={styles.successTitle}>{t.orderSuccess}</Text>

                {completedOrderId && (
                    <TouchableOpacity
                        style={styles.trackOrderBtn}
                        onPress={() => {
                            setOrderPlaced(false);
                            setShowCheckout(false);
                            navigation.replace('OrdersTab', {
                                screen: 'OrderTracker',
                                params: { orderId: completedOrderId }
                            });
                        }}
                    >
                        <Text style={styles.trackOrderText}>Track Order</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.backToShopBtn}
                    onPress={() => {
                        setOrderPlaced(false);
                        setShowCheckout(false);
                        navigation.navigate('MarketplaceTab');
                    }}
                >
                    <Text style={styles.backToShopText}>{t.backToMarket}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (cart.length === 0 && !showCheckout) {
        return (
            <View style={styles.emptyContainer}>
                <ShoppingBag size={64} color="#e7e5e4" />
                <Text style={styles.emptyTitle}>{t.cartEmpty}</Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate('MarketplaceTab')}
                >
                    <Text style={styles.browseBtnText}>{t.backToMarket}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (showCheckout) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView style={styles.container} contentContainerStyle={styles.checkoutContent}>
                    <Text style={styles.checkoutTitle}>{t.checkoutTitle}</Text>

                    {/* Order Summary */}
                    <View style={styles.summaryCard}>
                        {cart.map((item) => (
                            <View key={item.id} style={styles.summaryRow}>
                                <Text style={styles.summaryName} numberOfLines={1}>{item.name} × {item.quantity}</Text>
                                <Text style={styles.summaryPrice}>€{(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                        ))}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>{t.total}</Text>
                            <Text style={styles.totalValue}>€{cartTotal.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Shipping Details */}
                    <Text style={styles.formSectionTitle}>{t.shippingDetails}</Text>

                    <Text style={styles.inputLabel}>{t.fullName}</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder={t.fullName}
                        placeholderTextColor="#a8a29e"
                    />

                    <Text style={styles.inputLabel}>{t.address}</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder={t.address}
                        placeholderTextColor="#a8a29e"
                    />

                    <Text style={styles.inputLabel}>{t.phone}</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder={t.phone}
                        placeholderTextColor="#a8a29e"
                        keyboardType="phone-pad"
                    />

                    {/* Payment Method */}
                    <Text style={styles.formSectionTitle}>{t.paymentMethod}</Text>
                    <View style={styles.paymentOptions}>
                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                            onPress={() => setPaymentMethod('cod')}
                        >
                            <Banknote size={20} color={paymentMethod === 'cod' ? '#16a34a' : '#78716c'} />
                            <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextActive]}>
                                {t.cod}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <CreditCard size={20} color={paymentMethod === 'card' ? '#16a34a' : '#78716c'} />
                            <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>
                                {t.card}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Place Order Button */}
                    <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} activeOpacity={0.85}>
                        <Text style={styles.placeOrderText}>{t.placeOrder} · €{cartTotal.toFixed(2)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setShowCheckout(false)}
                    >
                        <Text style={styles.cancelText}>{t.backToCart}</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <PaymentSimulatorModal
                    visible={isPaymentModalVisible}
                    amount={cartTotal}
                    onClose={() => setIsPaymentModalVisible(false)}
                    onSuccess={submitOrderToBackend}
                />
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <Text style={styles.title}>{t.cart}</Text>
            </View>

            <FlatList
                data={cart}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.cartItemImage}
                            defaultSource={require('../../assets/icon.png')}
                        />
                        <View style={styles.cartItemInfo}>
                            <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.cartItemPrice}>€{item.price.toFixed(2)} / {item.unit}</Text>
                        </View>
                        <View style={styles.cartItemActions}>
                            <View style={styles.quantityControl}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateCartQuantity(item.id, -1)}
                                >
                                    <Minus size={14} color="#44403c" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateCartQuantity(item.id, 1)}
                                >
                                    <Plus size={14} color="#44403c" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => removeFromCart(item.id)}
                                style={styles.removeBtn}
                            >
                                <Trash2 size={16} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>{t.total}</Text>
                    <Text style={styles.totalValue}>€{cartTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => setShowCheckout(true)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.checkoutBtnText}>{t.checkout}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafaf5',
    },
    headerSection: {
        padding: 20,
        paddingBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1c1917',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafaf5',
        gap: 16,
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#a8a29e',
    },
    browseBtn: {
        backgroundColor: '#16a34a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    browseBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 120,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        gap: 12,
    },
    cartItemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#f5f5f0',
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 2,
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#16a34a',
        fontWeight: '600',
    },
    cartItemActions: {
        alignItems: 'flex-end',
        gap: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    qtyBtn: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1c1917',
        minWidth: 20,
        textAlign: 'center',
    },
    removeBtn: {
        padding: 4,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e7e5e4',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        paddingBottom: 32,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#a8a29e',
        textTransform: 'uppercase',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1c1917',
    },
    checkoutBtn: {
        backgroundColor: '#16a34a',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    checkoutBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    // Checkout styles
    checkoutContent: {
        padding: 20,
    },
    checkoutTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1c1917',
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryName: {
        flex: 1,
        fontSize: 14,
        color: '#44403c',
        marginRight: 8,
    },
    summaryPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#44403c',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f5f5f0',
        paddingTop: 10,
        marginTop: 4,
        marginBottom: 0,
    },
    formSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#78716c',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1c1917',
        borderWidth: 1,
        borderColor: '#e7e5e4',
        marginBottom: 14,
    },
    paymentOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#e7e5e4',
        flexWrap: 'wrap',
    },
    paymentOptionActive: {
        borderColor: '#16a34a',
        backgroundColor: '#f0fdf4',
    },
    paymentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#78716c',
    },
    paymentTextActive: {
        color: '#16a34a',
    },
    placeOrderBtn: {
        backgroundColor: '#16a34a',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 12,
    },
    placeOrderText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
    },
    cancelBtn: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#78716c',
    },
    // Success
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafaf5',
        padding: 40,
        gap: 16,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1c1917',
        textAlign: 'center',
    },
    backToShopBtn: {
        backgroundColor: '#fafaf5',
        borderWidth: 2,
        borderColor: '#16a34a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
        width: '100%',
        alignItems: 'center',
    },
    backToShopText: {
        color: '#16a34a',
        fontSize: 15,
        fontWeight: '700',
    },
    trackOrderBtn: {
        backgroundColor: '#16a34a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
        width: '100%',
        alignItems: 'center',
    },
    trackOrderText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});
