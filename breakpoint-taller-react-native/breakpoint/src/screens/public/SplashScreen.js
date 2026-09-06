import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function SplashScreen() {
  const { palette } = useAppTheme();
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: palette.background }}>
      <Text className="mb-2 text-[28px] font-black" style={{ color: palette.primary }}>
        BreakPoint
      </Text>
      <Text className="mb-6 text-[13px]" style={{ color: palette.textMuted }}>
        Restaurando tu sesión…
      </Text>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}
