import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SecureShare — End-to-End Encrypted File Sharing",
    template: "%s | SecureShare",
  },
  description:
    "Share files with military-grade end-to-end encryption. SecureShare uses AES-256-GCM and RSA-OAEP to protect your data — only you and your recipient can access the files.",
  keywords: [
    "secure file sharing",
    "end-to-end encryption",
    "encrypted file transfer",
    "AES-256",
    "RSA encryption",
    "zero-knowledge",
    "privacy",
    "SecureShare",
  ],
  authors: [{ name: "Bilal Khan", url: "https://github.com/CodeCraftBilal" }],
  creator: "Bilal Khan",
  metadataBase: new URL("https://secureshare.bilalkhan.online"),
  openGraph: {
    title: "SecureShare — End-to-End Encrypted File Sharing",
    description:
      "Military-grade encryption for your files. Share with confidence using AES-256-GCM and RSA-OAEP.",
    url: "https://secureshare.bilalkhan.online",
    siteName: "SecureShare",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureShare — End-to-End Encrypted File Sharing",
    description:
      "Military-grade encryption for your files. Share with confidence.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
