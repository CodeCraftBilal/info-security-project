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
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Unlock Your Files</h1>
        <p className="text-gray-500 mt-2">Enter your 12-word recovery phrase to restore access</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleRecover}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {words.map((word, index) => (
            <div key={index} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono select-none">
                {index + 1}.
              </span>
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={word}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono text-gray-800"
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRecovering ? 'Recovering Keys...' : 'Restore Access'}
          {!isRecovering && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
