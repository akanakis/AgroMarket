import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const CATEGORIES: { key: string; emoji: string }[] = [
    { key: 'All', emoji: '🛒' },
    { key: 'Vegetables', emoji: '🥬' },
    { key: 'Fruits', emoji: '🍎' },
    { key: 'Dairy & Eggs', emoji: '🥚' },
    { key: 'Honey & Jams', emoji: '🍯' },
    { key: 'Herbs', emoji: '🌿' },
    { key: 'Oil & Olives', emoji: '🫒' },
    { key: 'Grains & Cereals', emoji: '🌾' },
    { key: 'Nuts & Seeds', emoji: '🥜' },
    { key: 'Wine & Beverages', emoji: '🍷' },
];

interface Props {
    selected: string;
    onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: Props) {
    const { lang } = useLanguage();
    const t = translations[lang];

    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
                style={styles.scrollView}
            >
                {CATEGORIES.map((cat) => {
                    const isActive = selected === cat.key;
                    const label = (t.categories as Record<string, string>)[cat.key] || cat.key;
                    return (
                        <TouchableOpacity
                            key={cat.key}
                            style={[styles.chip, isActive && styles.chipActive]}
                            onPress={() => onSelect(cat.key)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.emoji}>{cat.emoji}</Text>
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        height: 56,
    },
    scrollView: {
        overflow: 'visible',
    },
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f0',
        borderWidth: 1.5,
        borderColor: '#e7e5e4',
        marginRight: 8,
        gap: 6,
        height: 40,
    },
    chipActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    emoji: {
        fontSize: 16,
        lineHeight: 20,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#78716c',
        lineHeight: 18,
    },
    chipTextActive: {
        color: '#ffffff',
    },
});
