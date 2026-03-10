import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, Language } from '../utils/translations';

WebBrowser.maybeCompleteAuthSession();

const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: '🇬🇧' },
    { code: 'el', label: '🇬🇷' },
    { code: 'de', label: '🇩🇪' },
    { code: 'fr', label: '🇫🇷' },
];

type Mode = 'login' | 'register';

export default function LoginScreen() {
    const { login, register, googleLogin } = useAuth();
    const { lang, setLang } = useLanguage();
    const t = translations[lang];

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'dummy_ios',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'dummy_android',
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_web',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            if (id_token) {
                handleGoogleLogin(id_token);
            }
        } else if (response?.type === 'error') {
            setError(response.error?.message || 'Google Sign-In Failed');
        }
    }, [response]);

    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [role, setRole] = useState<'BUYER' | 'PRODUCER'>('BUYER');
    const [farmName, setFarmName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await login(email.trim(), password);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken: string) => {
        setError(null);
        setIsLoading(true);
        try {
            await googleLogin(idToken, role);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password || !location) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (role === 'PRODUCER' && !farmName) {
            setError('Farm name is required for producers');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await register({
                name: name.trim(),
                email: email.trim(),
                password,
                role,
                location: location.trim(),
                farm_name: role === 'PRODUCER' ? farmName.trim() : undefined,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

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

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    {/* Logo */}
                    <View style={styles.logoRow}>
                        <Sprout size={40} color="#22c55e" />
                    </View>
                    <Text style={styles.title}>{t.appTitle}</Text>
                    <Text style={styles.tagline}>{t.tagline}</Text>

                    {/* Mode toggle */}
                    <View style={styles.modeRow}>
                        <TouchableOpacity
                            style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
                            onPress={() => { setMode('login'); setError(null); }}
                        >
                            <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>Sign in</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
                            onPress={() => { setMode('register'); setError(null); }}
                        >
                            <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>Create account</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {mode === 'register' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Full name"
                                placeholderTextColor="#a8a29e"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#a8a29e"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#a8a29e"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {mode === 'register' && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm password"
                                    placeholderTextColor="#a8a29e"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />

                                <View style={styles.roleRow}>
                                    <TouchableOpacity
                                        style={[styles.roleBtn, role === 'BUYER' && styles.roleBtnActive]}
                                        onPress={() => setRole('BUYER')}
                                    >
                                        <Text style={[styles.roleBtnText, role === 'BUYER' && styles.roleBtnTextActive]}>Buyer</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.roleBtn, role === 'PRODUCER' && styles.roleBtnActive]}
                                        onPress={() => setRole('PRODUCER')}
                                    >
                                        <Text style={[styles.roleBtnText, role === 'PRODUCER' && styles.roleBtnTextActive]}>Producer</Text>
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Location (city, region)"
                                    placeholderTextColor="#a8a29e"
                                    value={location}
                                    onChangeText={setLocation}
                                />

                                {role === 'PRODUCER' && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Farm name"
                                        placeholderTextColor="#a8a29e"
                                        value={farmName}
                                        onChangeText={setFarmName}
                                    />
                                )}
                            </>
                        )}

                        {error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={mode === 'login' ? handleLogin : handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>
                                    {mode === 'login' ? 'Sign in' : 'Create account'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerBox}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: '#db4437', marginTop: 4 }]}
                            onPress={() => promptAsync()}
                            disabled={isLoading || !request}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>
                                    Sign in with Google
                                </Text>
                            )}
                        </TouchableOpacity>

                        {mode === 'login' && (
                            <View style={styles.testHint}>
                                <Text style={styles.testHintTitle}>Test accounts</Text>
                                <Text style={styles.testHintText}>Buyer: buyer@test.com / Test1234!</Text>
                                <Text style={styles.testHintText}>Producer: producer@test.com / Test1234!</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafaf5' },
    langRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: 16, gap: 8 },
    langBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f0',
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
    },
    langBtnActive: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
    langText: { fontSize: 22 },
    scroll: { paddingHorizontal: 24, paddingBottom: 40 },
    logoRow: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0fdf4',
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 32, marginBottom: 12,
    },
    title: { fontSize: 32, fontWeight: '800', color: '#1c1917', textAlign: 'center', letterSpacing: -1 },
    tagline: { fontSize: 14, color: '#78716c', textAlign: 'center', marginTop: 4, marginBottom: 28 },
    modeRow: {
        flexDirection: 'row', backgroundColor: '#f5f5f0', borderRadius: 12, padding: 4, marginBottom: 24,
    },
    modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    modeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    modeBtnText: { fontSize: 14, fontWeight: '600', color: '#78716c' },
    modeBtnTextActive: { color: '#16a34a' },
    form: { gap: 12 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e5e4',
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: '#1c1917',
    },
    roleRow: { flexDirection: 'row', gap: 12 },
    roleBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
        backgroundColor: '#f5f5f0', borderWidth: 2, borderColor: 'transparent',
    },
    roleBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
    roleBtnText: { fontSize: 14, fontWeight: '600', color: '#78716c' },
    roleBtnTextActive: { color: '#16a34a' },
    errorBox: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12 },
    errorText: { color: '#b91c1c', fontSize: 13 },
    submitBtn: {
        backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 16,
        alignItems: 'center', marginTop: 4,
    },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    dividerBox: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#e7e5e4' },
    dividerText: { marginHorizontal: 8, color: '#a8a29e', fontSize: 14, fontWeight: '500' },
    testHint: {
        backgroundColor: '#f5f5f0', borderRadius: 10, padding: 12, marginTop: 8,
    },
    testHintTitle: { fontSize: 11, fontWeight: '700', color: '#a8a29e', textTransform: 'uppercase', marginBottom: 4 },
    testHintText: { fontSize: 12, color: '#78716c' },
});
