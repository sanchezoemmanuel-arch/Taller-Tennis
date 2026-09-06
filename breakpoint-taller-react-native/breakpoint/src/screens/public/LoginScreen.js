import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextField from '../../components/TextField';
import AppButton from '../../components/AppButton';
import ErrorView from '../../components/ErrorView';
import CourtMark from '../../components/CourtMark';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function LoginScreen({ navigation }) {
  const { palette } = useAppTheme();
  const { signIn, signingIn, error, clearError } = useAuth();
  const { isOnline } = useConnectivity();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [localErrors, setLocalErrors] = useState({});

  const handleSubmit = async () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Escribe tu usuario.';
    if (!password) errors.password = 'Escribe tu contraseña.';
    else if (password.length < 4) errors.password = 'La contraseña necesita al menos 4 caracteres.';
    setLocalErrors(errors);
    if (Object.keys(errors).length > 0) return;
    clearError();
    await signIn(username, password);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, paddingBottom: 48, flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: isWide ? 460 : undefined, alignSelf: 'center' }}>
          <View className="mb-8 flex-row items-center">
            <CourtMark width={78} />
            <View className="ml-4 flex-1">
              <Text className="text-[32px] font-black" style={{ color: palette.primary, letterSpacing: -0.8 }}>
                BreakPoint
              </Text>
              <Text className="mt-1 text-[13.5px] leading-5" style={{ color: palette.textMuted }}>
                Tu bitácora táctica de tenis. Registra el partido en la cancha, con o sin señal.
              </Text>
            </View>
          </View>

          <ErrorView message={error} />

          {!isOnline ? (
            <View
              className="mb-4 rounded-xl p-3"
              style={{ backgroundColor: `${palette.warn}20`, borderWidth: 1, borderColor: palette.warn }}
            >
              <Text className="text-[12.5px]" style={{ color: palette.text }}>
                Sin conexión. El primer inicio de sesión necesita internet; después la app abre offline.
              </Text>
            </View>
          ) : null}

          <TextField
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            placeholder="emilys"
            autoCapitalize="none"
            error={localErrors.username}
            accessibilityHint="Escribe el usuario de prueba de la API"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            error={localErrors.password}
            accessibilityHint="Escribe la contraseña de prueba"
          />

          <AppButton
            title="Entrar"
            onPress={handleSubmit}
            loading={signingIn}
            disabled={signingIn}
            accessibilityHint="Inicia sesión y guarda tu credencial de forma segura"
          />

          <View className="mt-3">
            <AppButton
              title="¿Cómo funciona BreakPoint?"
              variant="ghost"
              onPress={() => navigation.navigate('ComoFunciona')}
              accessibilityHint="Abre una ventana con la explicación de la aplicación"
            />
          </View>

          <Text className="mt-8 text-center text-[12px]" style={{ color: palette.textMuted }}>
            Credenciales de prueba: emilys / emilyspass
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
