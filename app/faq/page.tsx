'use client'
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is End-to-End Encryption (E2EE)?",
    answer: "End-to-End Encryption means your files are encrypted on your device before they are sent over the internet, and can only be decrypted by the intended recipient on their device. Not even SecureShare can read your files."
  },
  {
    question: "What happens if I lose my 12-word recovery phrase?",
    answer: "If you lose your recovery phrase and your browser data is cleared (or you try to log in on a new device), your files are permanently lost. Because we use a zero-knowledge architecture, we do not have a copy of your private key and cannot reset your password or recover your files for you."
  },
  {
    question: "Is there a file size limit?",
    answer: "Currently, SecureShare supports files up to 10MB per upload. You can upload up to 3 files at a time when sharing directly with a user."
  },
  {
    question: "How do I share a file with someone who doesn't have an account?",
    answer: "Currently, both parties need a SecureShare account to exchange public keys and facilitate end-to-end encryption. The recipient can easily create a free account using Google or GitHub in seconds."
  },
  {
    question: "Can I revoke access to a shared file?",
    answer: "Yes, you can delete a shared file from your dashboard at any time. Because we host the encrypted blob, deleting it from our servers immediately revokes access for the recipient."
  },
  {
    question: "Is SecureShare open source?",
    answer: "Yes, the core cryptographic implementation of SecureShare is open source and available for review on GitHub."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-hero pb-8">
          <h1 className="text-text-primary">Frequently Asked Questions</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Everything you need to know about SecureShare and how we protect your data.
          </p>
        </section>

        <section className="page-section pt-8">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="glass rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 flex justify-between items-center text-left hover:bg-surface-elevated transition-colors"
                >
                  <span className="font-semibold text-text-primary pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-text-secondary text-sm leading-relaxed" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="pt-4">{faq.answer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
