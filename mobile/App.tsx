import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LanguageProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </LanguageProvider>
      </CartProvider>
    </AuthProvider>
  );
}
