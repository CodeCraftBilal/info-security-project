import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image src="/logo.svg" alt="SecureShare Logo" width={32} height={32} />
              <span className="text-lg font-bold text-text-primary">
                Secure<span className="gradient-text">Share</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-4">
              The most secure way to share files with end-to-end encryption. Your data is encrypted before it leaves your device.
            </p>
            <a
              href="https://github.com/CodeCraftBilal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
              <span>CodeCraftBilal</span>
            </a>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/encryption" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Encryption Guide
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-text-muted hover:text-primary-light transition-colors">
                  Cookies Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-text-muted text-sm">
            © {currentYear} SecureShare. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Built with end-to-end encryption. Your files, your keys, your privacy.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;