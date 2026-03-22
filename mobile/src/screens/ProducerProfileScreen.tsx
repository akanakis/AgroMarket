import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Award, MapPin, Star } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { translations } from '../utils/translations';
import { Product } from '../types';
import * as API from '../services/apiService';
import ProductCard from '../components/ProductCard';

export default function ProducerProfileScreen({ route, navigation }: any) {
    const { sellerName } = route.params as { sellerName: string };
    const { lang } = useLanguage();
    const { addToCart } = useCart();
    const t = translations[lang];

    const { data: products = [], isLoading: loading } = useQuery({
        queryKey: ['producerProducts', sellerName],
        queryFn: async () => {
            const data = await API.fetchProducts();
            return data
                .filter((p: any) => p.seller_name === sellerName)
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
        }
    });

    const avgRating = products.length > 0
        ? products.reduce((acc, p) => acc + p.rating, 0) / products.length
        : 0;

    const handleAddToCart = (product: Product, quantity: number) => {
        addToCart(product, quantity);
        Alert.alert('✓', `${quantity}x ${product.name} ${t.addedToCart}`);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.header}>
                        {/* Producer Avatar */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{sellerName.charAt(0)}</Text>
                            </View>
                        </View>

                        <Text style={styles.name}>{sellerName}</Text>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Star size={18} color="#f59e0b" fill="#f59e0b" />
                                <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
                                <Text style={styles.statLabel}>{t.rating}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{products.length}</Text>
                                <Text style={styles.statLabel}>{t.myProducts}</Text>
                            </View>
                        </View>

                        {/* Info */}
                        {products.length > 0 && (
                            <View style={styles.infoRow}>
                                <MapPin size={14} color="#a8a29e" />
                                <Text style={styles.infoText}>{products[0].location}</Text>
                            </View>
                        )}

                        <Text style={styles.sectionTitle}>{t.otherProducts}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ProductCard
                            product={item}
                            onPress={() => navigation.navigate('ProductDetails', { product: item })}
                            onAddToCart={(qty) => handleAddToCart(item, qty)}
                        />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator color="#16a34a" size="large" style={{ marginTop: 40 }} />
                    ) : (
                        <Text style={styles.emptyText}>{t.noResults}</Text>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafaf5',
    },
    header: {
        alignItems: 'center',
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#16a34a',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1c1917',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        marginBottom: 12,
        gap: 16,
    },
    stat: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1c1917',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#a8a29e',
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: '#e7e5e4',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    infoText: {
        fontSize: 14,
        color: '#78716c',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1c1917',
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    cardWrapper: {
        paddingHorizontal: 20,
    },
    listContent: {
        paddingBottom: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#a8a29e',
        textAlign: 'center',
        marginTop: 40,
    },
});
