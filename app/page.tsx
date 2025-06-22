'use client'
import Image from "next/image";
import Head from 'next/head';
import Header from '@/components/Header';
import Features from '@/components/Features';
import SecurityBadges from '@/components/SecurityBadges';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-[#180c35] to-[#1e0d8e]">
        <Head>
          <title>SecureShare | End-to-End Encrypted File Sharing</title>
          <meta name="description" content="Secure file sharing with military-grade encryption" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header />

        <main className="container mx-auto px-4 py-8">
          <section className="text-center py-16">
            <h1 className="text-5xl font-bold text-gray-100 mb-6">
              Share Files <span className="text-blue-300">Securely</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10">
              Military-grade encryption for your files. Share with confidence knowing your data is protected with end-to-end encryption.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={()=> redirect('/register')} className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                Get Started - It's Free
              </button>
              <button className="border border-indigo-600 cursor-pointer text-white hover:text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-6 rounded-lg transition duration-300">
                Learn More
              </button>
            </div>
          </section>

          <SecurityBadges />
          <Features />
          <CTA />
        </main>

        <Footer />
      </div>
    </div>
  );
}
