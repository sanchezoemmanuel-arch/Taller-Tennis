import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});

export default function StatBar({ label, value, max = 100, suffix = '%', tone = 'primary' }) {
  const { palette } = useAppTheme();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const color = palette[tone] ?? palette.primary;

  return (
    <View className="mb-3" accessibilityRole="text" accessibilityLabel={`${label}: ${value}${suffix}`}>
      <View className="mb-1 flex-row justify-between">
        <Text className="text-[13px]" style={{ color: palette.textMuted }}>
          {label}
        </Text>
        <Text className="text-[13px] font-bold" style={{ color: palette.text }}>
          {value}
          {suffix}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: palette.surfaceAlt }]}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}
