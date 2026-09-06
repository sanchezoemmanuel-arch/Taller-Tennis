import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ScreenContainer({ children, className = '', padded = true }) {
  const { palette } = useAppTheme();
  return (
    <View className={`flex-1 ${padded ? 'px-4 pt-3' : ''} ${className}`} style={{ backgroundColor: palette.background }}>
      {children}
    </View>
  );
}
