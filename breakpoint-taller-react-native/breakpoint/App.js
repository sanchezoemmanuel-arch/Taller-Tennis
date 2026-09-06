import 'react-native-gesture-handler';
import './global.css';

import React from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConnectivityProvider } from './src/context/ConnectivityContext';
import { AuthProvider } from './src/context/AuthContext';
import { MatchesProvider } from './src/context/MatchesContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  // Adaptación claro/oscuro global.
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ConnectivityProvider>
        <AuthProvider>
          <MatchesProvider>
            <RootNavigator />
          </MatchesProvider>
        </AuthProvider>
      </ConnectivityProvider>
    </SafeAreaProvider>
  );
}
