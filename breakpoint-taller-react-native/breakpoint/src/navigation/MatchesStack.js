import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchesListScreen from '../screens/matches/MatchesListScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import { useAppTheme } from '../hooks/useAppTheme';

const Stack = createNativeStackNavigator();

// Flujo lista -> detalle con Stack Navigator.
export default function MatchesStack() {
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
      <Stack.Screen name="MatchesList" component={MatchesListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Detalle del partido' }} />
    </Stack.Navigator>
  );
}
