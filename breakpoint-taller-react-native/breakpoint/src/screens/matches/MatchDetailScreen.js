import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, Alert, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionCard from '../../components/SectionCard';
import StatBar from '../../components/StatBar';
import AppButton from '../../components/AppButton';
import SyncBadge from '../../components/SyncBadge';
import ErrorView from '../../components/ErrorView';
import Loading from '../../components/Loading';
import { useMatches } from '../../context/MatchesContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatDate, labelOf } from '../../utils/format';
import { SUPERFICIES } from '../../constants/tennis';
import * as matchesApi from '../../services/matchesApi';
import { describeError } from '../../utils/errors';

export default function MatchDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { palette } = useAppTheme();
  const { isOnline } = useConnectivity();
  const { token } = useAuth();
  const { getMatchById, deleteMatch, deletingId, deleteError } = useMatches();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remoteError, setRemoteError] = useState(null);
  const [remoteOk, setRemoteOk] = useState(null);
  const [checkingRemote, setCheckingRemote] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const local = await getMatchById(id);
    setMatch(local);
    setLoading(false);
    if (local) navigation.setOptions({ title: local.rival });
  }, [id, getMatchById, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Consulta de detalle remota (GET /posts/{id}) con su propio estado y reintento.
  const checkRemote = useCallback(async () => {
    if (!match?.remoteId || !isOnline) return;
    setCheckingRemote(true);
    setRemoteError(null);
    setRemoteOk(null);
    try {
      const remoto = await matchesApi.fetchMatchById(match.remoteId, { token });
      const coincide = remoto.marcador === match.marcador && remoto.rival === match.rival;
      setRemoteOk(
        coincide
          ? `El servidor respondió correctamente y su copia coincide con la tuya (id ${match.remoteId}).`
          : `El servidor respondió, pero su copia difiere de la local. En el servidor figura "${remoto.rival} · ${remoto.marcador}".`
      );
    } catch (error) {
      if (error.status === 404 && match.remoteSimulated) {
        setRemoteOk(
          'Este partido lo creaste desde la app. DummyJSON simula las escrituras, así que el registro no persiste en el servidor y tu copia local es la buena.'
        );
      } else {
        setRemoteError(describeError(error));
      }
    } finally {
      setCheckingRemote(false);
    }
  }, [match, isOnline, token]);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar partido',
      isOnline
        ? '¿Seguro que quieres eliminar este partido? Se borrará del servidor y del dispositivo.'
        : 'Sin conexión el borrado quedará pendiente y se enviará cuando vuelva el internet.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteMatch(id);
            if (result.ok) navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Loading label="Abriendo el partido…" />
      </ScreenContainer>
    );
  }

  if (!match) {
    return (
      <ScreenContainer>
        <ErrorView message="Este partido ya no está en tu dispositivo." onRetry={() => navigation.goBack()} retryLabel="Volver" />
      </ScreenContainer>
    );
  }

  const totalGolpes = match.winners + match.erroresNoForzados;
  const efectividad = totalGolpes > 0 ? Math.round((match.winners / totalGolpes) * 100) : 0;
  const isWin = match.resultado === 'victoria';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[24px] font-black" style={{ color: isWin ? palette.ok : palette.error }}>
            {isWin ? 'Victoria' : 'Derrota'}
          </Text>
          <SyncBadge status={match.syncStatus} />
        </View>

        <Text className="text-[17px] font-bold" style={{ color: palette.text }}>
          {match.rival}
        </Text>
        <Text className="mb-1 text-[13px]" style={{ color: palette.textMuted }}>
          {match.torneo} · {labelOf(SUPERFICIES, match.superficie)} · {formatDate(match.fecha)}
        </Text>
        <Text className="mb-4 text-[22px] font-bold tracking-wider" style={{ color: palette.accent }}>
          {match.marcador}
        </Text>

        <ErrorView message={deleteError} compact />
        <ErrorView message={remoteError} onRetry={checkRemote} retryLabel="Reintentar consulta remota" compact />

        {remoteOk ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            className="mb-3 rounded-2xl p-3"
            style={{ backgroundColor: `${palette.ok}18`, borderWidth: 1, borderColor: palette.ok }}
          >
            <Text className="mb-0.5 text-[13px] font-bold" style={{ color: palette.ok }}>
              Consulta completada
            </Text>
            <Text className="text-[12.5px] leading-4" style={{ color: palette.text }}>
              {remoteOk}
            </Text>
          </View>
        ) : null}

        <SectionCard title="Rendimiento" subtitle="Lo que registraste durante el partido">
          <StatBar label="Primeros saques dentro" value={match.primerSaquePct} />
          <StatBar label="Puntos ganados con tu saque" value={match.puntosGanadosSaque} />
          <StatBar label="Efectividad (winners vs errores)" value={efectividad} tone={efectividad >= 50 ? 'ok' : 'accent'} />
          <View className="mt-1 flex-row justify-between">
            <Text className="text-[13px]" style={{ color: palette.textMuted }}>
              Winners: <Text style={{ color: palette.text, fontWeight: '700' }}>{match.winners}</Text>
            </Text>
            <Text className="text-[13px]" style={{ color: palette.textMuted }}>
              Errores no forzados: <Text style={{ color: palette.text, fontWeight: '700' }}>{match.erroresNoForzados}</Text>
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Scouting del rival" subtitle="Para leer antes del próximo cruce">
          <Text className="mb-1 text-[12.5px]" style={{ color: palette.textMuted }}>
            Patrón que más repitió
          </Text>
          <Text className="mb-3 text-[14px] font-semibold" style={{ color: palette.text }}>
            {match.patronRival || 'Sin registrar'}
          </Text>
          <Text className="mb-1 text-[12.5px]" style={{ color: palette.textMuted }}>
            Lado más débil
          </Text>
          <Text className="text-[14px] font-semibold" style={{ color: palette.text }}>
            {match.ladoDebil || 'Sin registrar'}
          </Text>
        </SectionCard>

        {match.notas ? (
          <SectionCard title="Notas" subtitle="Tus apuntes del cambio de lado">
            <Text className="text-[13.5px] leading-5" style={{ color: palette.textMuted }}>
              {match.notas}
            </Text>
          </SectionCard>
        ) : null}

        {match.lastError ? (
          <Text className="mb-3 text-[11.5px]" style={{ color: palette.textMuted }}>
            Nota de sincronización: {match.lastError}
          </Text>
        ) : null}

        <View className="mb-3">
          <AppButton
            title="Editar partido"
            onPress={() => navigation.navigate('MatchForm', { mode: 'edit', id: match.id })}
            accessibilityHint="Abre el formulario para modificar este partido"
          />
        </View>
        <View className="mb-3">
          <AppButton
            title={
              !match.remoteId
                ? 'Aún no está en el servidor'
                : !isOnline
                  ? 'Sin conexión'
                  : 'Verificar en el servidor'
            }
            variant="secondary"
            loading={checkingRemote}
            disabled={checkingRemote || !isOnline || !match.remoteId}
            onPress={checkRemote}
            accessibilityHint="Consulta este partido directamente en la API"
          />
        </View>
        <AppButton
          title="Eliminar partido"
          variant="danger"
          loading={deletingId === match.id}
          disabled={deletingId === match.id}
          onPress={confirmDelete}
          accessibilityHint="Elimina este partido del dispositivo y del servidor"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
