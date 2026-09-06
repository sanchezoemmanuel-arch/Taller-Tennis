import React from 'react';
import { Pressable, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // zona táctil cómoda
    flexDirection: 'row',
    gap: 8,
  },
});

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
  accessibilityHint,
  className = '',
}) {
  const { palette } = useAppTheme();
  const isDisabled = disabled || loading;

  const backgrounds = {
    primary: palette.primary,
    secondary: palette.surfaceAlt,
    danger: palette.error,
    ghost: 'transparent',
  };
  const textColors = {
    primary: palette.primaryText,
    secondary: palette.text,
    danger: '#FFFFFF',
    ghost: palette.primary,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`active:opacity-80 ${className}`}
      style={[
        styles.base,
        {
          backgroundColor: backgrounds[variant],
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={textColors[variant]} /> : null}
      <View>
        <Text style={{ color: textColors[variant], fontWeight: '700', fontSize: 15 }}>
          {loading ? 'Procesando…' : title}
        </Text>
      </View>
    </Pressable>
  );
}
