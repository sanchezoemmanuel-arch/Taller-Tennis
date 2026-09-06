import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ChipGroup({ label, options, value, onChange, error, scroll = true }) {
  const { palette } = useAppTheme();

  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        onPress={() => onChange(option.value)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label ?? 'Opción'}: ${option.label}`}
        accessibilityHint={selected ? 'Opción seleccionada' : 'Toca para seleccionar esta opción'}
        className="mr-2 mb-2 rounded-full px-4 active:opacity-70"
        style={{
          backgroundColor: selected ? palette.primary : palette.surface,
          borderWidth: 1,
          borderColor: selected ? palette.primary : palette.border,
          minHeight: 40,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: selected ? palette.primaryText : palette.text, fontWeight: '600', fontSize: 13 }}>
          {option.label}
        </Text>
      </Pressable>
    );
  });

  return (
    <View className="mb-4">
      {label ? (
        <Text className="mb-1.5 text-[13px] font-semibold" style={{ color: palette.textMuted }}>
          {label}
        </Text>
      ) : null}
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">{chips}</View>
        </ScrollView>
      ) : (
        <View className="flex-row flex-wrap">{chips}</View>
      )}
      {error ? (
        <Text className="text-[12px]" style={{ color: palette.error }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
