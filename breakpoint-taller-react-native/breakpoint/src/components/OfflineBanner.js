import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../context/ConnectivityContext';
import { useMatches } from '../context/MatchesContext';
import { useAppTheme } from '../hooks/useAppTheme';

// Aviso visible y permanente cuando no hay conexión.
export default function OfflineBanner() {
  const { isOnline } = useConnectivity();
  const { counters } = useMatches();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="Sin conexión a internet. Estás trabajando con los datos guardados en el dispositivo."
      accessibilityLiveRegion="polite"
      className="absolute left-0 right-0 flex-row items-center justify-center px-4 py-2.5"
      style={{ bottom: 62 + insets.bottom, backgroundColor: palette.warn }}
    >
      <Text style={{ color: '#1A1206', fontWeight: '700', fontSize: 12.5, textAlign: 'center' }}>
        Sin conexión · Estás viendo tus datos guardados
        {counters.pending > 0 ? ` · ${counters.pending} por sincronizar` : ''}
      </Text>
    </View>
  );
}
