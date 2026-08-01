import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Key, FileText, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Architecture',
  description: 'Detailed technical overview of SecureShare\'s end-to-end encryption architecture.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-hero pb-8">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-text-primary">Security Architecture</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            A transparent look at how we implement end-to-end encryption using native web APIs.
          </p>
        </section>

        <section className="page-section pt-8">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Overview */}
            <div className="glass p-8 md:p-10 rounded-3xl">
              <h2 className="text-2xl font-bold text-text-primary mb-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>Overview</h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                SecureShare utilizes a hybrid encryption system. We use symmetric encryption (AES-256-GCM) for fast file encryption, and asymmetric encryption (RSA-OAEP) for secure key exchange. All cryptographic operations are performed on the client side using the standard Web Crypto API.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-elevated border" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-semibold text-text-primary">Client-Side Only</span>
                  </div>
                  <p className="text-sm text-text-muted">Keys are generated in the browser. Unencrypted data never touches the network.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-elevated border" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-semibold text-text-primary">Native APIs</span>
                  </div>
                  <p className="text-sm text-text-muted">Relying on standard Web Crypto API rather than custom cryptography.</p>
                </div>
              </div>
            </div>

            {/* Cryptographic Primitives */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-primary-light" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">File Encryption (AES-GCM)</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Every time a file is uploaded, a unique AES-256 key is generated. The file is encrypted using AES-GCM (Galois/Counter Mode).
                </p>
                <ul className="text-sm text-text-muted space-y-2">
                  <li>• Key Length: 256 bits</li>
                  <li>• IV: 96-bit random nonce</li>
                  <li>• Authentication: Built-in GCM auth tag prevents tampering</li>
                </ul>
              </div>

              <div className="glass p-8 rounded-3xl">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                  <Key className="w-6 h-6 text-accent-light" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Key Exchange (RSA-OAEP)</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  To securely share the AES key with the server or a recipient, we wrap it using RSA-OAEP.
                </p>
                <ul className="text-sm text-text-muted space-y-2">
                  <li>• Key Size: 2048 bits</li>
                  <li>• Hash Algorithm: SHA-256</li>
                  <li>• Private Key Storage: IndexedDB (non-extractable)</li>
                </ul>
              </div>
            </div>

            {/* Key Management */}
            <div className="glass p-8 md:p-10 rounded-3xl">
              <h2 className="text-2xl font-bold text-text-primary mb-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>Key Management & Recovery</h2>
              <div className="space-y-6 text-text-secondary leading-relaxed">
                <p>
                  Upon registration, an RSA key pair is generated in your browser.
                </p>
                <ol className="list-decimal pl-5 space-y-3">
                  <li>The <strong>Public Key</strong> is sent to the server. Anyone can use this to encrypt files meant for you.</li>
                  <li>The <strong>Private Key</strong> is saved locally in IndexedDB marked as <code>extractable: false</code>.</li>
                  <li>For backup, the user is provided a 12-word mnemonic phrase.</li>
                  <li>This phrase is used to derive a strong AES key (using PBKDF2). The private key is encrypted with this derived key and the encrypted blob is sent to the server.</li>
                </ol>
                <p>
                  If you log in from a new device, you input the 12-word phrase. The browser derives the AES key, pulls the encrypted private key from the server, decrypts it locally, and saves it to the new device's IndexedDB. The server never sees the unencrypted private key or the mnemonic phrase.
                </p>
              </div>
            </div>

            <div className="text-center pt-8">
              <a href="/encryption" className="btn btn-secondary">Read our layperson's Encryption Guide</a>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
