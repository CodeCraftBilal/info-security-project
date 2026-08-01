'use client'
import Header from '@/components/Header';
import Features from '@/components/Features';
import SecurityBadges from '@/components/SecurityBadges';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { redirect } from "next/navigation";
import { Shield, Lock, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 badge badge-primary mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Military-Grade Encryption</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary mb-6 leading-[1.1]">
              Share Files{' '}
              <span className="gradient-text">Securely</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Your files are encrypted in your browser with AES-256 before they ever leave your device. Only you and your intended recipient can access them.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => redirect('/api/auth/signin')}
                className="btn btn-primary btn-lg cursor-pointer group"
              >
                <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
                Get Started — It&apos;s Free
              </button>
              <button
                onClick={() => redirect('/about')}
                className="btn btn-secondary btn-lg cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { value: 'AES-256', label: 'Encryption' },
                { value: 'E2E', label: 'Protected' },
                { value: 'Zero', label: 'Knowledge' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="container mx-auto px-4 pb-16">
          <SecurityBadges />
          <Features />
          <CTA />
        </div>
      </main>

      <Footer />
    </div>
  );
}
