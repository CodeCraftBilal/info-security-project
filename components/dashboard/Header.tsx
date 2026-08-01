"use client"
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useKeyPair } from '@/hooks/useKeyPair';
import { deleteKeyPairFromIndexedDB } from '@/lib/keyManagement';
import { Menu, Upload, Share2, LogOut, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import Image from 'next/image';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: authSession } = useSession();
  const { keyPair, isInitializing } = useKeyPair();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => {
    if (isMenuOpen) setIsMenuOpen(false);
  });

  const handleUploadClick = (): void => {
    window.dispatchEvent(new CustomEvent('openUploadModal'));
    setIsMenuOpen(false);
  }

  const logout = async () => {
    try {
      await deleteKeyPairFromIndexedDB();
    } catch (error) {
      console.error('Failed to clear local keys during logout', error);
    }
    await signOut({ callbackUrl: '/' });
  }

  const handleShare = () => {
    router.push('/dashboard/share');
    setIsMenuOpen(false);
  }

  return (
    <div className="glass rounded-xl px-4 flex items-center justify-between h-[60px] relative">
      <Link className='flex items-center gap-2 cursor-pointer group' href={'/'}>
        <Image src="/logo.svg" alt="logo" width={36} height={36} className="transition-transform group-hover:scale-105" />
        <span className="text-text-primary font-bold text-xl hidden md:block tracking-tight">
          Secure<span className="gradient-text">Share</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-2">
        <NotificationDropdown />
        <button 
          onClick={handleUploadClick} 
          disabled={!keyPair || isInitializing} 
          className="btn btn-primary btn-sm"
        >
          <Upload className="w-4 h-4" />
          {(!keyPair || isInitializing) ? 'Loading...' : 'Upload'}
        </button>
        <button 
          onClick={handleShare} 
          className="btn btn-secondary btn-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          className='btn btn-ghost btn-sm text-text-secondary hover:text-danger'
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center gap-2" ref={menuRef}>
        <NotificationDropdown />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-primary/10 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-2 top-[60px] glass-card p-3 rounded-xl shadow-xl flex flex-col gap-2 z-50 min-w-[180px] animate-fade-in-down">
            <button 
              onClick={handleUploadClick} 
              disabled={!keyPair || isInitializing} 
              className="btn btn-primary btn-sm w-full"
            >
              <Upload className="w-4 h-4" />
              {(!keyPair || isInitializing) ? 'Loading...' : 'Upload'}
            </button>
            <button 
              onClick={handleShare} 
              className="btn btn-secondary btn-sm w-full"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              className='btn btn-ghost btn-sm w-full text-danger'
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
