// Paletas para los estilos nativos (StyleSheet). NativeWind cubre el resto con clases.
export const palettes = {
  light: {
    background: '#F2F5F1',
    surface: '#FFFFFF',
    surfaceAlt: '#E7F1EA',
    border: '#D8E0DA',
    text: '#12211A',
    textMuted: '#5B6B62',
    primary: '#15613D',
    primaryText: '#FFFFFF',
    accent: '#C25A20',
    ok: '#1F7A4D',
    warn: '#B8860B',
    info: '#2563EB',
    error: '#B3261E',
  },
  dark: {
    background: '#0A0F0C',
    surface: '#151F1A',
    surfaceAlt: '#1C2A23',
    border: '#2A3A32',
    text: '#E8F0EA',
    textMuted: '#9BB0A4',
    primary: '#3FA26F',
    primaryText: '#06130C',
    accent: '#E08A44',
    ok: '#3FA26F',
    warn: '#E0B341',
    info: '#7BA4F5',
    error: '#F2857C',
  },
};

export const toneColor = (palette, tone) => palette[tone] ?? palette.textMuted;
