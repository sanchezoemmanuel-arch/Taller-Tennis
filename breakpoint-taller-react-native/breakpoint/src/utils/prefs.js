// AsyncStorage se usa exclusivamente para preferencias simples y no sensibles.
// Los datos estructurados viven en SQLite y la credencial en SecureStore.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREF_KEYS } from '../constants/config';

export async function readLastSync() {
  try {
    return await AsyncStorage.getItem(PREF_KEYS.lastSync);
  } catch {
    return null;
  }
}

export async function writeLastSync(iso) {
  try {
    await AsyncStorage.setItem(PREF_KEYS.lastSync, iso);
  } catch {
    // Una preferencia perdida no debe romper la aplicación.
  }
}

export async function readFilters() {
  try {
    const raw = await AsyncStorage.getItem(PREF_KEYS.filters);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function writeFilters(filters) {
  try {
    await AsyncStorage.setItem(PREF_KEYS.filters, JSON.stringify(filters));
  } catch {
    // Ignorado a propósito.
  }
}
