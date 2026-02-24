import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShoppingBag, Package, BarChart3, Store, Menu, Plus } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { UserRole } from '../types';

import LoginScreen from '../screens/LoginScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProducerProfileScreen from '../screens/ProducerProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderTrackerScreen from '../screens/OrderTrackerScreen';
import CartScreen from '../screens/CartScreen';
import AddProductScreen from '../screens/AddProductScreen';
import CartBadge from '../components/CartBadge';
import SettingsDrawer from '../components/SettingsDrawer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Marketplace Stack (Marketplace -> ProductDetails -> ProducerProfile)
function MarketplaceStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            <Stack.Screen name="ProducerProfile" component={ProducerProfileScreen}
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerBackTitle: 'Back',
                    headerTintColor: '#16a34a',
                    headerStyle: { backgroundColor: '#fafaf5' },
                    headerShadowVisible: false,
                }}
            />
        </Stack.Navigator>
    );
}

// Dashboard Stack (Dashboard -> AddProduct)
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain" component={DashboardScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
        </Stack.Navigator>
    );
}

// Orders Stack
function OrdersStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OrdersMain" component={OrdersScreen} />
            <Stack.Screen
                name="OrderTracker"
                component={OrderTrackerScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function MainTabs() {
    const { user } = useAuth();
    const role = user?.role;
    const { cart } = useCart();
    const { lang } = useLanguage();
    const t = translations[lang];
    const [settingsVisible, setSettingsVisible] = useState(false);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            <SettingsDrawer visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
            <Tab.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#fafaf5',
                    },
                    headerShadowVisible: false,
                    headerTintColor: '#1c1917',
                    headerTitleStyle: {
                        fontWeight: '700',
                        fontSize: 18,
                    },
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopColor: '#f5f5f0',
                        paddingBottom: 8,
                        paddingTop: 8,
                        height: 88,
                    },
                    tabBarActiveTintColor: '#16a34a',
                    tabBarInactiveTintColor: '#a8a29e',
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                    },
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => setSettingsVisible(true)}
                            style={{ marginRight: 16, padding: 4 }}
                        >
                            <Menu size={22} color="#44403c" />
                        </TouchableOpacity>
                    ),
                }}
            >
                <Tab.Screen
                    name="MarketplaceTab"
                    component={MarketplaceStack}
                    options={{
                        title: t.appTitle,
                        tabBarLabel: 'Market',
                        tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
                    }}
                />

                <Tab.Screen
                    name="CartTab"
                    component={CartScreen}
                    options={{
                        title: t.cart,
                        tabBarLabel: t.cart,
                        tabBarIcon: ({ color, size }) => (
                            <View>
                                <ShoppingBag size={size} color={color} />
                                <CartBadge count={cartCount} />
                            </View>
                        ),
                    }}
                />

                <Tab.Screen
                    name="OrdersTab"
                    component={OrdersStack}
                    options={{
                        title: t.orders,
                        headerShown: false,
                        tabBarLabel: t.orders,
                        tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
                    }}
                />

                {role === UserRole.PRODUCER && (
                    <Tab.Screen
                        name="DashboardTab"
                        component={DashboardStack}
                        options={{
                            title: 'Dashboard',
                            headerShown: false,
                            tabBarLabel: 'Dashboard',
                            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
                        }}
                    />
                )}
            </Tab.Navigator>
        </>
    );
}

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user } = useAuth();

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <RootStack.Screen name="Main" component={MainTabs} />
                ) : (
                    <RootStack.Screen name="Login" component={LoginScreen} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
