import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Star, Leaf, MapPin, Calendar, ShoppingBag, ChevronLeft, User } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { Product } from '../types';
import * as API from '../services/apiService';

export default function ProductDetailsScreen({ route, navigation }: any) {
    const { product } = route.params as { product: Product };
    const { user, accessToken } = useAuth();
    const role = user?.role;
    const userProfile = user;
    const { addToCart } = useCart();
    const { lang } = useLanguage();
    const t = translations[lang];

    const queryClient = useQueryClient();

    const [quantity, setQuantity] = useState(1);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);

    const { data: reviews = [], isLoading: loadingReviews } = useQuery({
        queryKey: ['productReviews', product.id],
        queryFn: async () => {
            const data = await API.fetchProductReviews(parseInt(product.id));
            return data;
        }
    });

    const handleAddToCart = () => {
        addToCart(product, quantity);
        Alert.alert('✓', `${product.name} ${t.addedToCart}`);
    };

    const handleSubmitReview = async () => {
        if (!reviewText.trim()) return;
        try {
            if (!accessToken) throw new Error("No access token");
            await API.createReview({
                product_id: parseInt(product.id),
                rating: reviewRating,
                comment: reviewText,
            }, accessToken);
            setReviewText('');
            queryClient.invalidateQueries({ queryKey: ['productReviews', product.id] });
        } catch (err: any) {
            Alert.alert(t.error, err.message);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.image}
                        defaultSource={require('../../assets/icon.png')}
                    />
                    <TouchableOpacity
                        style={styles.backBtnContainer}
                        onPress={() => navigation.goBack()}
                    >
                        <BlurView intensity={60} tint="light" style={styles.blurBadge}>
                            <ChevronLeft size={24} color="#1c1917" />
                        </BlurView>
                    </TouchableOpacity>
                    {product.organic && (
                        <View style={styles.organicBadgeContainer}>
                            <BlurView intensity={70} tint="light" style={styles.blurBadgeHorizontal}>
                                <Leaf size={14} color="#16a34a" />
                                <Text style={styles.organicText}>{t.organic}</Text>
                            </BlurView>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    {/* Header */}
                    <Text style={styles.name}>{product.name}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.ratingRow}>
                            <Star size={16} color="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                            <Text style={styles.reviewCount}>({product.reviewCount} {t.reviews})</Text>
                        </View>
                    </View>

                    {/* Price */}
                    <Text style={styles.price}>€{product.price.toFixed(2)}<Text style={styles.unit}> / {product.unit}</Text></Text>

                    {/* Description */}
                    <Text style={styles.description}>{product.description}</Text>

                    {/* Info Cards */}
                    <View style={styles.infoCards}>
                        <View style={styles.infoCard}>
                            <MapPin size={16} color="#16a34a" />
                            <Text style={styles.infoLabel}>{t.location}</Text>
                            <Text style={styles.infoValue}>{product.location}</Text>
                        </View>
                        <View style={styles.infoCard}>
                            <Calendar size={16} color="#16a34a" />
                            <Text style={styles.infoLabel}>{t.harvested}</Text>
                            <Text style={styles.infoValue}>{product.harvestDate}</Text>
                        </View>
                    </View>

                    {/* Seller */}
                    <TouchableOpacity
                        style={styles.sellerRow}
                        onPress={() => navigation.navigate('ProducerProfile', { sellerName: product.sellerName })}
                    >
                        <View style={styles.sellerAvatar}>
                            <User size={20} color="#16a34a" />
                        </View>
                        <View>
                            <Text style={styles.sellerLabel}>{t.soldBy}</Text>
                            <Text style={styles.sellerName}>{product.sellerName}</Text>
                        </View>
                        <Text style={styles.sellerArrow}>›</Text>
                    </TouchableOpacity>

                    {/* Reviews Section */}
                    <Text style={styles.sectionTitle}>{t.reviews}</Text>

                    {loadingReviews ? (
                        <ActivityIndicator color="#16a34a" style={{ marginVertical: 20 }} />
                    ) : reviews.length === 0 ? (
                        <Text style={styles.noReviews}>No reviews yet.</Text>
                    ) : (
                        reviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                                    <View style={styles.reviewStars}>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={12} color="#f59e0b" fill={s <= review.rating ? '#f59e0b' : 'transparent'} />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))
                    )}

                    {/* Write Review */}
                    {role && (
                        <View style={styles.writeReview}>
                            <Text style={styles.writeReviewTitle}>Write a Review</Text>
                            <View style={styles.starSelector}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                                        <Star size={28} color="#f59e0b" fill={s <= reviewRating ? '#f59e0b' : 'transparent'} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.reviewInput}
                                placeholder="Share your thoughts..."
                                placeholderTextColor="#a8a29e"
                                value={reviewText}
                                onChangeText={setReviewText}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview}>
                                <Text style={styles.submitReviewText}>Submit Review</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom Add to Cart Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantityPicker}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                    >
                        <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.85}>
                    <ShoppingBag size={20} color="#fff" />
                    <Text style={styles.addToCartText}>{t.addToCart} · €{(product.price * quantity).toFixed(2)}</Text>
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
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#f5f5f0',
    },
    backBtnContainer: {
        position: 'absolute',
        top: 50,
        left: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
    blurBadge: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    organicBadgeContainer: {
        position: 'absolute',
        top: 56,
        right: 16,
        borderRadius: 14,
        overflow: 'hidden',
    },
    blurBadgeHorizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    organicText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16a34a',
    },
    content: {
        padding: 20,
    },
    name: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1c1917',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#44403c',
    },
    reviewCount: {
        fontSize: 13,
        color: '#a8a29e',
    },
    price: {
        fontSize: 28,
        fontWeight: '800',
        color: '#16a34a',
        marginBottom: 16,
    },
    unit: {
        fontSize: 16,
        fontWeight: '500',
        color: '#a8a29e',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#57534e',
        marginBottom: 20,
    },
    infoCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        alignItems: 'center',
        gap: 4,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#a8a29e',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#44403c',
        textAlign: 'center',
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        marginBottom: 24,
        gap: 12,
    },
    sellerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#a8a29e',
        textTransform: 'uppercase',
    },
    sellerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1917',
    },
    sellerArrow: {
        marginLeft: 'auto',
        fontSize: 24,
        color: '#a8a29e',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 12,
    },
    noReviews: {
        fontSize: 14,
        color: '#a8a29e',
        marginBottom: 20,
    },
    reviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#f5f5f0',
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    reviewAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#44403c',
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        fontSize: 13,
        color: '#78716c',
        lineHeight: 19,
    },
    writeReview: {
        marginTop: 16,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    writeReviewTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 10,
    },
    starSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    reviewInput: {
        backgroundColor: '#fafaf5',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#1c1917',
        borderWidth: 1,
        borderColor: '#e7e5e4',
        textAlignVertical: 'top',
        minHeight: 80,
        marginBottom: 12,
    },
    submitReviewBtn: {
        backgroundColor: '#16a34a',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitReviewText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 32,
        gap: 12,
    },
    quantityPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    qtyBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#44403c',
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
        minWidth: 24,
        textAlign: 'center',
    },
    addToCartBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16a34a',
        borderRadius: 14,
        paddingVertical: 14,
        gap: 8,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
});
