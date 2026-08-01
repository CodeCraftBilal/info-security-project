import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Key, Lock, FileKey2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Encryption Guide | SecureShare',
  description: 'A beginner-friendly guide to understanding Private Keys, Public Keys, and AES encryption.',
};

export default function EncryptionGuidePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-hero pb-8">
          <h1 className="text-text-primary">Understanding Encryption</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            A simple, plain-English guide to how SecureShare protects your files using public keys, private keys, and AES.
          </p>
        </section>

        <section className="page-section pt-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* AES */}
            <div className="glass p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <FileKey2 className="w-8 h-8 text-primary-light" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">AES Encryption (The Safe)</h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  Imagine you have an unbreakable safe. To put a file in the safe, you need a highly complex, random password. 
                  In cryptography, this is called <strong>Symmetric Encryption (AES)</strong>.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  When you upload a file to SecureShare, your browser generates a brand new, random AES password (called a key) just for that file. 
                  It puts the file in the safe, locks it with the AES key, and sends the locked safe to our servers. Because we don't have the key, we can't open the safe.
                </p>
              </div>
            </div>

            {/* Public Key */}
            <div className="glass p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 shrink-0 bg-info/10 rounded-2xl flex items-center justify-center border border-info/20">
                <Lock className="w-8 h-8 text-info" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">Public Key (The Padlock)</h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  Now, how do you share that AES key with someone else securely? You can't just email it, because someone might intercept the email. 
                  This is where Asymmetric Encryption comes in.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Every SecureShare user has a <strong>Public Key</strong>. Think of this as an open padlock. You can give copies of this padlock to anyone in the world. 
                  If someone wants to send you the AES key for a file, they put the AES key in a box and snap your open padlock shut on it.
                </p>
              </div>
            </div>

            {/* Private Key */}
            <div className="glass p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 shrink-0 bg-danger/10 rounded-2xl flex items-center justify-center border border-danger/20">
                <Key className="w-8 h-8 text-danger" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">Private Key (The Only Key)</h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  Once your padlock is snapped shut, no one can open it—not even the person who closed it. The only thing in the universe that can open that padlock is the single, unique <strong>Private Key</strong>.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Your Private Key never leaves your device. When someone shares a file with you, they send the locked box (containing the AES key) to your browser. Your browser uses your Private Key to open the padlock, takes out the AES key, and uses it to open the safe containing the file.
                </p>
                <div className="mt-4 p-4 bg-danger-bg border border-danger/20 rounded-xl">
                  <p className="text-danger font-medium text-sm">
                    Because your Private Key never leaves your device, if you lose your device and your 12-word recovery phrase, your Private Key is gone forever. Without it, none of the padlocks can be opened, and your files cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-6">
              <p className="text-text-muted mb-4">Want the technical details?</p>
              <a href="/security" className="btn btn-secondary">Read the Security Architecture</a>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
