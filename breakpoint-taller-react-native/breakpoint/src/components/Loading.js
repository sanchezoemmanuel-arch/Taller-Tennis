import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function Loading({ label = 'Cargando…' }) {
  const { palette } = useAppTheme();
  return (
    <View className="flex-1 items-center justify-center p-8" accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text className="mt-3 text-[13px]" style={{ color: palette.textMuted }}>
        {label}
      </Text>
    </View>
  );
}
