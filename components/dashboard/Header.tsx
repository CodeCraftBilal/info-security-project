"use client"
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { uploadFileAction } from '@/Action/uploadFileAction';
import { encryptFiles } from '@/lib/fileUtils';
import { useKeyPair } from '@/hooks/useKeyPair';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: authSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { keyPair, isGeneratingKey } = useKeyPair();

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
    router.push('/share');
  }

  return (
    <div className="topbar p-2 flex items-center justify-between h-[60px]">
      <Link className='logo gap-0 flex items-center cursor-pointer' href={'http://localhost:3000/'}>
        <img src="/logo.png" alt="logo" width={100} height={100} />
        <span className="text-white font-bold text-2xl">SecureShare</span>
      </Link>

      <div className="actionbtns flex gap-3">
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
          className="bg-blue-300 disabled:opacity-50 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold"
        >
          {isGeneratingKey ? 'Generating Keys...' : isUploading ? 'Uploading...' : 'Upload File'}
        </button>
        <button 
          onClick={handleShare} 
          className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold"
        >
          Share File
        </button>
      </div>
      <div>
        <div className="toggle flex gap-2 text-lg">
          <button
            className='bg-blue-300 p-2 rounded-xl text-black font-bold hover:bg-blue-400 hover:cursor-pointer'
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
