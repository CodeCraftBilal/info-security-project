"use client"
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { uploadFileAction } from '@/Action/uploadFileAction';
import { encryptFiles } from '@/lib/fileUtils';
import { useKeyPair } from '@/hooks/useKeyPair';
import { Menu } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import Image from 'next/image';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: authSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { keyPair, isGeneratingKey } = useKeyPair();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => {
    if (isMenuOpen) setIsMenuOpen(false);
  });

  const session = authSession ? {
    userId: authSession.user?.id as unknown as number,
  } : null;

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]): Promise<void> => {
    setIsUploading(true);
    const result = await encryptFiles(files, keyPair);
    if (!result) {
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    if (session) {
      formData.append('uploaderId', session.userId.toString());
    }

    for (const file of result) {
      const encryptedBlob = new Blob([file.file], { type: file.fileType });
      formData.append('files', encryptedBlob, file.fileName);

      const keyBlob = new Blob([file.encryptedKey], { type: 'application/octet-stream' });
      formData.append('encryptedKey', keyBlob, `${file.fileName}.key`);

      const ivBlob = new Blob([file.iv], { type: 'application/octet-stream' });
      formData.append('iv', ivBlob, `${file.fileName}.iv`);
    }

    await uploadFileAction(formData);
    setIsUploading(false);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    router.refresh();
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  }

  const handleShare = () => {
    router.push('/dashboard/share');
  }

  return (
    <div className="topbar p-2 flex items-center justify-between h-[60px] relative">
      <Link className='logo gap-1 flex items-center cursor-pointer' href={'/'}>
        <Image src="logo.svg" alt="logo" width={48} height={48} />
        <span className="text-white font-bold text-2xl hidden md:block">SecureShare</span>
      </Link>

      <div className="hidden md:flex actionbtns gap-3 items-center">
        <input 
          type="file" 
          name='fileupload' 
          className='hidden' 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept='.pdf, .doc, .docx, .jpg, .png, .mp4' 
          multiple 
        />
        <button 
          onClick={handleUploadClick} 
          disabled={isGeneratingKey || isUploading} 
          className="bg-blue-300 disabled:opacity-50 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold h-fit"
        >
          {isGeneratingKey ? 'Generating Keys...' : isUploading ? 'Uploading...' : 'Upload File'}
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
            <input 
              type="file" 
              name='fileupload' 
              className='hidden' 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept='.pdf, .doc, .docx, .jpg, .png, .mp4' 
              multiple 
            />
            <button 
              onClick={handleUploadClick} 
              disabled={isGeneratingKey || isUploading} 
              className="bg-blue-300 disabled:opacity-50 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold w-full"
            >
              {isGeneratingKey ? 'Generating...' : isUploading ? 'Uploading...' : 'Upload File'}
            </button>
            <button 
              onClick={() => { handleShare(); setIsMenuOpen(false); }} 
              className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold w-full"
            >
              Share File
            </button>
            <button
              className='bg-blue-300 p-2 rounded-xl text-black font-bold hover:bg-blue-400 hover:cursor-pointer w-full'
              onClick={() => { logout(); setIsMenuOpen(false); }}
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
