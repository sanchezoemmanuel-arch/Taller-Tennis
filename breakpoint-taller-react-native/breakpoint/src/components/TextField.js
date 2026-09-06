import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  editable = true,
  accessibilityHint,
}) {
  const { palette } = useAppTheme();

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-[13px] font-semibold" style={{ color: palette.textMuted }}>
        {label}
      </Text>
      <TextInput
        value={String(value ?? '')}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        editable={editable}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint ?? hint}
        className="rounded-xl px-3.5 py-3 text-[15px]"
        style={{
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: error ? palette.error : palette.border,
          color: palette.text,
          minHeight: multiline ? 96 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {error ? (
        <Text className="mt-1 text-[12px]" style={{ color: palette.error }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text className="mt-1 text-[12px]" style={{ color: palette.textMuted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
