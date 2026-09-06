import React from 'react';
import { View, Text } from 'react-native';
import AppButton from './AppButton';
import { useAppTheme } from '../hooks/useAppTheme';

// Vista de error con opción de reintento para consultas remotas fallidas.
export default function ErrorView({ message, onRetry, retryLabel = 'Reintentar', compact = false }) {
  const { palette } = useAppTheme();
  if (!message) return null;

  return (
    <View
      accessibilityRole="alert"
      className={`rounded-2xl ${compact ? 'p-3' : 'p-4'} mb-3`}
      style={{ backgroundColor: `${palette.error}18`, borderWidth: 1, borderColor: palette.error }}
    >
      <Text className="mb-1 text-[14px] font-bold" style={{ color: palette.error }}>
        Algo salió mal
      </Text>
      <Text className="text-[13px]" style={{ color: palette.text }}>
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-3">
          <AppButton
            title={retryLabel}
            variant="secondary"
            onPress={onRetry}
            accessibilityHint="Vuelve a intentar la consulta al servidor"
          />
        </View>
      ) : null}
    </View>
  );
}
