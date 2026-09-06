import React from 'react';
import { View, Text } from 'react-native';
import AppButton from './AppButton';
import { useAppTheme } from '../hooks/useAppTheme';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  const { palette } = useAppTheme();
  return (
    <View className="items-center px-6 py-12">
      <Text className="mb-2 text-center text-[17px] font-bold" style={{ color: palette.text }}>
        {title}
      </Text>
      <Text className="mb-5 text-center text-[13.5px] leading-5" style={{ color: palette.textMuted }}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} onPress={onAction} accessibilityHint="Abre el formulario para registrar un partido" />
      ) : null}
    </View>
  );
}
