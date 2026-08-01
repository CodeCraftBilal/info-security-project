"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CryptoService, KeyPair } from '@/lib/crypto';
import { generateKeyPairOnly, saveKeyPairToIndexedDB, exportPublicKeyAsBase64, exportPrivateKeyAsArrayBuffer } from '@/lib/keyManagement';
import { useKeyPair } from '@/hooks/useKeyPair';
import { useSession } from 'next-auth/react';
import { Copy, Download, Check, AlertTriangle, Shield, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-3xl mx-auto mt-8 p-6 sm:p-8 rounded-2xl animate-fade-in-up" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
          <Shield className="w-8 h-8 text-primary-light" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Secure Your Account</h1>
        <p className="text-text-muted mt-2 text-sm">End-to-End Encryption Setup</p>
        
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>1</div>
          <div className="w-12 h-0.5" style={{ background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>2</div>
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="p-5 rounded-xl mb-6 w-full" style={{ background: 'var(--info-bg)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-info">
              <AlertTriangle className="w-4 h-4" />
              Why do I need this?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              SecureShare uses military-grade encryption directly in your browser. This means we never see your private files or your encryption keys. To ensure you never lose access to your files, we will generate a secure recovery phrase for you.
            </p>
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="btn btn-primary btn-lg"
          >
            {isGenerating ? 'Generating...' : 'Generate Encryption Keys'}
            {!isGenerating && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="p-4 rounded-xl w-full mb-6" style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 className="font-bold text-danger flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Critical: Save these words!
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Write down this 12-word recovery phrase and keep it safe. If you log in from a new device, you will need this exact phrase to decrypt your files. <strong className="text-text-primary">We cannot recover it for you.</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
            {mnemonic.split(' ').map((word, idx) => (
              <div key={idx} className="glass rounded-lg p-3 text-center relative">
                <span className="absolute top-1 left-2 text-[10px] text-text-muted">{idx + 1}</span>
                <span className="font-mono font-bold text-text-primary tracking-wider text-sm">{word}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-6 w-full">
            <button onClick={copyToClipboard} className="btn btn-secondary flex-1">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={downloadTxt} className="btn btn-secondary flex-1">
              <Download className="w-4 h-4" />
              Download .txt
            </button>
          </div>

          <label className="flex items-center gap-3 mb-6 w-full cursor-pointer glass rounded-xl p-4">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded accent-primary"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="text-text-secondary text-sm font-medium">I have securely saved my 12-word recovery phrase.</span>
          </label>

          <button 
            onClick={handleComplete} 
            disabled={!confirmed || isSaving}
            className="btn btn-primary btn-lg w-full"
          >
            {isSaving ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      )}
    </div>
  );
}
