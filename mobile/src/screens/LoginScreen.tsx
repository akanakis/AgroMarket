import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, ShoppingBag, Store, Globe } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, Language } from '../utils/translations';
import { UserRole } from '../types';

const { width } = Dimensions.get('window');

const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: '🇬🇧' },
    { code: 'el', label: '🇬🇷' },
    { code: 'de', label: '🇩🇪' },
    { code: 'fr', label: '🇫🇷' },
];

export default function LoginScreen() {
    const { login } = useAuth();
    const { lang, setLang } = useLanguage();
    const t = translations[lang];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Language selector */}
            <View style={styles.langRow}>
                {LANGUAGES.map((l) => (
                    <TouchableOpacity
                        key={l.code}
                        onPress={() => setLang(l.code)}
                        style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                    >
                        <Text style={styles.langText}>{l.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
                <View style={styles.logoRow}>
                    <Sprout size={48} color="#22c55e" />
                </View>
                <Text style={styles.title}>{t.appTitle}</Text>
                <Text style={styles.tagline}>{t.tagline}</Text>
            </View>

            {/* Role Cards */}
            <View style={styles.cards}>
                <TouchableOpacity
                    style={[styles.card, styles.buyerCard]}
                    onPress={() => login(UserRole.BUYER)}
                    activeOpacity={0.85}
                >
                    <View style={styles.cardIconContainer}>
                        <ShoppingBag size={32} color="#16a34a" />
                    </View>
                    <Text style={styles.cardTitle}>{t.buyBtn}</Text>
                    <Text style={styles.cardDesc}>{t.buyDesc}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, styles.sellerCard]}
                    onPress={() => login(UserRole.PRODUCER)}
                    activeOpacity={0.85}
                >
                    <View style={[styles.cardIconContainer, styles.sellerIconContainer]}>
                        <Store size={32} color="#fff" />
                    </View>
                    <Text style={[styles.cardTitle, styles.sellerText]}>{t.sellBtn}</Text>
                    <Text style={[styles.cardDesc, styles.sellerDescText]}>{t.sellDesc}</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.decorLine} />
                <Text style={styles.footerText}>🌿 Farm to Table 🌿</Text>
                <View style={styles.decorLine} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafaf5',
    },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 16,
        gap: 8,
    },
    langBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    langBtnActive: {
        borderColor: '#22c55e',
        backgroundColor: '#f0fdf4',
    },
    langText: {
        fontSize: 22,
    },
    hero: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 32,
    },
    logoRow: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    title: {
        fontSize: 38,
        fontWeight: '800',
        color: '#1c1917',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: '#78716c',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    cards: {
        paddingHorizontal: 24,
        gap: 16,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    buyerCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    sellerCard: {
        backgroundColor: '#16a34a',
    },
    cardIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    sellerIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1c1917',
        marginBottom: 6,
    },
    sellerText: {
        color: '#ffffff',
    },
    cardDesc: {
        fontSize: 14,
        color: '#78716c',
        lineHeight: 20,
    },
    sellerDescText: {
        color: 'rgba(255,255,255,0.85)',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        paddingHorizontal: 40,
        marginTop: 32,
        gap: 12,
    },
    decorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e7e5e4',
    },
    footerText: {
        fontSize: 13,
        color: '#a8a29e',
        fontWeight: '500',
    },
});
