import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { useMatches } from '../../context/MatchesContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatDate } from '../../utils/format';

export default function RivalsScreen({ navigation }) {
  const { palette } = useAppTheme();
  const { getRivalProfiles } = useMatches();
  const { width } = useWindowDimensions();
  const numColumns = width >= 700 ? 2 : 1;

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const data = await getRivalProfiles();
        if (alive) {
          setProfiles(data);
          setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [getRivalProfiles])
  );

  if (loading) {
    return (
      <ScreenContainer>
        <Loading label="Armando los perfiles…" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        key={`rivals-${numColumns}`}
        data={profiles}
        numColumns={numColumns}
        keyExtractor={(item) => item.rival}
        ListHeaderComponent={
          <View className="mb-3">
            <Text className="text-[22px] font-black" style={{ color: palette.text }}>
              Rivales
            </Text>
            <Text className="text-[12.5px]" style={{ color: palette.textMuted }}>
              Lo que ya sabes de cada persona antes de volver a enfrentarla.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('RivalDetail', { rival: item.rival })}
            accessibilityRole="button"
            accessibilityLabel={`Perfil de ${item.rival}, ${item.victorias} victorias y ${item.derrotas} derrotas`}
            accessibilityHint="Abre el historial completo contra este rival"
            className="mb-3 rounded-2xl p-4 active:opacity-80"
            style={{
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              flex: numColumns > 1 ? 1 : undefined,
              marginHorizontal: numColumns > 1 ? 4 : 0,
            }}
          >
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text numberOfLines={1} className="flex-1 pr-2 text-[16px] font-bold" style={{ color: palette.text }}>
                {item.rival}
              </Text>
              <Text className="text-[14px] font-black" style={{ color: item.victorias >= item.derrotas ? palette.ok : palette.error }}>
                {item.victorias}-{item.derrotas}
              </Text>
            </View>
            <Text className="text-[12.5px]" style={{ color: palette.textMuted }}>
              Lado débil: <Text style={{ color: palette.text, fontWeight: '600' }}>{item.ladoDebil}</Text>
            </Text>
            <Text numberOfLines={2} className="text-[12.5px]" style={{ color: palette.textMuted }}>
              Patrón: <Text style={{ color: palette.text, fontWeight: '600' }}>{item.patronRival}</Text>
            </Text>
            <Text className="mt-1.5 text-[11.5px]" style={{ color: palette.textMuted }}>
              Último cruce: {formatDate(item.ultimo)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Aún no hay rivales"
            description="Cada partido que registres construye automáticamente el perfil de quien enfrentaste."
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        columnWrapperStyle={numColumns > 1 ? { marginHorizontal: -4 } : undefined}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
