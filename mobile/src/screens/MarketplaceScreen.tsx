import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, SlidersHorizontal, X, ArrowUpDown, RotateCcw } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { Product } from '../types';
import * as API from '../services/apiService';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

type SortOption = 'none' | 'price_asc' | 'price_desc' | 'newest' | 'best_rated';

export default function MarketplaceScreen({ navigation }: any) {
    const { user } = useAuth();
    const role = user?.role;
    const userProfile = user;
    const { addToCart } = useCart();
    const { lang } = useLanguage();
    const t = translations[lang];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [organicOnly, setOrganicOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('none');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const { data: products = [], isLoading: loading, isFetching: refreshing, refetch } = useQuery({
        queryKey: ['products', selectedCategory, organicOnly],
        queryFn: async () => {
            const data = await API.fetchProducts({
                category: selectedCategory !== 'All' ? selectedCategory : undefined,
                organic_only: organicOnly,
            });

            return data.map((p) => ({
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

    const filteredProducts = useMemo(() => {
        let result = products;

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.location.toLowerCase().includes(q) ||
                    p.sellerName.toLowerCase().includes(q)
            );
        }

        // Price range filter
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        if (!isNaN(min)) {
            result = result.filter((p) => p.price >= min);
        }
        if (!isNaN(max)) {
            result = result.filter((p) => p.price <= max);
        }

        // Sort
        if (sortOption === 'price_asc') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price_desc') {
            result = [...result].sort((a, b) => b.price - a.price);
        } else if (sortOption === 'newest') {
            result = [...result].sort((a, b) =>
                (b.harvestDate || '').localeCompare(a.harvestDate || '')
            );
        } else if (sortOption === 'best_rated') {
            result = [...result].sort((a, b) => b.rating - a.rating);
        }

        return result;
    }, [products, searchQuery, minPrice, maxPrice, sortOption]);

    const handleAddToCart = (product: Product, quantity: number) => {
        addToCart(product, quantity);
        Alert.alert('✓', `${quantity}x ${product.name} ${t.addedToCart}`);
    };

    const onRefresh = () => {
        refetch();
    };

    const handleResetFilters = () => {
        setOrganicOnly(false);
        setSortOption('none');
        setMinPrice('');
        setMaxPrice('');
        setSelectedCategory('All');
        setSearchQuery('');
    };

    const hasActiveFilters = organicOnly || sortOption !== 'none' || minPrice !== '' || maxPrice !== '';

    const renderProduct = ({ item, index }: { item: Product; index: number }) => (
        <View style={[styles.cardWrapper, { marginLeft: index % 2 === 0 ? 16 : 8, marginRight: index % 2 === 1 ? 16 : 8 }]}>
            <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                onAddToCart={(qty) => handleAddToCart(item, qty)}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Products Grid */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#16a34a"
                        progressViewOffset={140}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🥬</Text>
                        <Text style={styles.emptyText}>{t.noResults}</Text>
                    </View>
                }
            />

            {/* Floating Glass Search Bar & Categories */}
            <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search size={18} color="#a8a29e" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t.searchPlaceholder}
                            placeholderTextColor="#a8a29e"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color="#a8a29e" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal size={18} color={showFilters ? '#fff' : '#78716c'} />
                        {hasActiveFilters && <View style={styles.filterDot} />}
                    </TouchableOpacity>
                </View>

                {/* Category Chips inside the Blur header */}
                <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            </BlurView>

            {/* Expanded Filters Panel */}
            {showFilters && (
                <View style={styles.filtersPanel}>
                    {/* Organic Toggle */}
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>{t.organicOnly}</Text>
                        <Switch
                            value={organicOnly}
                            onValueChange={setOrganicOnly}
                            trackColor={{ false: '#e7e5e4', true: '#bbf7d0' }}
                            thumbColor={organicOnly ? '#16a34a' : '#d6d3d1'}
                        />
                    </View>

                    {/* Price Range */}
                    <View style={styles.filterDivider} />
                    <Text style={styles.filterSectionLabel}>{t.priceRange}</Text>
                    <View style={styles.priceRow}>
                        <TextInput
                            style={styles.priceInput}
                            placeholder={t.minPrice}
                            placeholderTextColor="#a8a29e"
                            value={minPrice}
                            onChangeText={setMinPrice}
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.priceDash}>—</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder={t.maxPrice}
                            placeholderTextColor="#a8a29e"
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.priceEuro}>€</Text>
                    </View>

                    {/* Sort By */}
                    <View style={styles.filterDivider} />
                    <Text style={styles.filterSectionLabel}>{t.sortBy}</Text>
                    <View style={styles.sortGrid}>
                        {[
                            { key: 'price_asc' as SortOption, label: t.priceLowToHigh },
                            { key: 'price_desc' as SortOption, label: t.priceHighToLow },
                            { key: 'newest' as SortOption, label: t.newest },
                            { key: 'best_rated' as SortOption, label: t.bestRated },
                        ].map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.sortChip, sortOption === opt.key && styles.sortChipActive]}
                                onPress={() => setSortOption(sortOption === opt.key ? 'none' : opt.key)}
                            >
                                <Text style={[styles.sortChipText, sortOption === opt.key && styles.sortChipTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Reset Filters */}
                    {hasActiveFilters && (
                        <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                            <RotateCcw size={14} color="#ef4444" />
                            <Text style={styles.resetText}>{t.resetFilters}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

        </View>
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
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(231, 229, 228, 0.5)',
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1c1917',
    },
    filterBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    filterBtnActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    filterDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    filtersPanel: {
        position: 'absolute',
        top: 130, // below header
        left: 16,
        right: 16,
        zIndex: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#44403c',
    },
    filterDivider: {
        height: 1,
        backgroundColor: '#f5f5f0',
        marginVertical: 12,
    },
    filterSectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#a8a29e',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceInput: {
        flex: 1,
        backgroundColor: '#f5f5f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1c1917',
        borderWidth: 1,
        borderColor: '#e7e5e4',
        textAlign: 'center',
    },
    priceDash: {
        color: '#a8a29e',
        fontSize: 16,
    },
    priceEuro: {
        fontSize: 16,
        fontWeight: '600',
        color: '#78716c',
    },
    sortGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sortChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f5f5f0',
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    sortChipActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    sortChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#78716c',
    },
    sortChipTextActive: {
        color: '#ffffff',
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    resetText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ef4444',
    },
    gridContainer: {
        paddingTop: 140, // Space for the floating header
        paddingBottom: 110, // Space for the floating tab bar
    },
    cardWrapper: {
        flex: 1,
        maxWidth: '50%',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#a8a29e',
        textAlign: 'center',
    },
});
