import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Understand how SecureShare protects your privacy. We cannot read your files, and we collect minimal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-section">
          <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl prose-content">
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Privacy Policy</h1>
              <p className="text-text-muted">Last Updated: August 1, 2026</p>
            </div>

            <h2>1. Introduction</h2>
            <p>
              At SecureShare, your privacy is our primary concern. Because we use end-to-end encryption, <strong>we cannot see, read, or access the contents of the files you upload</strong>. This privacy policy explains what minimal data we do collect and how it is used.
            </p>

            <h2>2. The Data We DO NOT Collect</h2>
            <p>
              Due to our zero-knowledge architecture:
            </p>
            <ul>
              <li>We do not have access to your private encryption keys.</li>
              <li>We cannot decrypt or view your files.</li>
              <li>We do not scan your files for content (because they are encrypted gibberish to us).</li>
            </ul>

            <h2>3. The Data We Do Collect</h2>
            <p>To provide our service, we collect the following metadata:</p>
            <ul>
              <li><strong>Account Information:</strong> Your email address, username, and profile picture provided by your OAuth provider (GitHub, Google) or entered manually.</li>
              <li><strong>Public Keys:</strong> We store your public RSA key so other users can encrypt files meant for you. Public keys are designed to be shared and contain no private information.</li>
              <li><strong>File Metadata:</strong> File name, file size, MIME type, upload timestamp, and the encrypted AES key (which we cannot decrypt).</li>
              <li><strong>Usage Logs:</strong> Standard web server logs including IP addresses, browser types, and access times for security and abuse prevention.</li>
            </ul>

            <h2>4. How We Use Your Data</h2>
            <p>We use the collected metadata solely to:</p>
            <ul>
              <li>Provide, operate, and maintain the SecureShare service.</li>
              <li>Facilitate the sharing of encrypted files between users.</li>
              <li>Send email notifications when a file is shared with you.</li>
              <li>Prevent abuse and maintain the security of the platform.</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              Files and their associated metadata are stored until you delete them or until their specified expiration date (for shared files). Account information is retained as long as your account is active.
            </p>

            <h2>6. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Cloudinary:</strong> Used to store the encrypted file blobs. Cloudinary cannot read your files.</li>
              <li><strong>MongoDB Atlas:</strong> Used to store database metadata.</li>
              <li><strong>Resend:</strong> Used to send transactional emails (e.g., magic links, notification emails).</li>
              <li><strong>NextAuth:</strong> Used for secure authentication via Google and GitHub.</li>
            </ul>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:contact@bilalkhan.online">contact@bilalkhan.online</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
