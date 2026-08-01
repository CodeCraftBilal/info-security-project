'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, Github } from 'lucide-react'

const Header = () => {
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Security', href: '/security' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'FAQ', href: '/faq' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 glass" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="container mx-auto flex justify-between items-center px-4 h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                        <Image src="/logo.svg" alt="SecureShare Logo" width={36} height={36} />
                    </div>
                    <span className="text-xl font-bold text-text-primary tracking-tight">
                        Secure<span className="gradient-text">Share</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-all duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <a
                        href="https://github.com/CodeCraftBilal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-all duration-200 ml-1"
                        aria-label="GitHub"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    {session?.user ? (
                        <div className="flex gap-3 items-center">
                            <span className="text-sm text-text-secondary font-medium truncate max-w-[150px]">
                                {session.user.name || session.user.email}
                            </span>
                            <Link href="/dashboard" className="btn btn-primary btn-sm">
                                Dashboard
                            </Link>
                        </div>
                    ) : (
                        <Link href="/api/auth/signin" className="btn btn-primary btn-sm">
                            Log in / Sign up
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-colors"
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden glass animate-fade-in-down border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://github.com/CodeCraftBilal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-all duration-200 flex items-center gap-2"
                        >
                            <Github className="w-4 h-4" />
                            GitHub
                        </a>
                        <div className="border-t pt-3 mt-2" style={{ borderColor: 'var(--border)' }}>
                            {session?.user ? (
                                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/api/auth/signin" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full">
                                    Log in / Sign up
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
