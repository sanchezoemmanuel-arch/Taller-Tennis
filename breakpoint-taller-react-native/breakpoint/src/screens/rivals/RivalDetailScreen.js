import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import MatchCard from '../../components/MatchCard';
import SectionCard from '../../components/SectionCard';
import Loading from '../../components/Loading';
import { useMatches } from '../../context/MatchesContext';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function RivalDetailScreen({ route, navigation }) {
  const { rival } = route.params;
  const { palette } = useAppTheme();
  const { listMatchesByRival } = useMatches();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ title: rival });
  }, [navigation, rival]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const data = await listMatchesByRival(rival);
        if (alive) {
          setMatches(data);
          setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [listMatchesByRival, rival])
  );

  if (loading) {
    return (
      <ScreenContainer>
        <Loading label="Buscando el historial…" />
      </ScreenContainer>
    );
  }

  const victorias = matches.filter((m) => m.resultado === 'victoria').length;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <SectionCard title="Plan para el próximo partido" subtitle={`Historial: ${victorias} victorias en ${matches.length} cruces`}>
          {matches.slice(0, 3).map((m) => (
            <Text key={m.id} className="mb-1.5 text-[13px] leading-5" style={{ color: palette.textMuted }}>
              • Cuando su lado débil fue <Text style={{ color: palette.text, fontWeight: '600' }}>{m.ladoDebil || 'sin registrar'}</Text>, repitió{' '}
              <Text style={{ color: palette.text, fontWeight: '600' }}>{m.patronRival || 'sin registrar'}</Text>.
            </Text>
          ))}
        </SectionCard>

        <Text className="mb-2 mt-1 text-[15px] font-bold" style={{ color: palette.text }}>
          Historial completo
        </Text>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onPress={() => navigation.navigate('Partidos', { screen: 'MatchDetail', params: { id: match.id } })}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
