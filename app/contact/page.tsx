

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Github, Send } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the SecureShare team for support, business inquiries, or security reports.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="page-hero pb-8">
          <h1 className="text-text-primary">Get in Touch</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Have questions about our encryption? Need support? We're here to help.
          </p>
        </section>

        <section className="page-section pt-8">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-text-primary mb-6">Direct Contact</h3>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <Mail className="w-6 h-6 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted mb-1">Email Us</p>
                    <a href="mailto:contact@bilalkhan.online" className="text-lg font-semibold text-text-primary hover:text-primary transition-colors">
                      contact@bilalkhan.online
                    </a>
                    <p className="text-sm text-text-secondary mt-2">
                      For general inquiries, support, and business partnerships. We aim to respond within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-elevated rounded-xl shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                    <Github className="w-6 h-6 text-text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted mb-1">Open Source</p>
                    <a href="https://github.com/CodeCraftBilal" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-text-primary hover:text-primary transition-colors">
                      github.com/CodeCraftBilal
                    </a>
                    <p className="text-sm text-text-secondary mt-2">
                      Report bugs, contribute to the codebase, or review our cryptographic implementations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-2xl bg-danger/5 border-danger/20">
                <h3 className="text-lg font-bold text-danger mb-2">Security Vulnerabilities</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  If you have discovered a security vulnerability in SecureShare, please DO NOT open a public issue. Instead, email us directly.
                </p>
                <a href="mailto:contact@bilalkhan.online?subject=Security Vulnerability Report" className="btn btn-danger btn-sm">
                  Report Vulnerability
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-text-primary mb-6">Send a Message</h3>
              <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-sm font-medium text-text-secondary">First Name</label>
                    <input type="text" id="firstName" className="input-field" placeholder="John" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-sm font-medium text-text-secondary">Last Name</label>
                    <input type="text" id="lastName" className="input-field" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email Address</label>
                  <input type="email" id="email" className="input-field" placeholder="john@example.com" />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-sm font-medium text-text-secondary">Subject</label>
                  <select id="subject" className="input-field appearance-none bg-surface">
                    <option>General Support</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Business Inquiry</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-text-secondary">Message</label>
                  <textarea id="message" rows={5} className="input-field resize-none" placeholder="How can we help you?"></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-full">
                  <Send className="w-4 h-4" />
                  Send Message (Demo Only - Please Use Email)
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
