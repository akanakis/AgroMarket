import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

interface Props {
    count: number;
}

export default function CartBadge({ count }: Props) {
    if (count === 0) return null;

    return (
        <View style={styles.badge}>
            <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ffffff',
    },
});
