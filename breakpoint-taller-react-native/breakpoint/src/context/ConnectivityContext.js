import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

const ConnectivityContext = createContext(null);

export function ConnectivityProvider({ children }) {
  const [state, setState] = useState({ isConnected: true, isInternetReachable: true, type: 'unknown' });

  useEffect(() => {
    const apply = (netState) => {
      setState({
        isConnected: Boolean(netState.isConnected),
        // isInternetReachable puede ser null mientras se determina.
        isInternetReachable: netState.isInternetReachable !== false,
        type: netState.type ?? 'unknown',
      });
    };

    NetInfo.fetch().then(apply);
    const unsubscribe = NetInfo.addEventListener(apply);
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    const netState = await NetInfo.fetch();
    setState({
      isConnected: Boolean(netState.isConnected),
      isInternetReachable: netState.isInternetReachable !== false,
      type: netState.type ?? 'unknown',
    });
    return Boolean(netState.isConnected) && netState.isInternetReachable !== false;
  }, []);

  const value = useMemo(
    () => ({ ...state, isOnline: state.isConnected && state.isInternetReachable, refresh }),
    [state, refresh]
  );

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity debe usarse dentro de ConnectivityProvider');
  return context;
}
