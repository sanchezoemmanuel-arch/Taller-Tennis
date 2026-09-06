import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import MatchCard from '../../components/MatchCard';
import ErrorView from '../../components/ErrorView';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import TextField from '../../components/TextField';
import ChipGroup from '../../components/ChipGroup';
import AppButton from '../../components/AppButton';
import { useMatches } from '../../context/MatchesContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FILTROS_SUPERFICIE, FILTROS_RESULTADO } from '../../constants/tennis';
import { formatDateTime } from '../../utils/format';

export default function MatchesListScreen({ navigation }) {
  const { palette } = useAppTheme();
  const { isOnline } = useConnectivity();
  const {
    items, filters, setFilters, loadingInitial, refreshing, listError,
    refresh, loadLocal, counters, syncing, syncNow, lastSyncAt,
  } = useMatches();

  const { width } = useWindowDimensions();
  // Interfaz adaptable: en pantallas anchas la lista pasa a dos columnas.
  const numColumns = width >= 700 ? 2 : 1;
  const [showFilters, setShowFilters] = useState(false);

  // Al volver a la pantalla se relee SQLite para reflejar cambios locales.
  useFocusEffect(
    useCallback(() => {
      loadLocal();
    }, [loadLocal])
  );

  const header = (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[22px] font-black" style={{ color: palette.text }}>
            Mis partidos
          </Text>
          <Text className="text-[12px]" style={{ color: palette.textMuted }}>
            {counters.total} registrados · última sincronización {formatDateTime(lastSyncAt)}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowFilters((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          accessibilityHint="Muestra u oculta los filtros de búsqueda"
          className="rounded-xl px-3 py-2.5"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={{ color: palette.text, fontWeight: '700', fontSize: 13 }}>Filtros</Text>
        </Pressable>
      </View>

      {counters.pending + counters.failed > 0 ? (
        <View
          className="mb-3 rounded-2xl p-3.5"
          style={{ backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="mb-2 text-[13px] font-semibold" style={{ color: palette.text }}>
            {counters.pending} pendiente(s) y {counters.failed} fallido(s) por sincronizar
          </Text>
          <AppButton
            title={isOnline ? 'Sincronizar ahora' : 'Sin conexión'}
            variant="secondary"
            loading={syncing}
            disabled={syncing || !isOnline}
            onPress={syncNow}
            accessibilityHint="Envía al servidor los partidos guardados sin conexión"
          />
        </View>
      ) : null}

      {showFilters ? (
        <View className="mb-1">
          <TextField
            label="Buscar"
            value={filters.search}
            onChangeText={(text) => setFilters({ search: text })}
            placeholder="Rival o torneo"
            autoCapitalize="none"
            accessibilityHint="Filtra los partidos por rival o torneo"
          />
          <ChipGroup
            label="Superficie"
            options={FILTROS_SUPERFICIE}
            value={filters.superficie}
            onChange={(value) => setFilters({ superficie: value })}
          />
          <ChipGroup
            label="Resultado"
            options={FILTROS_RESULTADO}
            value={filters.resultado}
            onChange={(value) => setFilters({ resultado: value })}
          />
        </View>
      ) : null}

      <ErrorView message={listError} onRetry={refresh} retryLabel="Reintentar consulta" compact />
    </View>
  );

  if (loadingInitial && items.length === 0) {
    return (
      <ScreenContainer>
        <Loading label="Leyendo tus partidos guardados…" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        key={`cols-${numColumns}`}
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { marginHorizontal: -4 } : undefined}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            compact={numColumns > 1}
            onPress={() => navigation.navigate('MatchDetail', { id: item.id, rival: item.rival })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Todavía no hay partidos"
            description="Registra tu primer partido para empezar a construir el perfil de tus rivales."
            actionLabel="Registrar partido"
            onAction={() => navigation.navigate('MatchForm', { mode: 'create' })}
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.primary} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() => navigation.navigate('MatchForm', { mode: 'create' })}
        accessibilityRole="button"
        accessibilityLabel="Registrar partido"
        accessibilityHint="Abre el formulario para registrar un partido nuevo"
        className="absolute right-5 items-center justify-center rounded-full active:opacity-80"
        style={{ bottom: isOnline ? 24 : 72, width: 60, height: 60, backgroundColor: palette.primary, elevation: 5 }}
      >
        <Text style={{ color: palette.primaryText, fontSize: 30, lineHeight: 34, fontWeight: '300' }}>+</Text>
      </Pressable>
    </ScreenContainer>
  );
}
