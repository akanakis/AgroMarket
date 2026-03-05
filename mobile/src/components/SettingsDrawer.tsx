import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Menu,
    X,
    LogOut,
    Globe,
    User,
    Settings,
    Sprout,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, Language } from '../utils/translations';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function SettingsDrawer({ visible, onClose }: Props) {
    const { user, logout } = useAuth();
    const role = user?.role;
    const userProfile = user;
    const { lang, setLang } = useLanguage();
    const t = translations[lang];

    const handleLogout = () => {
        onClose();
        logout();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.overlayBg} onPress={onClose} activeOpacity={1} />
                <SafeAreaView style={styles.drawer} edges={['top', 'bottom']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Sprout size={24} color="#16a34a" />
                            <Text style={styles.headerTitle}>{t.appTitle}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={22} color="#78716c" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Profile Section */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatar}>
                                <User size={24} color="#16a34a" />
                            </View>
                            <View>
                                <Text style={styles.profileName}>
                                    {userProfile?.name || (role === 'PRODUCER' ? 'Producer' : 'Buyer')}
                                </Text>
                                <Text style={styles.profileRole}>
                                    {role === 'PRODUCER' ? t.sellBtn : t.buyBtn}
                                </Text>
                            </View>
                        </View>

                        {/* Language Section */}
                        <Text style={styles.sectionTitle}>{t.language}</Text>
                        <View style={styles.langGrid}>
                            {LANGUAGES.map((l) => (
                                <TouchableOpacity
                                    key={l.code}
                                    style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                                    onPress={() => setLang(l.code)}
                                >
                                    <Text style={styles.langFlag}>{l.flag}</Text>
                                    <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>
                                        {l.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* App Info */}
                        <Text style={styles.sectionTitle}>About</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoText}>AgroMarket v1.0</Text>
                            <Text style={styles.infoSubtext}>Farm-to-table marketplace</Text>
                        </View>
                    </ScrollView>

                    {/* Logout */}
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>{t.logout}</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    overlayBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
        width: '80%',
        backgroundColor: '#fafaf5',
        shadowColor: '#000',
        shadowOffset: { width: -3, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1c1917',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f5f5f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        gap: 14,
        marginBottom: 24,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1917',
    },
    profileRole: {
        fontSize: 13,
        color: '#78716c',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#a8a29e',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    langGrid: {
        gap: 8,
        marginBottom: 24,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: '#e7e5e4',
        gap: 12,
    },
    langBtnActive: {
        borderColor: '#16a34a',
        backgroundColor: '#f0fdf4',
    },
    langFlag: {
        fontSize: 22,
    },
    langLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#44403c',
    },
    langLabelActive: {
        color: '#16a34a',
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e7e5e4',
    },
    infoText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1c1917',
    },
    infoSubtext: {
        fontSize: 13,
        color: '#78716c',
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 20,
        marginBottom: 16,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ef4444',
    },
});
