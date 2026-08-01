import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies Policy',
  description: 'Information about how SecureShare uses cookies and local storage.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-section">
          <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl prose-content">
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Cookies & Local Storage Policy</h1>
              <p className="text-text-muted">Last Updated: August 1, 2026</p>
            </div>

            <h2>1. What Are Cookies and Local Storage?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. Local Storage and IndexedDB are web storage features that allow websites to store data persistently in your browser.
            </p>
            <p>
              Unlike most websites that use cookies for tracking and advertising, <strong>SecureShare relies heavily on browser storage (IndexedDB) for security purposes.</strong>
            </p>

            <h2>2. How We Use Browser Storage</h2>
            <p>We use browser storage primarily for essential security functions:</p>
            
            <h3>IndexedDB (Critical)</h3>
            <p>
              When you generate your encryption keys, your Private Key is securely stored in your browser's IndexedDB. This ensures the key never leaves your device. <strong>If you clear your browser's IndexedDB, you will be logged out of your encryption session and will need your 12-word recovery phrase to restore access.</strong>
            </p>

            <h3>Authentication Cookies (Critical)</h3>
            <p>
              We use secure, HTTP-only cookies managed by NextAuth.js to maintain your login session. These are strictly necessary for the application to function.
            </p>

            <h2>3. Tracking and Analytics</h2>
            <p>
              <strong>We do not use third-party tracking cookies.</strong> We do not use Google Analytics, Facebook Pixels, or any other cross-site tracking mechanisms. Your privacy is paramount.
            </p>

            <h2>4. Managing Your Storage</h2>
            <p>
              You can control and manage cookies and local storage through your browser settings. However, please note that deleting or blocking essential cookies or IndexedDB data will prevent SecureShare from working properly and will require you to recover your encryption keys using your recovery phrase.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
