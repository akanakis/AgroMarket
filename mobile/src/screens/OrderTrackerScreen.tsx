import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import * as API from '../services/apiService';

const STATUS_STEPS = [
    { key: 'Pending', icon: Clock, label: 'Order Placed' },
    { key: 'Processing', icon: Package, label: 'Processing' },
    { key: 'Shipped', icon: Truck, label: 'Shipped' },
    { key: 'Completed', icon: CheckCircle2, label: 'Delivered' }
];

export default function OrderTrackerScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as { orderId: number };
    const { accessToken } = useAuth();
    const { lang } = useLanguage();
    const t = translations[lang];

    const queryClient = useQueryClient();

    const { data, isLoading: loading } = useQuery({
        queryKey: ['orderTracker', orderId],
        queryFn: async () => {
            if (!accessToken) throw new Error("No token");
            const [ordersData, productsData] = await Promise.all([
                API.fetchOrders(accessToken),
                API.fetchProducts()
            ]);

            const targetOrder = ordersData.find(o => o.id === orderId);
            if (!targetOrder) throw new Error("Order not found");

            const pMap: Record<number, string> = {};
            productsData.forEach((p: API.ProductAPI) => pMap[p.id] = p.name);

            return { order: targetOrder, productNames: pMap };
        },
        enabled: !!accessToken
    });

    const order = data?.order || null;
    const productNames = data?.productNames || {};

    useEffect(() => {
        if (!loading && !order) {
            Alert.alert("Error", "Order not found");
            navigation.goBack();
        }
    }, [loading, order, navigation]);

    useEffect(() => {
        if (!accessToken) return;

        let isMounted = true;
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        const connectWS = () => {
            if (!isMounted) return;
            const wsUrl = `${API.getWsUrl()}/ws/orders?token=${accessToken}`;
            ws = new WebSocket(wsUrl);

            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.event === 'order_updated' && data.order_id === orderId) {
                        // Invalidate cache directly
                        queryClient.invalidateQueries({ queryKey: ['orderTracker', orderId] });
                    }
                } catch (error) {
                    console.error('WS Parse Error', error);
                }
            };

            ws.onclose = () => {
                if (isMounted) {
                    reconnectTimeout = setTimeout(connectWS, 5000);
                }
            };
        };

        connectWS();

        return () => {
            isMounted = false;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, [accessToken, orderId]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
            </SafeAreaView>
        );
    }

    if (!order) return null;

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1c1917" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order #{order.id}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Timeline */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Order Status</Text>

                    {isCancelled ? (
                        <View style={styles.cancelledState}>
                            <XCircle size={40} color="#ef4444" />
                            <Text style={styles.cancelledText}>Order Cancelled</Text>
                        </View>
                    ) : (
                        <View style={styles.timeline}>
                            {STATUS_STEPS.map((step, index) => {
                                const isActive = index <= currentStepIndex;
                                const isLast = index === STATUS_STEPS.length - 1;
                                const Icon = step.icon;

                                return (
                                    <View key={step.key} style={styles.timelineStep}>
                                        <View style={styles.timelineIconContainer}>
                                            <View style={[styles.timelineIcon, isActive && styles.activeIcon]}>
                                                <Icon size={20} color={isActive ? '#ffffff' : '#a8a29e'} />
                                            </View>
                                            {!isLast && (
                                                <View style={[styles.timelineLine, isActive && currentStepIndex > index && styles.activeLine]} />
                                            )}
                                        </View>
                                        <View style={styles.timelineContent}>
                                            <Text style={[styles.stepLabel, isActive && styles.activeLabel]}>
                                                {step.label}
                                            </Text>
                                            {order.status === step.key && (
                                                <Text style={styles.currentStatusBadge}>Current Status</Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Order Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Date</Text>
                        <Text style={styles.detailValue}>{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount</Text>
                        <Text style={styles.detailTotal}>€{order.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Items */}
                <View style={styles.itemsCard}>
                    <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
                    {order.items.map((item, idx) => (
                        <View key={idx} style={[styles.itemRow, idx !== order.items.length - 1 && styles.itemBorder]}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{productNames[item.product_id] || `Product #${item.product_id}`}</Text>
                                <Text style={styles.itemSub}>{item.quantity} x €{item.price.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.itemTotal}>€{(item.quantity * item.price).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fafaf5',
        borderBottomWidth: 1,
        borderBottomColor: '#e7e5e4',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    statusSection: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 16,
    },
    timeline: {
        paddingLeft: 4,
    },
    timelineStep: {
        flexDirection: 'row',
        height: 60,
    },
    timelineIconContainer: {
        alignItems: 'center',
        marginRight: 16,
        width: 32,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f0',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    activeIcon: {
        backgroundColor: '#16a34a',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#f5f5f0',
        marginVertical: 4,
    },
    activeLine: {
        backgroundColor: '#16a34a'
    },
    timelineContent: {
        flex: 1,
        paddingTop: 6,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a8a29e',
    },
    activeLabel: {
        color: '#1c1917',
    },
    currentStatusBadge: {
        fontSize: 11,
        color: '#16a34a',
        fontWeight: '500',
        marginTop: 2,
    },
    cancelledState: {
        alignItems: 'center',
        padding: 20,
        gap: 12,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
    },
    cancelledText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 16
    },
    detailsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#78716c',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1917',
    },
    detailTotal: {
        fontSize: 16,
        fontWeight: '800',
        color: '#16a34a',
    },
    itemsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1917',
        marginBottom: 2,
    },
    itemSub: {
        fontSize: 13,
        color: '#78716c',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1917',
    }
});
