"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { KeyPair } from '@/lib/crypto';
import { getKeyPairFromIndexedDB, generateAndStoreKeyPair, keyPairExists } from '@/lib/keyManagement';

interface KeyContextType {
  keyPair: KeyPair | null;
  isGeneratingKey: boolean;
}

const KeyContext = createContext<KeyContextType>({ keyPair: null, isGeneratingKey: false });

export const KeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const { data: authSession, status, update } = useSession();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    const initializeKeys = async () => {
      if (status !== 'authenticated' || !authSession?.user) return;

      const exists = await keyPairExists();
      // @ts-ignore
      const hasPublicKey = authSession.user.hasPublicKey;

      if (!exists) {
        if (!hasPublicKey) {
          setIsGeneratingKey(true);
          try {
            const newKeyPair = await generateAndStoreKeyPair();
            setKeyPair(newKeyPair);

            console.log('Generated new key pair:', newKeyPair);
            
            // Upload public key to server
            const res = await fetch('/api/users/public-key', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicKey: newKeyPair.publicKey })
            });

            if (!res.ok) {
              throw new Error('Failed to upload public key');
            }

            console.log('Public key uploaded successfully');

            // Update session locally to reflect the change
            await update({ hasPublicKey: true });
          } catch (error) {
            console.error('Failed to generate/upload key pair', error);
          } finally {
            setIsGeneratingKey(false);
          }
        } else {
          const newKeyPair = await generateAndStoreKeyPair();
          setKeyPair(newKeyPair);
          
          await fetch('/api/users/public-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKey: newKeyPair.publicKey })
          });
        }
      } else {
        const pair = await getKeyPairFromIndexedDB();
        setKeyPair(pair);
        
        if (!hasPublicKey && pair?.publicKey) {
          await fetch('/api/users/public-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicKey: pair.publicKey })
          });
          await update({ hasPublicKey: true });
        }
      }
    };

    initializeKeys();
  }, [status, authSession]);

  return (
    <KeyContext.Provider value={{ keyPair, isGeneratingKey }}>
      {children}
    </KeyContext.Provider>
  );
};

export const useKeyPair = () => useContext(KeyContext);
