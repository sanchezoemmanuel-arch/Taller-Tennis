import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, Alert, useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionCard from '../../components/SectionCard';
import AppButton from '../../components/AppButton';
import SyncBadge from '../../components/SyncBadge';
import ErrorView from '../../components/ErrorView';
import { useMatches } from '../../context/MatchesContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatDateTime } from '../../utils/format';

export default function SettingsScreen() {
  const { palette } = useAppTheme();
  const scheme = useColorScheme();
  const { isOnline, type, refresh } = useConnectivity();
  const { user, restoredOffline } = useAuth();
  const { counters, syncing, syncNow, syncResult, lastSyncAt, getPendingMatches, clearLocalData, loadLocal } = useMatches();

  const [pending, setPending] = useState([]);
  const [clearing, setClearing] = useState(false);

  const loadPending = useCallback(async () => {
    const rows = await getPendingMatches();
    setPending(rows);
  }, [getPendingMatches]);

  useFocusEffect(
    useCallback(() => {
      loadPending();
    }, [loadPending])
  );

  const handleSync = async () => {
    await syncNow();
    await loadPending();
  };

  const handleClear = () => {
    Alert.alert(
      'Borrar datos locales',
      'Se eliminará la copia guardada en el dispositivo, incluidos los cambios pendientes. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearLocalData();
            await loadPending();
            await loadLocal();
            setClearing(false);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-3 text-[22px] font-black" style={{ color: palette.text }}>
          Configuración
        </Text>

        <SectionCard title="Cuenta" subtitle="Sesión guardada de forma segura en el dispositivo">
          <Text className="text-[13.5px]" style={{ color: palette.text }}>
            {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Jugador'}
          </Text>
          <Text className="text-[12.5px]" style={{ color: palette.textMuted }}>
            {user?.username} · {user?.email || 'sin correo'}
          </Text>
          {restoredOffline ? (
            <Text className="mt-2 text-[12px]" style={{ color: palette.warn }}>
              Sesión restaurada sin conexión: se validará con el servidor en cuanto haya internet.
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard title="Conexión" subtitle="Estado detectado por NetInfo">
          <Text className="text-[13.5px]" style={{ color: isOnline ? palette.ok : palette.warn }}>
            {isOnline ? 'En línea' : 'Sin conexión'} · red {type}
          </Text>
          <Text className="mb-3 text-[12.5px]" style={{ color: palette.textMuted }}>
            Última sincronización: {formatDateTime(lastSyncAt)}
          </Text>
          <AppButton
            title="Comprobar conexión"
            variant="secondary"
            onPress={refresh}
            accessibilityHint="Vuelve a consultar el estado de la red"
          />
        </SectionCard>

        <SectionCard title="Apariencia" subtitle="Se ajusta al sistema con useColorScheme">
          <Text className="text-[13.5px]" style={{ color: palette.text }}>
            Modo actual: {scheme === 'dark' ? 'oscuro' : 'claro'}
          </Text>
          <Text className="mt-1 text-[12.5px]" style={{ color: palette.textMuted }}>
            Cambia el tema del sistema y la aplicación se adapta al instante.
          </Text>
        </SectionCard>

        <SectionCard
          title="Cola de sincronización"
          subtitle={`${counters.pending} pendiente(s) · ${counters.failed} fallido(s) · ${counters.total} en total`}
        >
          {syncResult?.error ? <ErrorView message={syncResult.error} compact /> : null}
          {pending.length === 0 ? (
            <Text className="mb-3 text-[13px]" style={{ color: palette.textMuted }}>
              No hay operaciones esperando. Todo está al día.
            </Text>
          ) : (
            pending.map((row) => (
              <View
                key={row.id}
                className="mb-2 rounded-xl p-3"
                style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}
              >
                <View className="mb-1 flex-row items-center justify-between">
                  <Text numberOfLines={1} className="flex-1 pr-2 text-[13.5px] font-semibold" style={{ color: palette.text }}>
                    {row.rival}
                  </Text>
                  <SyncBadge status={row.syncStatus} compact />
                </View>
                <Text className="text-[12px]" style={{ color: palette.textMuted }}>
                  Operación: {row.pendingAction} · {formatDateTime(row.updatedAt)}
                </Text>
                {row.lastError ? (
                  <Text className="mt-1 text-[11.5px]" style={{ color: palette.error }}>
                    {row.lastError}
                  </Text>
                ) : null}
              </View>
            ))
          )}

          <AppButton
            title={isOnline ? 'Reintentar sincronización' : 'Sin conexión'}
            loading={syncing}
            disabled={syncing || !isOnline || pending.length === 0}
            onPress={handleSync}
            accessibilityHint="Vuelve a enviar al servidor las operaciones pendientes y fallidas"
          />
        </SectionCard>

        <SectionCard title="Datos locales" subtitle="Base de datos SQLite del dispositivo">
          <AppButton
            title="Borrar copia local"
            variant="danger"
            loading={clearing}
            disabled={clearing}
            onPress={handleClear}
            accessibilityHint="Elimina todos los partidos guardados en el dispositivo"
          />
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
