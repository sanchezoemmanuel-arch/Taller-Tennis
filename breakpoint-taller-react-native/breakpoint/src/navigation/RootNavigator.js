import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../screens/public/LoginScreen';
import HowItWorksScreen from '../screens/public/HowItWorksScreen';
import SplashScreen from '../screens/public/SplashScreen';
import MatchFormScreen from '../screens/matches/MatchFormScreen';
import OfflineBanner from '../components/OfflineBanner';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';

const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const { status } = useAuth();
  const { palette, isDark } = useAppTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  const modalOptions = {
    presentation: 'modal',
    headerShown: true,
    headerStyle: { backgroundColor: palette.background },
    headerTintColor: palette.text,
    headerTitleStyle: { fontWeight: '800' },
  };

  if (status === 'checking') return <SplashScreen />;

  const isAuthenticated = status === 'authenticated';

  return (
    <View className="flex-1" style={{ backgroundColor: palette.background }}>
      <NavigationContainer theme={navigationTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <RootStack.Screen name="Privado" component={DrawerNavigator} />
              {/* Pantalla presentada como modal de navegación. */}
              <RootStack.Group screenOptions={modalOptions}>
                <RootStack.Screen name="MatchForm" component={MatchFormScreen} options={{ title: 'Nuevo partido' }} />
              </RootStack.Group>
            </>
          ) : (
            <>
              <RootStack.Screen name="Login" component={LoginScreen} />
              <RootStack.Group screenOptions={modalOptions}>
                <RootStack.Screen name="ComoFunciona" component={HowItWorksScreen} options={{ title: 'Cómo funciona' }} />
              </RootStack.Group>
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>

      {isAuthenticated ? <OfflineBanner /> : null}
    </View>
  );
}
