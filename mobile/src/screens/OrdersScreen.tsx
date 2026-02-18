import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Star, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import * as API from '../services/apiService';
import ReviewModal from '../components/ReviewModal';

interface EnrichedOrderItem extends API.OrderItemAPI {
    productName: string;
}

interface EnrichedOrder extends Omit<API.OrderAPI, 'items'> {
    items: EnrichedOrderItem[];
}

import { useNavigation } from '@react-navigation/native';

// ...

export default function OrdersScreen() {
    const navigation = useNavigation();
    const { userProfile, currentUserId } = useAuth();
    const { lang } = useLanguage();
    const t = translations[lang];

    const [orders, setOrders] = useState<EnrichedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

    // Review Modal
    const [reviewModal, setReviewModal] = useState<{
        visible: boolean;
        productId: number;
        productName: string;
    }>({ visible: false, productId: 0, productName: '' });

    const loadOrders = useCallback(async () => {
        try {
            const [ordersData, productsData] = await Promise.all([
                API.fetchOrders(),
                API.fetchProducts(),
            ]);

            // Build product name lookup
            const productMap = new Map<number, string>();
            productsData.forEach((p) => productMap.set(p.id, p.name));

            // Filter to only show orders for this user
            const myOrders = ordersData
                .filter((o) => {
                    if (o.customer_id && currentUserId) {
                        return o.customer_id === currentUserId;
                    }
                    return o.customer_name === userProfile?.name;
                })
                .map((o) => ({
                    ...o,
                    items: o.items.map((item) => ({
                        ...item,
                        productName: productMap.get(item.product_id) || `Product #${item.product_id}`,
                    })),
                }));

            setOrders(myOrders);
        } catch (err: any) {
            Alert.alert(t.error, err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUserId, userProfile?.name, t.error]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const toggleExpand = (orderId: number) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const openReviewModal = (productId: number, productName: string) => {
        setReviewModal({ visible: true, productId, productName });
    };

    const handleSubmitReview = async (rating: number, comment: string) => {
        try {
            await API.createReview({
                product_id: reviewModal.productId,
                author: userProfile?.name || 'Anonymous',
                rating,
                comment,
            });
            setReviewModal({ visible: false, productId: 0, productName: '' });
            setReviewedItems((prev) => new Set(prev).add(`${reviewModal.productId}`));
            Alert.alert('✓', t.reviewSubmitted);
        } catch (err: any) {
            Alert.alert(t.error, err.message);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerSection}>
                <Text style={styles.title}>{t.myOrders}</Text>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item: order }) => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                        <TouchableOpacity
                            style={styles.orderCard}
                            onPress={() => (navigation as any).navigate('OrderTracker', { orderId: order.id })}
                            activeOpacity={0.9}
                        >
                            {/* Order Header */}
                            <View style={styles.orderHeader}>
                                <View style={styles.orderIdRow}>
                                    <Package size={16} color="#16a34a" />
                                    <Text style={styles.orderId}>#{order.id}</Text>
                                </View>
                                <View style={styles.headerRight}>
                                    <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                                        <Text style={[styles.statusText, getStatusTextStyle(order.status)]}>
                                            {order.status}
                                        </Text>
                                    </View>
                                    <View>
                                        <ChevronDown size={18} color="#a8a29e" />
                                    </View>
                                </View>
                            </View>

                            {/* Order summary */}
                            <View style={styles.orderBody}>
                                <View style={styles.orderRow}>
                                    <Text style={styles.orderLabel}>{t.date}</Text>
                                    <Text style={styles.orderValue}>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.orderRow}>
                                    <Text style={styles.orderLabel}>{t.amount}</Text>
                                    <Text style={styles.orderAmount}>€{order.total.toFixed(2)}</Text>
                                </View>
                                <View style={styles.orderRow}>
                                    <Text style={styles.orderLabel}>{t.items}</Text>
                                    <Text style={styles.orderValue}>
                                        {order.items.length} {t.items.toLowerCase()}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Package size={48} color="#e7e5e4" />
                        <Text style={styles.emptyText}>{t.noOrders}</Text>
                    </View>
                }
            />

            <ReviewModal
                visible={reviewModal.visible}
                productName={reviewModal.productName}
                onClose={() => setReviewModal({ visible: false, productId: 0, productName: '' })}
                onSubmit={handleSubmitReview}
            />
        </SafeAreaView>
    );
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Completed': return { backgroundColor: '#f0fdf4' };
        case 'Processing': return { backgroundColor: '#eff6ff' };
        case 'Shipped': return { backgroundColor: '#fefce8' };
        case 'Cancelled': return { backgroundColor: '#fef2f2' };
        default: return { backgroundColor: '#f5f5f0' };
    }
};

const getStatusTextStyle = (status: string) => {
    switch (status) {
        case 'Completed': return { color: '#16a34a' };
        case 'Processing': return { color: '#3b82f6' };
        case 'Shipped': return { color: '#f59e0b' };
        case 'Cancelled': return { color: '#ef4444' };
        default: return { color: '#78716c' };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafaf5',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f0',
    },
    orderIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderBody: {
        gap: 8,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderLabel: {
        fontSize: 13,
        color: '#a8a29e',
        fontWeight: '500',
    },
    orderValue: {
        fontSize: 14,
        color: '#44403c',
        fontWeight: '600',
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#16a34a',
    },
    itemsSection: {
        marginTop: 4,
    },
    itemsDivider: {
        height: 1,
        backgroundColor: '#f5f5f0',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafaf5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f5f5f0',
    },
    itemInfo: {
        flex: 1,
        marginRight: 10,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1917',
        marginBottom: 2,
    },
    itemDetails: {
        fontSize: 12,
        color: '#a8a29e',
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fefce8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    reviewBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#f59e0b',
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    reviewedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16a34a',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#a8a29e',
        textAlign: 'center',
    },
});
