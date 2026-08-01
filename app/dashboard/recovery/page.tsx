"use client"
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CryptoService } from '@/lib/crypto';
import { saveKeyPairToIndexedDB } from '@/lib/keyManagement';
import { useKeyPair } from '@/hooks/useKeyPair';
import { useSession } from 'next-auth/react';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function RecoveryPage() {
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { setKeyPair, setNeedsRecovery } = useKeyPair();
  const { data: session } = useSession();
  const router = useRouter();

  const handleInputChange = (index: number, value: string) => {
    const newWords = [...words];
    
    // Handle pasting a full 12-word phrase into one input
    if (value.includes(' ')) {
      const pastedWords = value.trim().split(/\s+/).slice(0, 12);
      for (let i = 0; i < pastedWords.length; i++) {
        if (index + i < 12) {
          newWords[index + i] = pastedWords[i];
        }
      }
      setWords(newWords);
      
      // Focus the next empty input, or the last one
      const nextEmpty = newWords.findIndex(w => !w);
      if (nextEmpty !== -1 && inputRefs.current[nextEmpty]) {
        inputRefs.current[nextEmpty]?.focus();
      } else {
        inputRefs.current[11]?.focus();
      }
      return;
    }

    newWords[index] = value;
    setWords(newWords);
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsRecovering(true);

    try {
      const mnemonic = words.map(w => w.trim().toLowerCase()).join(' ');
      
      if (words.some(w => !w.trim())) {
        throw new Error('Please fill in all 12 words.');
      }

      // 1. Fetch encrypted keys from server
      const username = session?.user?.email;
      if (!username) throw new Error('Not authenticated.');

      const res = await fetch(`/api/users/public-key?username=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error('Failed to fetch key data from server.');
      
      const data = await res.json();
      if (!data.encryptedPrivateKey || !data.privateKeyIV || !data.publicKey) {
        throw new Error('No recovery data found on the server. Please contact support.');
      }

      // 2. Derive AES Key
      const aesKey = await CryptoService.deriveAesKeyFromMnemonic(mnemonic);

      // 3. Decrypt Private Key
      let decryptedPrivateKeyBuffer;
      try {
        const encryptedBuffer = CryptoService.base64ToArrayBuffer(data.encryptedPrivateKey);
        const ivArray = new Uint8Array(CryptoService.base64ToArrayBuffer(data.privateKeyIV));
        
        decryptedPrivateKeyBuffer = await CryptoService.decryptPrivateKey(
          encryptedBuffer,
          ivArray,
          aesKey
        );
      } catch (err) {
        throw new Error('Invalid recovery phrase. Decryption failed.');
      }

      // 4. Import keys
      const privateKey = await CryptoService.importPrivateKey(decryptedPrivateKeyBuffer);
      const publicKey = await CryptoService.importPublicKey(data.publicKey);

      const keyPair = { publicKey, privateKey };

      // 5. Save to IndexedDB
      await saveKeyPairToIndexedDB(keyPair);
      
      // 6. Update state and redirect
      setKeyPair(keyPair);
      setNeedsRecovery(false);
      router.push('/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-6 sm:p-8 rounded-2xl animate-fade-in-up" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
          <Lock className="w-8 h-8 text-primary-light" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Unlock Your Files</h1>
        <p className="text-text-muted mt-2 text-sm">Enter your 12-word recovery phrase to restore access</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 mb-6" style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-danger" />
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      )}

      <form onSubmit={handleRecover}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {words.map((word, index) => (
            <div key={index} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono select-none">
                {index + 1}.
              </span>
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={word}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="input-field pl-9 font-mono"
                placeholder="word"
                required
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isRecovering}
          className="btn btn-primary btn-lg w-full"
        >
          {isRecovering ? 'Recovering Keys...' : 'Restore Access'}
          {!isRecovering && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
