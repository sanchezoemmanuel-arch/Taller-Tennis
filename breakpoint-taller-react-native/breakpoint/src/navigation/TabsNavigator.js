import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MatchesStack from './MatchesStack';
import StatsStack from './StatsStack';
import RivalsStack from './RivalsStack';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMatches } from '../context/MatchesContext';

const Tabs = createBottomTabNavigator();

function TabIcon({ symbol, color, focused }) {
  return (
    <Text style={{ fontSize: focused ? 20 : 18, color }} accessibilityElementsHidden importantForAccessibility="no">
      {symbol}
    </Text>
  );
}

// Tres secciones principales mediante Bottom Tabs, cada una con su propio Stack.
export default function TabsNavigator() {
  const { palette } = useAppTheme();
  const { counters } = useMatches();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="Partidos"
        component={MatchesStack}
        options={{
          title: 'Partidos',
          headerTitle: 'BreakPoint',
          tabBarBadge: counters.pending > 0 ? counters.pending : undefined,
          tabBarAccessibilityLabel: 'Partidos registrados',
          tabBarIcon: ({ color, focused }) => <TabIcon symbol="🎾" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Analisis"
        component={StatsStack}
        options={{
          title: 'Análisis',
          headerTitle: 'Análisis',
          tabBarAccessibilityLabel: 'Análisis de tu rendimiento',
          tabBarIcon: ({ color, focused }) => <TabIcon symbol="📊" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Rivales"
        component={RivalsStack}
        options={{
          title: 'Rivales',
          headerTitle: 'Rivales',
          tabBarAccessibilityLabel: 'Perfiles de rivales',
          tabBarIcon: ({ color, focused }) => <TabIcon symbol="👤" color={color} focused={focused} />,
        }}
      />
    </Tabs.Navigator>
  );
}
