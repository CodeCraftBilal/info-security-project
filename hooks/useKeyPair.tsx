"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { KeyPair } from '@/lib/crypto';
import { getKeyPairFromIndexedDB, keyPairExists } from '@/lib/keyManagement';

interface KeyContextType {
  keyPair: KeyPair | null;
  needsOnboarding: boolean;
  needsRecovery: boolean;
  isInitializing: boolean;
  setKeyPair: (kp: KeyPair | null) => void;
  setNeedsOnboarding: (b: boolean) => void;
  setNeedsRecovery: (b: boolean) => void;
}

const KeyContext = createContext<KeyContextType>({ 
  keyPair: null, 
  needsOnboarding: false, 
  needsRecovery: false, 
  isInitializing: true,
  setKeyPair: () => {},
  setNeedsOnboarding: () => {},
  setNeedsRecovery: () => {}
});

export const KeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const { data: authSession, status } = useSession();
  
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const lastUserEmailRef = React.useRef<string | null>(null);

  useEffect(() => {
    const initializeKeys = async () => {
      if (status !== 'authenticated' || !authSession?.user) {
        setIsInitializing(status === 'loading');
        return;
      }

      const currentUserEmail = authSession.user.email || null;
      const isNewUser = lastUserEmailRef.current !== currentUserEmail;

      if (isNewUser) {
        setIsInitializing(true);
        lastUserEmailRef.current = currentUserEmail;
      }

      const exists = await keyPairExists();
      // @ts-ignore
      const hasPublicKey = authSession.user.hasPublicKey;

      if (!exists) {
        if (!hasPublicKey) {
          setNeedsOnboarding(true);
          setNeedsRecovery(false);
        } else {
          setNeedsRecovery(true);
          setNeedsOnboarding(false);
        }
      } else {
        const pair = await getKeyPairFromIndexedDB();
        setKeyPair(pair);
        setNeedsOnboarding(false);
        setNeedsRecovery(false);
      }
      setIsInitializing(false);
    };

    initializeKeys();
  }, [status, authSession]);

  return (
    <KeyContext.Provider value={{ 
      keyPair, 
      needsOnboarding, 
      needsRecovery, 
      isInitializing,
      setKeyPair,
      setNeedsOnboarding,
      setNeedsRecovery
    }}>
      {children}
    </KeyContext.Provider>
  );
};

export const useKeyPair = () => useContext(KeyContext);
