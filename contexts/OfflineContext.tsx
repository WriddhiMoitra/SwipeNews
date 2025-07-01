import React, { createContext, useContext, useState, useEffect } from 'react';
import { NetInfoState, useNetInfo } from '@react-native-community/netinfo';

const OfflineContext = createContext<{
  isOffline: boolean;
  networkState: NetInfoState | null;
}>({
  isOffline: false,
  networkState: null,
});

export const OfflineProvider = ({ children }: { children: React.ReactNode }) => {
  const netInfo = useNetInfo();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (netInfo.isConnected !== null) {
      setIsOffline(!netInfo.isConnected);
    }
  }, [netInfo.isConnected]);

  return (
    <OfflineContext.Provider value={{ isOffline, networkState: netInfo }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
