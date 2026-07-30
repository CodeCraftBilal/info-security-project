"use client"
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useKeyPair } from '@/hooks/useKeyPair';
import { deleteKeyPairFromIndexedDB } from '@/lib/keyManagement';
import { Menu } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import Image from 'next/image';

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
    <div className="topbar p-2 flex items-center justify-between h-[60px] relative">
      <Link className='logo gap-1 flex items-center cursor-pointer' href={'/'}>
        <Image src="logo.svg" alt="logo" width={48} height={48} />
        <span className="text-white font-bold text-2xl hidden md:block">SecureShare</span>
      </Link>

      <div className="hidden md:flex actionbtns gap-3 items-center">
        <button 
          onClick={handleUploadClick} 
          disabled={!keyPair || isInitializing} 
          className="bg-blue-300 disabled:opacity-50 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold h-fit"
        >
          {(!keyPair || isInitializing) ? 'Loading...' : 'Upload File'}
        </button>
        <button 
          onClick={handleShare} 
          className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold h-fit"
        >
          Share File
        </button>
        <button
          className='bg-blue-300 p-2 rounded-xl text-black font-bold hover:bg-blue-400 hover:cursor-pointer h-fit'
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white p-2"
        >
          <Menu size={28} />
        </button>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-2 top-[60px] bg-[#26305aec] p-4 rounded-xl shadow-xl flex flex-col gap-3 z-50 border border-blue-400/20">
            <button 
              onClick={handleUploadClick} 
              disabled={!keyPair || isInitializing} 
              className="bg-blue-300 disabled:opacity-50 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold w-full"
            >
              {(!keyPair || isInitializing) ? 'Loading...' : 'Upload File'}
            </button>
            <button 
              onClick={handleShare} 
              className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold w-full"
            >
              Share File
            </button>
            <button
              className='bg-blue-300 p-2 rounded-xl text-black font-bold hover:bg-blue-400 hover:cursor-pointer w-full'
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
