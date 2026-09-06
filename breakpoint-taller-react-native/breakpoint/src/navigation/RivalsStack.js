import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RivalsScreen from '../screens/rivals/RivalsScreen';
import RivalDetailScreen from '../screens/rivals/RivalDetailScreen';
import { useAppTheme } from '../hooks/useAppTheme';

const Stack = createNativeStackNavigator();

export default function RivalsStack() {
  const { palette } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="RivalsList" component={RivalsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RivalDetail" component={RivalDetailScreen} options={{ title: 'Rival' }} />
    </Stack.Navigator>
  );
}
