import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StatsScreen from '../screens/stats/StatsScreen';
import { useAppTheme } from '../hooks/useAppTheme';

const Stack = createNativeStackNavigator();

export default function StatsStack() {
  const { palette } = useAppTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
      <Stack.Screen name="StatsHome" component={StatsScreen} />
    </Stack.Navigator>
  );
}
