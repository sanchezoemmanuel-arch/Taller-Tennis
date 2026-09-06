import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import AppButton from '../../components/AppButton';
import SectionCard from '../../components/SectionCard';
import { useAppTheme } from '../../hooks/useAppTheme';

const PASOS = [
  ['1. En el cambio de lado', 'Registra el marcador, tus winners, tus errores y el patrón que el rival está repitiendo. Funciona sin señal.'],
  ['2. Al terminar', 'La app calcula tu efectividad y guarda todo en el dispositivo; cuando vuelve el internet lo sube al servidor.'],
  ['3. Antes del próximo partido', 'Abre el perfil del rival y revisa su lado débil y su patrón favorito antes de salir a la cancha.'],
];

export default function HowItWorksScreen({ navigation }) {
  const { palette } = useAppTheme();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: 20 }}>
      <Text className="mb-2 text-[22px] font-black" style={{ color: palette.text }}>
        Scouting para jugadores reales
      </Text>
      <Text className="mb-5 text-[13.5px] leading-5" style={{ color: palette.textMuted }}>
        Los profesionales tienen un equipo que estudia al rival. Tú tienes tres minutos entre sets y, casi siempre, una cancha sin señal.
      </Text>

      {PASOS.map(([title, body]) => (
        <SectionCard key={title} title={title}>
          <Text className="text-[13.5px] leading-5" style={{ color: palette.textMuted }}>
            {body}
          </Text>
        </SectionCard>
      ))}

      <View className="mt-4">
        <AppButton
          title="Cerrar"
          variant="secondary"
          onPress={() => navigation.goBack()}
          accessibilityHint="Cierra esta ventana y vuelve al inicio de sesión"
        />
      </View>
    </ScrollView>
  );
}
