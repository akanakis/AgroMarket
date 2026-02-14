import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Leaf } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import * as API from '../services/apiService';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy & Eggs', 'Honey & Jams', 'Herbs', 'Oil & Olives', 'Grains & Cereals', 'Nuts & Seeds', 'Wine & Beverages'];
const UNITS = ['kg', 'piece', 'bunch', 'liter', 'jar', 'bottle', 'dozen'];

export default function AddProductScreen({ navigation }: any) {
    const { userProfile, currentUserId } = useAuth();
    const { lang } = useLanguage();
    const t = translations[lang];

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [category, setCategory] = useState('Vegetables');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [organic, setOrganic] = useState(false);
    const [harvestDate, setHarvestDate] = useState('');
    const [maxQuantity, setMaxQuantity] = useState('50');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim() || !price.trim() || !location.trim()) {
            Alert.alert(t.missingFields, t.missingFieldsMsg);
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            Alert.alert(t.invalidPrice, t.invalidPriceMsg);
            return;
        }

        setSubmitting(true);
        try {
            await API.createProduct({
                name: name.trim(),
                description: description.trim(),
                price: parsedPrice,
                unit,
                category,
                location: location.trim(),
                seller_id: currentUserId || 1,
                seller_name: userProfile?.name || 'Producer',
                image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
                organic,
                harvest_date: harvestDate.trim() || new Date().toISOString().split('T')[0],
                max_quantity: parseInt(maxQuantity) || 50,
            });

            Alert.alert(`✓ ${t.productAdded}`, t.productAddedMsg, [
                { text: t.ok, onPress: () => navigation.goBack() },
            ]);
        } catch (err: any) {
            Alert.alert(t.error, err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#1c1917" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.addProduct}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.form}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Name */}
                    <Text style={styles.label}>{t.productName} *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Fresh Tomatoes"
                        placeholderTextColor="#a8a29e"
                    />

                    {/* Description */}
                    <Text style={styles.label}>{t.description} *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe your product..."
                        placeholderTextColor="#a8a29e"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    {/* Price + Unit */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t.price} *</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0.00"
                                placeholderTextColor="#a8a29e"
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t.unit}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                <View style={styles.chipRow}>
                                    {UNITS.map((u) => (
                                        <TouchableOpacity
                                            key={u}
                                            style={[styles.miniChip, unit === u && styles.miniChipActive]}
                                            onPress={() => setUnit(u)}
                                        >
                                            <Text style={[styles.miniChipText, unit === u && styles.miniChipTextActive]}>{u}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    {/* Category */}
                    <Text style={styles.label}>{t.category}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        <View style={styles.chipRow}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.chip, category === cat && styles.chipActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{(t.categories as Record<string, string>)[cat] || cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Location */}
                    <Text style={styles.label}>{t.location} *</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="e.g. Athens, Greece"
                        placeholderTextColor="#a8a29e"
                    />

                    {/* Image URL */}
                    <Text style={styles.label}>{t.imageUrlLabel}</Text>
                    <TextInput
                        style={styles.input}
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        placeholder="https://..."
                        placeholderTextColor="#a8a29e"
                        keyboardType="url"
                        autoCapitalize="none"
                    />

                    {/* Harvest Date */}
                    <Text style={styles.label}>{t.harvestDateLabel}</Text>
                    <TextInput
                        style={styles.input}
                        value={harvestDate}
                        onChangeText={setHarvestDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#a8a29e"
                    />

                    {/* Max Quantity */}
                    <Text style={styles.label}>{t.maxQuantityLabel}</Text>
                    <TextInput
                        style={styles.input}
                        value={maxQuantity}
                        onChangeText={setMaxQuantity}
                        placeholder="50"
                        placeholderTextColor="#a8a29e"
                        keyboardType="number-pad"
                    />

                    {/* Organic Toggle */}
                    <View style={styles.organicRow}>
                        <View style={styles.organicLabel}>
                            <Leaf size={18} color="#16a34a" />
                            <Text style={styles.organicText}>{t.organic}</Text>
                        </View>
                        <Switch
                            value={organic}
                            onValueChange={setOrganic}
                            trackColor={{ false: '#e7e5e4', true: '#bbf7d0' }}
                            thumbColor={organic ? '#16a34a' : '#d6d3d1'}
                        />
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.85}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.submitText}>
                            {submitting ? t.adding : t.addProduct}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafaf5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f0',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f5f5f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1917',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#44403c',
        marginBottom: 6,
        marginTop: 12,
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
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    chipScroll: {
        marginBottom: 4,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 6,
        paddingVertical: 4,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f5f5f0',
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    chipActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#78716c',
    },
    chipTextActive: {
        color: '#ffffff',
    },
    miniChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#f5f5f0',
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    miniChipActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    miniChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#78716c',
    },
    miniChipTextActive: {
        color: '#ffffff',
    },
    organicRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        marginTop: 16,
    },
    organicLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    organicText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#44403c',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16a34a',
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 24,
        gap: 8,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
    },
});
