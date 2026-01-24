'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import * as API from '../services/apiService';

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
        // Load from local storage
        const storedId = localStorage.getItem('agromarket_user_id');
        if (storedId) setCurrentUserId(parseInt(storedId));
    }, []);

    const login = (selectedRole: UserRole) => {
        setRole(selectedRole);
        if (selectedRole === UserRole.BUYER) {
            setUserProfile({ name: 'Guest', role: UserRole.BUYER, location: 'Greece' });
        }
    };

    const logout = () => {
        setRole(null);
        setUserProfile(null);
        setCurrentUserId(null); // Optional: keep ID or clear it? Clearning for full logout.
        localStorage.removeItem('agromarket_user_id');
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
