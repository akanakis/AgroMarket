import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
    role: UserRole | null;
    setRole: (role: UserRole | null) => void;
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile | null) => void;
    currentUserId: number | null;
    setCurrentUserId: (id: number | null) => void;
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<UserRole | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedId = await AsyncStorage.getItem('agromarket_user_id');
                const storedRole = await AsyncStorage.getItem('agromarket_user_role');
                if (storedId && storedRole) {
                    setCurrentUserId(parseInt(storedId));
                    const userRole = storedRole as UserRole;
                    setRole(userRole);
                    if (userRole === UserRole.BUYER) {
                        setUserProfile({ name: 'Maria K.', role: UserRole.BUYER, location: 'Athens, Attica' });
                    } else if (userRole === UserRole.PRODUCER) {
                        setUserProfile({ name: 'Papadopoulos Estate', role: UserRole.PRODUCER, location: 'Kalamata' });
                    }
                }
            } catch (e) {
                console.error('Failed to load user from storage', e);
            }
        };
        loadUser();
    }, []);

    const login = async (selectedRole: UserRole) => {
        setRole(selectedRole);
        if (selectedRole === UserRole.BUYER) {
            const guestId = 4;
            setCurrentUserId(guestId);
            setUserProfile({ name: 'Maria K.', role: UserRole.BUYER, location: 'Athens, Attica' });
            await AsyncStorage.setItem('agromarket_user_id', guestId.toString());
            await AsyncStorage.setItem('agromarket_user_role', UserRole.BUYER);
        } else if (selectedRole === UserRole.PRODUCER) {
            const producerId = 1;
            setCurrentUserId(producerId);
            setUserProfile({ name: 'Papadopoulos Estate', role: UserRole.PRODUCER, location: 'Kalamata' });
            await AsyncStorage.setItem('agromarket_user_id', producerId.toString());
            await AsyncStorage.setItem('agromarket_user_role', UserRole.PRODUCER);
        }
    };

    const logout = async () => {
        setRole(null);
        setUserProfile(null);
        setCurrentUserId(null);
        await AsyncStorage.removeItem('agromarket_user_id');
        await AsyncStorage.removeItem('agromarket_user_role');
    };

    return (
        <AuthContext.Provider value={{
            role, setRole,
            userProfile, setUserProfile,
            currentUserId, setCurrentUserId,
            login, logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
