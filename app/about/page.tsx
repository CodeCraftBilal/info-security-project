import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Lock, EyeOff } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about SecureShare, our mission, and why we believe in absolute privacy through end-to-end encryption.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-hero">
          <h1 className="gradient-text">Privacy is a Fundamental Right</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            We built SecureShare because we believe your data belongs to you. Not to corporations, not to hackers, and not even to us.
          </p>
        </section>

        <section className="page-section pt-0">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-primary-light" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Our Mission</h3>
              <p className="text-text-secondary leading-relaxed">
                To democratize military-grade encryption, making it accessible and easy to use for everyone, without compromising on security.
              </p>
            </div>
            
            <div className="glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <EyeOff className="w-8 h-8 text-accent-light" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Zero Knowledge</h3>
              <p className="text-text-secondary leading-relaxed">
                Our architecture is designed so that we physically cannot access your files. We only store encrypted blobs that we have no keys for.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Open Standards</h3>
              <p className="text-text-secondary leading-relaxed">
                We use proven cryptographic standards (AES-256-GCM and RSA-OAEP) implemented via the native Web Crypto API.
              </p>
            </div>
          </div>

          <div className="prose-content max-w-3xl mx-auto glass p-8 md:p-12 rounded-3xl">
            <h2>The Story Behind SecureShare</h2>
            <p>
              In an era where data breaches are daily news and digital privacy is constantly eroding, sending sensitive documents online has become a liability. Traditional cloud storage providers hold the keys to your data, meaning a breach on their end exposes your files.
            </p>
            <p>
              SecureShare was created as an open-source initiative to solve this exact problem. By moving the encryption entirely to the client-side (your browser), we eliminate the server as a point of vulnerability.
            </p>
            
            <h3>How It Works Briefly</h3>
            <p>
              When you upload a file, your browser generates a unique, one-time AES-256 key and encrypts the file locally. Only the encrypted gibberish is sent to our servers. When you share the file, that AES key is encrypted using the recipient's public RSA key, meaning only their private key (which never leaves their device) can decrypt it.
            </p>
            <p>
              For a detailed breakdown of our cryptographic implementation, please visit our <a href="/encryption">Encryption Guide</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
