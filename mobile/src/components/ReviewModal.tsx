import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { X, Star, Send } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

interface Props {
    visible: boolean;
    productName: string;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewModal({ visible, productName, onClose, onSubmit }: Props) {
    const { lang } = useLanguage();
    const t = translations[lang];

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating === 0) return;
        onSubmit(rating, comment);
        setRating(0);
        setComment('');
    };

    const handleClose = () => {
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity style={styles.overlayBg} onPress={handleClose} activeOpacity={1} />
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{t.reviewProduct}</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <X size={20} color="#78716c" />
                        </TouchableOpacity>
                    </View>

                    {/* Product Name */}
                    <Text style={styles.productName}>{productName}</Text>

                    {/* Star Rating */}
                    <Text style={styles.label}>{t.yourRating}</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
                                <Star
                                    size={36}
                                    color="#f59e0b"
                                    fill={s <= rating ? '#f59e0b' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={styles.ratingLabel}>
                            {rating === 1 ? '😞' : rating === 2 ? '😐' : rating === 3 ? '🙂' : rating === 4 ? '😊' : '🤩'}{' '}
                            {rating}/5
                        </Text>
                    )}

                    {/* Comment */}
                    <Text style={styles.label}>{t.yourComment}</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder={t.writeReviewPlaceholder}
                        placeholderTextColor="#a8a29e"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={rating === 0}
                        activeOpacity={0.8}
                    >
                        <Send size={16} color="#fff" />
                        <Text style={styles.submitText}>{t.submitReview}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
        width: '88%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1c1917',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f5f5f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#16a34a',
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#a8a29e',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 4,
    },
    ratingLabel: {
        textAlign: 'center',
        fontSize: 14,
        color: '#78716c',
        marginBottom: 16,
    },
    textArea: {
        backgroundColor: '#f5f5f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#1c1917',
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#e7e5e4',
        marginBottom: 16,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#16a34a',
        borderRadius: 14,
        paddingVertical: 14,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#d6d3d1',
        shadowOpacity: 0,
    },
    submitText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
});
