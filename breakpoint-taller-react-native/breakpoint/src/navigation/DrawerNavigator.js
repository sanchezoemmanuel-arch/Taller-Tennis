import React from 'react';
import { View, Text, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import TabsNavigator from './TabsNavigator';
import SettingsScreen from '../screens/drawer/SettingsScreen';
import AboutScreen from '../screens/drawer/AboutScreen';
import AppButton from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../hooks/useAppTheme';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { palette } = useAppTheme();
  const { user, signOut } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', 'Se borrará tu credencial del dispositivo. Los partidos guardados se conservan.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: palette.background }}>
      <View className="mb-4 px-4 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <Text className="text-[20px] font-black" style={{ color: palette.primary }}>
          BreakPoint
        </Text>
        <Text className="text-[12.5px]" style={{ color: palette.textMuted }}>
          {user?.firstName ? `Hola, ${user.firstName}` : 'Sesión activa'}
        </Text>
      </View>

      <DrawerItemList {...props} />

      <View className="mt-6 px-3">
        <AppButton
          title="Cerrar sesión"
          variant="danger"
          onPress={confirmLogout}
          accessibilityHint="Cierra la sesión y vuelve a la pantalla de inicio"
        />
      </View>
    </DrawerContentScrollView>
  );
}

// Drawer con las opciones secundarias, envolviendo a las Bottom Tabs.
export default function DrawerNavigator() {
  const { palette } = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '800' },
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.textMuted,
        drawerStyle: { backgroundColor: palette.background },
        sceneContainerStyle: { backgroundColor: palette.background },
      }}
    >
      <Drawer.Screen name="Inicio" component={TabsNavigator} options={{ headerShown: false, title: 'Mis partidos' }} />
      <Drawer.Screen name="Configuracion" component={SettingsScreen} options={{ title: 'Configuración' }} />
      <Drawer.Screen name="AcercaDe" component={AboutScreen} options={{ title: 'Acerca de' }} />
    </Drawer.Navigator>
  );
}
