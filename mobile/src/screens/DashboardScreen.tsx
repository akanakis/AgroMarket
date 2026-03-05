import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    AlertButton,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, TrendingUp, ShoppingBag, Star, Trash2, Plus } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { Product } from '../types';
import * as API from '../services/apiService';

export default function DashboardScreen({ navigation }: any) {
    const { user, accessToken } = useAuth();
    const userProfile = user;
    const currentUserId = user?.id;
    const { lang } = useLanguage();
    const t = translations[lang];

    const queryClient = useQueryClient();

    const { data, isLoading: loading, isFetching: refreshing, refetch } = useQuery({
        queryKey: ['dashboard', currentUserId],
        queryFn: async () => {
            if (!accessToken) throw new Error("No token");
            const [productsData, ordersData] = await Promise.all([
                API.fetchProducts(),
                currentUserId ? API.fetchSellerOrders(currentUserId, accessToken) : API.fetchOrders(accessToken),
            ]);

            const myProducts = productsData
                .filter((p: any) => p.seller_name === userProfile?.name)
                .map((p: any) => ({
                    id: String(p.id),
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    unit: p.unit,
                    category: p.category,
                    location: p.location,
                    sellerName: p.seller_name,
                    imageUrl: p.image_url,
                    organic: p.organic,
                    harvestDate: p.harvest_date,
                    expirationDate: p.expiration_date || undefined,
                    maxQuantity: p.max_quantity,
                    rating: p.rating,
                    reviewCount: p.review_count,
                }));

            return { products: myProducts, orders: ordersData };
        },
        enabled: !!accessToken && !!userProfile?.name
    });

    const products = data?.products || [];
    const orders = data?.orders || [];

    const handleDeleteProduct = async (id: string) => {
        Alert.alert(t.deleteProduct, t.deleteConfirm, [
            { text: t.cancel, style: 'cancel' },
            {
                text: t.delete,
                style: 'destructive',
                onPress: async () => {
                    try {
                        if (!accessToken) throw new Error("No access token");
                        await API.deleteProduct(parseInt(id), accessToken);
                        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                    } catch (err: any) {
                        Alert.alert(t.error, err.message);
                    }
                },
            },
        ]);
    };

    const handleUpdateStatus = (orderId: number, currentStatus: string) => {
        const statuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

        // Add Refund option if Cancelled
        const options: AlertButton[] = [...statuses.map(status => ({
            text: status,
            onPress: async () => {
                if (status === currentStatus) return;
                try {
                    if (!accessToken) throw new Error("No access token");
                    await API.updateOrderStatus(orderId, status, accessToken);
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                } catch (err: any) {
                    Alert.alert('Error', 'Failed to update status');
                }
            },
            style: (status === 'Cancelled' ? 'destructive' : 'default') as 'destructive' | 'default'
        }))];

        if (currentStatus === 'Cancelled') {
            options.push({
                text: 'Issue Refund 💸',
                onPress: async () => {
                    try {
                        if (!accessToken) throw new Error("No access token");
                        await API.refundOrder(orderId, accessToken);
                        Alert.alert('Success', 'Refund issued successfully');
                        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                    } catch (err: any) {
                        Alert.alert('Error', err.message || 'Failed to refund order');
                    }
                },
                style: 'destructive'
            });
        }

        options.push({ text: 'Cancel', style: 'cancel' });

        Alert.alert(
            'Update Status',
            'Select new status or action',
            options
        );
    };

    const onRefresh = () => {
        refetch();
    };

    // Analytics
    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce((acc, o) => acc + o.items.length, 0);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                style={{ flex: 1 }}
                data={products}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <View>
                                <Text style={styles.title}>{t.myFarmStand}</Text>
                                <Text style={styles.subtitle}>{t.manageListings}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => navigation.navigate('AddProduct')}
                                activeOpacity={0.85}
                            >
                                <Plus size={20} color="#fff" />
                                <Text style={styles.addBtnText}>{t.addProduct}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Analytics Cards */}
                        <Text style={styles.sectionTitle}>{t.analytics}</Text>
                        <View style={styles.analyticsRow}>
                            <View style={[styles.analyticsCard, { backgroundColor: '#f0fdf4' }]}>
                                <TrendingUp size={20} color="#16a34a" />
                                <Text style={styles.analyticsValue}>€{totalSales.toFixed(0)}</Text>
                                <Text style={styles.analyticsLabel}>{t.totalSales}</Text>
                            </View>
                            <View style={[styles.analyticsCard, { backgroundColor: '#eff6ff' }]}>
                                <Package size={20} color="#3b82f6" />
                                <Text style={styles.analyticsValue}>{totalOrders}</Text>
                                <Text style={styles.analyticsLabel}>{t.totalOrders}</Text>
                            </View>
                            <View style={[styles.analyticsCard, { backgroundColor: '#fefce8' }]}>
                                <ShoppingBag size={20} color="#f59e0b" />
                                <Text style={styles.analyticsValue}>{totalItems}</Text>
                                <Text style={styles.analyticsLabel}>{t.itemsSold}</Text>
                            </View>
                        </View>

                        {/* Recent Orders */}
                        {orders.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>{t.recentOrders}</Text>
                                {orders.slice(0, 5).map((order) => (
                                    <TouchableOpacity
                                        key={order.id}
                                        style={styles.orderCard}
                                        onPress={() => (navigation as any).navigate('OrderTracker', { orderId: order.id })}
                                    >
                                        <View style={styles.orderHeader}>
                                            <Text style={styles.orderId}>#{order.id}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleUpdateStatus(order.id, order.status)}
                                                style={[styles.statusBadge, getStatusStyle(order.status)]}
                                            >
                                                <Text style={[styles.statusText, getStatusTextStyle(order.status)]}>
                                                    {order.status}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.orderDetails}>
                                            <Text style={styles.orderCustomer}>{order.customer_name}</Text>
                                            <Text style={styles.orderTotal}>€{order.total.toFixed(2)}</Text>
                                        </View>
                                        <Text style={{ fontSize: 10, color: '#a8a29e', marginTop: 4 }}>Tap status to update • Tap card to view details</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}

                        <Text style={styles.sectionTitle}>{t.myProducts}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.productRow}>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.productMeta}>€{item.price.toFixed(2)} / {item.unit}</Text>
                            <View style={styles.productRating}>
                                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteProduct(item.id)}
                        >
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{t.noResults}</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
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
    header: {
        padding: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16a34a',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 6,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    addBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1c1917',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: '#78716c',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 12,
        marginTop: 4,
    },
    analyticsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    analyticsCard: {
        flex: 1,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        gap: 6,
    },
    analyticsValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1c1917',
    },
    analyticsLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#78716c',
        textAlign: 'center',
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#44403c',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderCustomer: {
        fontSize: 13,
        color: '#78716c',
    },
    orderTotal: {
        fontSize: 14,
        fontWeight: '700',
        color: '#16a34a',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 8,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 2,
    },
    productMeta: {
        fontSize: 14,
        color: '#16a34a',
        fontWeight: '600',
        marginBottom: 2,
    },
    productRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#78716c',
    },
    deleteBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#a8a29e',
    },
    listContent: {
        paddingBottom: 40,
    },
});
