import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import SyncBadge from './SyncBadge';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatDate, labelOf } from '../utils/format';
import { SUPERFICIES } from '../constants/tennis';

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    paddingLeft: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});

export default function MatchCard({ match, onPress, compact = false }) {
  const { palette } = useAppTheme();
  const isWin = match.resultado === 'victoria';
  const ratio = match.winners + match.erroresNoForzados > 0
    ? Math.round((match.winners / (match.winners + match.erroresNoForzados)) * 100)
    : 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Partido contra ${match.rival}, ${isWin ? 'victoria' : 'derrota'} ${match.marcador}, ${formatDate(match.fecha)}`}
      accessibilityHint="Abre el detalle del partido"
      className="mb-3 active:opacity-80"
      style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border, flex: compact ? 1 : undefined, marginHorizontal: compact ? 4 : 0 }]}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          backgroundColor: isWin ? palette.ok : palette.accent,
        }}
      />

      <View className="mb-2 flex-row items-center justify-between">
        <View
          className="rounded-md px-2 py-0.5"
          style={{ backgroundColor: isWin ? `${palette.ok}22` : `${palette.error}1E` }}
        >
          <Text style={{ color: isWin ? palette.ok : palette.error, fontSize: 11, fontWeight: '800' }}>
            {isWin ? 'VICTORIA' : 'DERROTA'}
          </Text>
        </View>
        <SyncBadge status={match.syncStatus} compact />
      </View>

      <Text numberOfLines={1} className="text-[16px] font-bold" style={{ color: palette.text }}>
        {match.rival}
      </Text>
      <Text numberOfLines={1} className="mb-2 text-[12.5px]" style={{ color: palette.textMuted }}>
        {match.torneo}
      </Text>

      <Text
        className="mb-2 text-[17px] font-bold"
        style={{ color: palette.text, letterSpacing: 1.5, fontVariant: ['tabular-nums'] }}
      >
        {match.marcador}
      </Text>

      <View className="flex-row flex-wrap items-center">
        <Text className="mr-3 text-[11.5px]" style={{ color: palette.textMuted }}>
          {formatDate(match.fecha)}
        </Text>
        <Text className="mr-3 text-[11.5px]" style={{ color: palette.textMuted }}>
          {labelOf(SUPERFICIES, match.superficie)}
        </Text>
        <Text className="text-[11.5px]" style={{ color: palette.textMuted }}>
          Efectividad {ratio}%
        </Text>
      </View>
    </Pressable>
  );
}
