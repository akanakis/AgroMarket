import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Leaf, MapPin, Star, Plus } from 'lucide-react-native';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface Props {
    product: Product;
    onPress: () => void;
    onAddToCart: () => void;
}

export default function ProductCard({ product, onPress, onAddToCart }: Props) {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                defaultSource={require('../../assets/icon.png')}
            />

            {/* Badges */}
            <View style={styles.badgeRow}>
                {product.organic && (
                    <View style={styles.organicBadge}>
                        <Leaf size={12} color="#16a34a" />
                        <Text style={styles.organicText}>{t.organic}</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

                <View style={styles.locationRow}>
                    <MapPin size={12} color="#a8a29e" />
                    <Text style={styles.locationText} numberOfLines={1}>{product.location}</Text>
                </View>

                <View style={styles.bottomRow}>
                    <View>
                        <Text style={styles.price}>€{product.price.toFixed(2)}<Text style={styles.unit}>/{product.unit}</Text></Text>
                        <View style={styles.ratingRow}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            onAddToCart();
                        }}
                        activeOpacity={0.8}
                    >
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 160,
        backgroundColor: '#f5f5f0',
    },
    badgeRow: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        gap: 6,
    },
    organicBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    organicText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16a34a',
    },
    content: {
        padding: 14,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 10,
    },
    locationText: {
        fontSize: 12,
        color: '#a8a29e',
        flex: 1,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: '#16a34a',
    },
    unit: {
        fontSize: 13,
        fontWeight: '500',
        color: '#a8a29e',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#78716c',
    },
    reviewCount: {
        fontSize: 11,
        color: '#a8a29e',
    },
    addBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#16a34a',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
});
