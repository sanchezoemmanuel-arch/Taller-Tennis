import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function SectionCard({ title, subtitle, children, className = '' }) {
  const { palette } = useAppTheme();
  return (
    <View
      className={`mb-3 rounded-2xl p-4 ${className}`}
      style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
    >
      {title ? (
        <Text className="text-[15px] font-bold" style={{ color: palette.text }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="mb-3 mt-0.5 text-[12.5px]" style={{ color: palette.textMuted }}>
          {subtitle}
        </Text>
      ) : (
        <View className="h-2" />
      )}
      {children}
    </View>
  );
}
