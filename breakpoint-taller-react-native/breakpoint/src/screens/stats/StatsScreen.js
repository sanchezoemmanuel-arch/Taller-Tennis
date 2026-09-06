import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionCard from '../../components/SectionCard';
import StatBar from '../../components/StatBar';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { useMatches } from '../../context/MatchesContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { percent, labelOf } from '../../utils/format';
import { SUPERFICIES } from '../../constants/tennis';

function KpiCard({ label, value, suffix = '', width, tone = 'primary' }) {
  const { palette } = useAppTheme();
  const color = palette[tone] ?? palette.primary;
  return (
    <View
      className="mb-3 rounded-2xl p-4"
      style={{ width, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
    >
      <View style={{ width: 26, height: 3, borderRadius: 2, backgroundColor: color, marginBottom: 8 }} />
      <Text className="text-[26px] font-black" style={{ color, fontVariant: ['tabular-nums'] }}>
        {value}
        <Text className="text-[15px]">{suffix}</Text>
      </Text>
      <Text className="mt-0.5 text-[12px]" style={{ color: palette.textMuted }}>
        {label}
      </Text>
    </View>
  );
}

export default function StatsScreen({ navigation }) {
  const { palette } = useAppTheme();
  const { getStatsSummary } = useMatches();
  const { width } = useWindowDimensions();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Los indicadores se calculan con SQL sobre SQLite: funcionan sin internet.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const data = await getStatsSummary();
        if (alive) {
          setSummary(data);
          setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [getStatsSummary])
  );

  if (loading) {
    return (
      <ScreenContainer>
        <Loading label="Calculando tus números…" />
      </ScreenContainer>
    );
  }

  if (!summary || summary.total === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Sin datos todavía"
          description="Cuando registres partidos verás aquí tu efectividad, tu saque y tu rendimiento por superficie."
          actionLabel="Ir a mis partidos"
          onAction={() => navigation.navigate('Partidos')}
        />
      </ScreenContainer>
    );
  }

  // Adaptable: dos tarjetas por fila en móvil, cuatro en pantallas anchas.
  const columns = width >= 700 ? 4 : 2;
  const cardWidth = (width - 32 - (columns - 1) * 12) / columns;

  const efectividad = summary.winners + summary.errores > 0
    ? Math.round((summary.winners / (summary.winners + summary.errores)) * 100)
    : 0;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-1 text-[22px] font-black" style={{ color: palette.text }}>
          Tu análisis
        </Text>
        <Text className="mb-4 text-[12.5px]" style={{ color: palette.textMuted }}>
          Calculado con los {summary.total} partidos guardados en el dispositivo.
        </Text>

        <View className="flex-row flex-wrap justify-between">
          <KpiCard label="Partidos" value={summary.total} width={cardWidth} />
          <KpiCard label="Victorias" value={percent(summary.victorias, summary.total)} suffix="%" width={cardWidth} tone="ok" />
          <KpiCard label="Primer saque" value={summary.promedioPrimerSaque} suffix="%" width={cardWidth} tone="accent" />
          <KpiCard label="Efectividad" value={efectividad} suffix="%" width={cardWidth} tone={efectividad >= 50 ? 'ok' : 'accent'} />
        </View>

        <SectionCard title="Rendimiento por superficie" subtitle="Dónde ganas y dónde te cuesta">
          {summary.porSuperficie.map((row) => (
            <StatBar
              key={row.superficie}
              label={`${labelOf(SUPERFICIES, row.superficie)} · ${row.victorias}/${row.total}`}
              value={percent(row.victorias, row.total)}
            />
          ))}
        </SectionCard>

        <SectionCard title="Balance de golpes" subtitle="Winners contra errores no forzados">
          <StatBar label="Winners acumulados" value={summary.winners} max={summary.winners + summary.errores} suffix="" tone="ok" />
          <StatBar label="Errores no forzados" value={summary.errores} max={summary.winners + summary.errores} suffix="" tone="error" />
          <Text className="mt-1 text-[12.5px] leading-5" style={{ color: palette.textMuted }}>
            {efectividad >= 50
              ? 'Estás cerrando más puntos de los que regalas. Mantén el patrón que te funciona.'
              : 'Regalas más puntos de los que ganas. Trabaja tolerancia al peloteo antes de buscar el winner.'}
          </Text>
        </SectionCard>

        <SectionCard title="Patrones más frecuentes de tus rivales" subtitle="Lo que se repite cancha tras cancha">
          {summary.patrones.length === 0 ? (
            <Text className="text-[13px]" style={{ color: palette.textMuted }}>
              Registra el patrón del rival en cada partido para verlo aquí.
            </Text>
          ) : (
            summary.patrones.map((row) => (
              <View key={row.patron} className="mb-2 flex-row items-center justify-between">
                <Text className="flex-1 pr-3 text-[13.5px]" style={{ color: palette.text }}>
                  {row.patron}
                </Text>
                <Text className="text-[13px] font-bold" style={{ color: palette.accent }}>
                  {row.total}×
                </Text>
              </View>
            ))
          )}
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
