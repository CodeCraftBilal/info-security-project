"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CryptoService, KeyPair } from '@/lib/crypto';
import { generateKeyPairOnly, saveKeyPairToIndexedDB, exportPublicKeyAsBase64, exportPrivateKeyAsArrayBuffer } from '@/lib/keyManagement';
import { useKeyPair } from '@/hooks/useKeyPair';
import { useSession } from 'next-auth/react';
import { Copy, Download, Check, AlertTriangle } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [keyPair, setLocalKeyPair] = useState<KeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { setNeedsOnboarding, setKeyPair } = useKeyPair();
  const { update } = useSession();
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const phrase = CryptoService.generateRecoveryPhrase();
      setMnemonic(phrase);
      
      const newKeyPair = await generateKeyPairOnly();
      setLocalKeyPair(newKeyPair);
      
      setStep(2);
    } catch (error) {
      console.error('Error generating keys:', error);
      alert('Failed to generate keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([`SecureShare Recovery Phrase:\n\n${mnemonic}\n\nKeep this safe! If you lose this, you cannot recover your encrypted files.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "secureshare-recovery-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleComplete = async () => {
    if (!keyPair || !mnemonic) return;
    setIsSaving(true);
    try {
      // 1. Derive AES key from mnemonic
      const aesKey = await CryptoService.deriveAesKeyFromMnemonic(mnemonic);

      // 2. Export Private Key and Encrypt it
      const privateKeyBuffer = await exportPrivateKeyAsArrayBuffer(keyPair.privateKey);
      const { encrypted, iv } = await CryptoService.encryptPrivateKey(privateKeyBuffer, aesKey);

      const encryptedPrivateKeyBase64 = CryptoService.arrayBufferToBase64(encrypted);
      const ivBase64 = CryptoService.arrayBufferToBase64(iv);
      const publicKeyBase64 = await exportPublicKeyAsBase64(keyPair.publicKey);

      // 3. Upload to server
      const res = await fetch('/api/users/public-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publicKey: publicKeyBase64,
          encryptedPrivateKey: encryptedPrivateKeyBase64,
          privateKeyIV: ivBase64
        })
      });

      if (!res.ok) throw new Error('Failed to save keys on server');

      // 4. Save decrypted key locally
      await saveKeyPairToIndexedDB(keyPair);

      // 5. Update state
      await update({ hasPublicKey: true });
      setKeyPair(keyPair);
      setNeedsOnboarding(false);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save your keys. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Secure Your Account</h1>
        <p className="text-gray-500 mt-2">End-to-End Encryption Setup</p>
      </div>

      {step === 1 && (
        <div className="flex flex-col items-center">
          <div className="bg-blue-50 p-6 rounded-xl mb-6 text-blue-900 w-full">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Why do I need this?
            </h3>
            <p className="text-sm">
              SecureShare uses military-grade encryption directly in your browser. This means we never see your private files or your encryption keys. To ensure you never lose access to your files, we will generate a secure recovery phrase for you.
            </p>
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Encryption Keys'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 w-full mb-6">
            <h3 className="font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical: Save these words!
            </h3>
            <p className="text-sm text-red-600 mt-1">
              Write down this 12-word recovery phrase and keep it safe. If you log in from a new device, you will need this exact phrase to decrypt your files. <strong>We cannot recover it for you.</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {mnemonic.split(' ').map((word, idx) => (
              <div key={idx} className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center relative">
                <span className="absolute top-1 left-2 text-xs text-gray-400">{idx + 1}</span>
                <span className="font-mono font-bold text-gray-800 tracking-wider">{word}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mb-8 w-full">
            <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={downloadTxt} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">
              <Download className="w-4 h-4" />
              Download .txt
            </button>
          </div>

          <label className="flex items-center gap-3 mb-6 w-full cursor-pointer bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded text-blue-600"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="text-gray-700 font-medium">I have securely saved my 12-word recovery phrase.</span>
          </label>

          <button 
            onClick={handleComplete} 
            disabled={!confirmed || isSaving}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      )}
    </div>
  );
}
