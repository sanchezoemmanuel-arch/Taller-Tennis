import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

// Elemento gráfico de la aplicación: una cancha vista desde arriba,
// dibujada solo con Views para no depender de imágenes ni librerías.
export default function CourtMark({ width = 92 }) {
  const { palette } = useAppTheme();
  const height = width * 1.55;
  const line = { position: 'absolute', backgroundColor: palette.primary };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width,
        height,
        borderWidth: 2,
        borderColor: palette.primary,
        borderRadius: 6,
        backgroundColor: `${palette.primary}14`,
        overflow: 'hidden',
      }}
    >
      <View style={[line, { top: height * 0.24, left: 0, right: 0, height: 1.5, opacity: 0.55 }]} />
      <View style={[line, { top: height * 0.76, left: 0, right: 0, height: 1.5, opacity: 0.55 }]} />
      <View style={[line, { top: height * 0.24, bottom: height * 0.24, left: width / 2 - 0.75, width: 1.5, opacity: 0.55 }]} />
      <View style={[line, { top: 0, bottom: 0, left: width * 0.15, width: 1.5, opacity: 0.3 }]} />
      <View style={[line, { top: 0, bottom: 0, right: width * 0.15, width: 1.5, opacity: 0.3 }]} />
      <View style={[line, { top: height * 0.5 - 1.5, left: -6, right: -6, height: 3 }]} />
      <View
        style={{
          position: 'absolute',
          top: height * 0.33,
          left: width * 0.63,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: palette.accent,
        }}
      />
    </View>
  );
}
