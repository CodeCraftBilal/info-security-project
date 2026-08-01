import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UploadCloud, Share2, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works | SecureShare',
  description: 'Understand the end-to-end workflows for uploading, sharing, and recovering files on SecureShare.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-hero pb-8">
          <h1 className="text-text-primary">How It Works</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            A step-by-step look at the workflows that keep your data secure from end to end.
          </p>
        </section>

        <section className="page-section pt-8">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Upload Workflow */}
            <div className="glass p-8 md:p-10 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <UploadCloud className="w-6 h-6 text-primary-light" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">The Upload Workflow</h2>
              </div>
              
              <div className="relative pl-8 border-l-2 border-primary/30 space-y-8 mt-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">1. Local Key Generation</h3>
                  <p className="text-text-secondary text-sm">When you select a file, your browser generates a random, unique AES-256 key specifically for that file.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">2. Local Encryption</h3>
                  <p className="text-text-secondary text-sm">The browser encrypts the file using the AES key. The file is now a completely unreadable blob of data.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">3. Protecting the AES Key</h3>
                  <p className="text-text-secondary text-sm">Your browser encrypts the AES key itself using your personal Public Key (RSA). This ensures only your Private Key can access the AES key later.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">4. Upload to Cloud</h3>
                  <p className="text-text-secondary text-sm">The encrypted file blob is uploaded to our storage provider, and the encrypted AES key is saved to our database. Unencrypted data never leaves your device.</p>
                </div>
              </div>
            </div>

            {/* Share Workflow */}
            <div className="glass p-8 md:p-10 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                  <Share2 className="w-6 h-6 text-accent-light" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">The Sharing Workflow</h2>
              </div>
              
              <div className="relative pl-8 border-l-2 border-accent/30 space-y-8 mt-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">1. Fetching Public Keys</h3>
                  <p className="text-text-secondary text-sm">When you enter a recipient's username, your browser asks our server for that user's Public Key.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">2. Local Decryption</h3>
                  <p className="text-text-secondary text-sm">Your browser downloads the encrypted AES key for your file and uses your Private Key to decrypt it locally.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">3. Re-encrypting for Recipient</h3>
                  <p className="text-text-secondary text-sm">Your browser takes the unencrypted AES key and re-encrypts it, but this time using the <em>recipient's</em> Public Key.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">4. Transfer Complete</h3>
                  <p className="text-text-secondary text-sm">The new encrypted key is sent to the server. Now, when the recipient logs in, their browser uses their Private Key to unlock the AES key, allowing them to download and view the file.</p>
                </div>
              </div>
            </div>

            {/* Recovery Workflow */}
            <div className="glass p-8 md:p-10 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center border border-warning/20">
                  <ShieldAlert className="w-6 h-6 text-warning" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">The Recovery Workflow</h2>
              </div>
              
              <p className="text-text-secondary leading-relaxed mb-6">
                Because your Private Key lives in your browser's local storage, logging in on a new computer means you don't have your Private Key. Here is how the 12-word recovery phrase solves this without exposing your key to the server.
              </p>

              <div className="relative pl-8 border-l-2 border-warning/30 space-y-8 mt-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-warning flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-warning-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">1. The Encrypted Backup</h3>
                  <p className="text-text-secondary text-sm">When you first generated your keys, your browser used your 12-word phrase to create a strong password. It encrypted your Private Key with this password and sent the encrypted backup to our server.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-warning flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-warning-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">2. Entering the Phrase</h3>
                  <p className="text-text-secondary text-sm">On your new device, you enter the 12-word phrase. Your browser locally recreates the exact same strong password.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-2 border-warning flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-warning-light"></div>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">3. Restoration</h3>
                  <p className="text-text-secondary text-sm">Your browser downloads the encrypted backup from our server, unlocks it using the password derived from your phrase, and restores your Private Key to the new browser's local storage.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
