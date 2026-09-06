import React from 'react';
import { View, Text } from 'react-native';
import { SYNC_STATES } from '../constants/tennis';
import { useAppTheme } from '../hooks/useAppTheme';
import { toneColor } from '../constants/theme';

export default function SyncBadge({ status = 'synced', compact = false }) {
  const { palette } = useAppTheme();
  const config = SYNC_STATES[status] ?? SYNC_STATES.synced;
  const color = toneColor(palette, config.tone);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Estado de sincronización: ${config.label}`}
      className="flex-row items-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${color}22`, borderWidth: 1, borderColor: color }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, marginRight: 6 }} />
      <Text style={{ color, fontSize: compact ? 10 : 11, fontWeight: '700' }}>{config.label}</Text>
    </View>
  );
}
