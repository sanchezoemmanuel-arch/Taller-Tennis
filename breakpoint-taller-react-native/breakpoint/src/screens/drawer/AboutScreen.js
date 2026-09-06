import React from 'react';
import { ScrollView, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionCard from '../../components/SectionCard';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function AboutScreen() {
  const { palette } = useAppTheme();
  const paragraph = 'text-[13.5px] leading-5';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-1 text-[24px] font-black" style={{ color: palette.primary }}>
          BreakPoint
        </Text>
        <Text className="mb-4 text-[13px]" style={{ color: palette.textMuted }}>
          Bitácora táctica de tenis · versión 1.0.0
        </Text>

        <SectionCard title="Qué resuelve">
          <Text className={paragraph} style={{ color: palette.textMuted }}>
            Un jugador amateur no tiene equipo técnico ni video del rival. BreakPoint convierte los 90 segundos del cambio de lado en
            datos: marcador, saque, winners, errores y el patrón que el rival repite. Con eso arma un perfil que se puede consultar
            antes del siguiente cruce.
          </Text>
        </SectionCard>

        <SectionCard title="Por qué funciona sin internet">
          <Text className={paragraph} style={{ color: palette.textMuted }}>
            Las canchas suelen tener mala señal. Todo se guarda primero en la base de datos del teléfono; el servidor solo actualiza la
            copia local cuando hay conexión, y lo que registres offline queda pendiente hasta poder enviarse.
          </Text>
        </SectionCard>

        <SectionCard title="Estrategia ante conflictos">
          <Text className={paragraph} style={{ color: palette.textMuted }}>
            Gana el servidor, salvo que el registro local tenga cambios sin sincronizar: en ese caso se conserva la versión del
            dispositivo hasta que la cola termine de enviarse. Así nunca se pierde lo que anotaste en la cancha.
          </Text>
        </SectionCard>

        <SectionCard title="Tecnología">
          <Text className={paragraph} style={{ color: palette.textMuted }}>
            React Native con Expo y JavaScript. React Navigation (Stack, Bottom Tabs y Drawer), Context API con useReducer, fetch,
            expo-secure-store, expo-sqlite, NetInfo y NativeWind.
          </Text>
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
