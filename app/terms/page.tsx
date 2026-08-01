import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the SecureShare platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-section">
          <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl prose-content">
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Terms of Service</h1>
              <p className="text-text-muted">Last Updated: August 1, 2026</p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using SecureShare ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              SecureShare is an end-to-end encrypted file sharing platform. We provide a mechanism for users to encrypt files locally in their browser and store the encrypted blobs on our servers for retrieval or sharing.
            </p>

            <h2>3. User Responsibilities</h2>
            <p>As a user of SecureShare, you agree to the following:</p>
            <ul>
              <li><strong>Key Management:</strong> You are solely responsible for keeping your 12-word recovery phrase secure. <strong>If you lose your recovery phrase and your browser data is cleared, your files cannot be recovered. We cannot reset your encryption keys.</strong></li>
              <li><strong>Lawful Use:</strong> You agree not to use the Service to store, share, or transmit any material that is illegal under applicable law.</li>
              <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your authentication credentials.</li>
            </ul>

            <h2>4. Disclaimer Regarding Content</h2>
            <p>
              Because of our zero-knowledge architecture, we cannot monitor, view, or regulate the content of the files uploaded to our servers. We do not endorse, support, or guarantee the accuracy or reliability of any content shared via the Service.
            </p>
            <p>
              However, if we are notified of a specific file ID that is violating our terms (e.g., hosting malware) and provided with the decryption key by a third party, or if we receive a valid court order, we reserve the right to delete the encrypted blob.
            </p>

            <h2>5. Service Availability</h2>
            <p>
              We strive to ensure the Service is available 24/7, but we do not guarantee uninterrupted access. The Service may be suspended temporarily for maintenance or updates. We are not liable for any data loss resulting from service interruptions.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall SecureShare, its creators, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this site.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
