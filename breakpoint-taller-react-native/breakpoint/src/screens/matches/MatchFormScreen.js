import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Alert, BackHandler, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import TextField from '../../components/TextField';
import ChipGroup from '../../components/ChipGroup';
import AppButton from '../../components/AppButton';
import ErrorView from '../../components/ErrorView';
import Loading from '../../components/Loading';
import { useMatches } from '../../context/MatchesContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useAppTheme } from '../../hooks/useAppTheme';
import { validateMatch, hasErrors } from '../../utils/validation';
import { todayISO } from '../../utils/format';
import { SUPERFICIES, RESULTADOS, PATRONES, LADOS_DEBILES } from '../../constants/tennis';

const emptyMatch = {
  rival: '',
  torneo: '',
  superficie: 'arcilla',
  fecha: todayISO(),
  resultado: 'victoria',
  marcador: '',
  primerSaquePct: '60',
  puntosGanadosSaque: '55',
  winners: '0',
  erroresNoForzados: '0',
  patronRival: PATRONES[0],
  ladoDebil: LADOS_DEBILES[0],
  notas: '',
};

export default function MatchFormScreen({ route, navigation }) {
  const mode = route.params?.mode ?? 'create';
  const matchId = route.params?.id ?? null;

  const { palette } = useAppTheme();
  const { isOnline } = useConnectivity();
  const { createMatch, updateMatch, getMatchById, creating, updating, createError, updateError } = useMatches();
  const { width } = useWindowDimensions();
  const twoColumns = width >= 700;

  const [values, setValues] = useState(emptyMatch);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  const saving = mode === 'edit' ? updating : creating;
  const saveError = mode === 'edit' ? updateError : createError;

  useEffect(() => {
    navigation.setOptions({ title: mode === 'edit' ? 'Editar partido' : 'Nuevo partido' });
  }, [navigation, mode]);

  useEffect(() => {
    if (mode !== 'edit' || !matchId) return;
    (async () => {
      const found = await getMatchById(matchId);
      if (found) {
        setValues({
          rival: found.rival,
          torneo: found.torneo,
          superficie: found.superficie,
          fecha: found.fecha,
          resultado: found.resultado,
          marcador: found.marcador,
          primerSaquePct: String(found.primerSaquePct),
          puntosGanadosSaque: String(found.puntosGanadosSaque),
          winners: String(found.winners),
          erroresNoForzados: String(found.erroresNoForzados),
          patronRival: found.patronRival || PATRONES[0],
          ladoDebil: found.ladoDebil || LADOS_DEBILES[0],
          notas: found.notas,
        });
      }
      setLoading(false);
    })();
  }, [mode, matchId, getMatchById]);

  const setField = useCallback((key, value) => {
    setDirty(true);
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const confirmDiscard = useCallback(() => {
    Alert.alert('Descartar cambios', 'Tienes datos sin guardar. ¿Quieres salir de todos modos?', [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }, [navigation]);

  // BackHandler: en Android el botón físico no debe descartar datos sin avisar.
  useEffect(() => {
    const onBackPress = () => {
      if (!dirty || saving) return false;
      confirmDiscard();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [dirty, saving, confirmDiscard]);

  const handleSubmit = async () => {
    const validation = validateMatch(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    const payload = {
      ...values,
      primerSaquePct: Number(values.primerSaquePct),
      puntosGanadosSaque: Number(values.puntosGanadosSaque),
      winners: Number(values.winners),
      erroresNoForzados: Number(values.erroresNoForzados),
    };

    const result = mode === 'edit' ? await updateMatch(matchId, payload) : await createMatch(payload);

    if (result.ok) {
      setDirty(false);
      if (result.offline) {
        Alert.alert(
          'Guardado en el dispositivo',
          'No hay conexión, así que el partido quedó pendiente. Se enviará solo cuando vuelva el internet.'
        );
      }
      navigation.goBack();
    }
  };

  const numericFields = useMemo(
    () => [
      { key: 'primerSaquePct', label: 'Primeros saques dentro (%)', hint: 'De 0 a 100' },
      { key: 'puntosGanadosSaque', label: 'Puntos ganados con tu saque (%)', hint: 'De 0 a 100' },
      { key: 'winners', label: 'Winners', hint: 'Golpes ganadores del partido' },
      { key: 'erroresNoForzados', label: 'Errores no forzados', hint: 'Errores propios sin presión' },
    ],
    []
  );

  if (loading) return <Loading label="Cargando el partido…" />;

  return (
    <KeyboardAvoidingView className="flex-1" style={{ backgroundColor: palette.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {!isOnline ? (
          <View className="mb-4 rounded-xl p-3" style={{ backgroundColor: `${palette.warn}20`, borderWidth: 1, borderColor: palette.warn }}>
            <Text className="text-[12.5px]" style={{ color: palette.text }}>
              Sin conexión: el partido se guardará como pendiente y se sincronizará después.
            </Text>
          </View>
        ) : null}

        <ErrorView message={saveError} compact />

        <TextField label="Rival" value={values.rival} onChangeText={(v) => setField('rival', v)} placeholder="Nombre del rival" error={errors.rival} accessibilityHint="Nombre de quien enfrentaste" />
        <TextField label="Torneo o cancha" value={values.torneo} onChangeText={(v) => setField('torneo', v)} placeholder="Liga municipal, cancha 3" error={errors.torneo} />

        <View className={twoColumns ? 'flex-row' : ''}>
          <View className={twoColumns ? 'mr-3 flex-1' : ''}>
            <TextField label="Fecha" value={values.fecha} onChangeText={(v) => setField('fecha', v)} placeholder="2026-03-14" error={errors.fecha} hint="Formato AAAA-MM-DD" autoCapitalize="none" />
          </View>
          <View className={twoColumns ? 'flex-1' : ''}>
            <TextField label="Marcador" value={values.marcador} onChangeText={(v) => setField('marcador', v)} placeholder="6-4 3-6 7-5" error={errors.marcador} autoCapitalize="none" />
          </View>
        </View>

        <ChipGroup label="Superficie" options={SUPERFICIES} value={values.superficie} onChange={(v) => setField('superficie', v)} error={errors.superficie} />
        <ChipGroup label="Resultado" options={RESULTADOS} value={values.resultado} onChange={(v) => setField('resultado', v)} error={errors.resultado} />

        <View className={twoColumns ? 'flex-row flex-wrap' : ''}>
          {numericFields.map((field) => (
            <View key={field.key} className={twoColumns ? 'w-1/2 pr-3' : ''}>
              <TextField
                label={field.label}
                value={values[field.key]}
                onChangeText={(v) => setField(field.key, v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                error={errors[field.key]}
                hint={field.hint}
              />
            </View>
          ))}
        </View>

        <ChipGroup
          label="Patrón que más repitió el rival"
          options={PATRONES.map((p) => ({ value: p, label: p }))}
          value={values.patronRival}
          onChange={(v) => setField('patronRival', v)}
        />
        <ChipGroup
          label="Su lado más débil"
          options={LADOS_DEBILES.map((l) => ({ value: l, label: l }))}
          value={values.ladoDebil}
          onChange={(v) => setField('ladoDebil', v)}
        />

        <TextField label="Notas del cambio de lado" value={values.notas} onChangeText={(v) => setField('notas', v)} placeholder="Qué funcionó, qué ajustar la próxima vez" multiline />

        <AppButton
          title={mode === 'edit' ? 'Guardar cambios' : 'Registrar partido'}
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          accessibilityHint="Guarda el partido en el dispositivo y en el servidor cuando haya conexión"
        />
        <View className="mt-3">
          <AppButton
            title="Cancelar"
            variant="ghost"
            disabled={saving}
            onPress={() => (dirty ? confirmDiscard() : navigation.goBack())}
            accessibilityHint="Cierra el formulario sin guardar"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
