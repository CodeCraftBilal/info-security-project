"use client"
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { CryptoService } from '@/lib/crypto';
import { getKeyPairFromIndexedDB } from '@/lib/keyManagement';
import { useSession } from 'next-auth/react';
import SharedFileItem, { SharedFile } from './dashboard/SharedFileItem';
import ContentLoader from './Loader/ContentLoader';
import EmptyFiles from './dashboard/EmptyFiles';

interface User {
  userId: string;
  userName: string;
  userRole: string;
  userProfile: string;
}

const SharedWithMe = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: authSession } = useSession();
  const [session, setSession] = useState<User | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Set session from NextAuth and fetch key pair
  useEffect(() => {
    const initialize = async () => {
      try {
        if (authSession?.user) {
          setSession({
            userId: (authSession.user as any).id || '',
            userName: authSession.user.email || authSession.user.name || '',
            userRole: (authSession.user as any).role || 'user',
            userProfile: authSession.user.image || 'profile.png'
          });
        }

        // Get key pair
        const pair = await getKeyPairFromIndexedDB();
        setKeyPair(pair);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, [authSession]);

  const fetchSharedFiles = async () => {
    if (!session?.userName) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/files/shared-with-me?recipient=${session.userName}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      if (!data.files) throw new Error('Invalid response format');
      
      setFiles(data.files);
      setFilteredFiles(data.files);
    } catch (error) {
      console.error('Error fetching shared files:', error);
      alert('Failed to load shared files. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch shared files when session is available
  useEffect(() => {
    fetchSharedFiles();
  }, [session]);

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to first page on search

    if (searchTerm === '') {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file =>
        file.fileName.toLowerCase().includes(searchTerm) ||
        file.fileType.toLowerCase().includes(searchTerm) ||
        file.senderUsername.toLowerCase().includes(searchTerm)
      );
      setFilteredFiles(filtered);
    }
  };

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const handleAction = async (fileId: string, action: 'view' | 'download' | 'share') => {
    if (action === 'share') {
      alert('Sharing is not supported for files that are already shared with you.');
      return;
    }
    
    try {
      const response = await fetch(`/api/downloadShared/${fileId}`);
      const fileData = await response.json();
  
      const privateKey = keyPair?.privateKey;
      if (!privateKey) throw new Error('Private key not found');
  
      const fileResponse = await fetch(fileData.url);
      const encryptedFileBuffer = await fileResponse.arrayBuffer();
      const encryptedFileArray = new Uint8Array(encryptedFileBuffer);
  
      const encryptedKey = base64ToArrayBuffer(fileData.encryptedKey);
      const iv = base64ToUint8Array(fileData.iv)
  
      const aesKey = await CryptoService.decryptAesKey(encryptedKey, privateKey);
      const decryptedData = await CryptoService.decryptFile(
        { file: encryptedFileArray, iv, encryptedKey },
        aesKey
      );
  
      if (action === 'view') {
        viewDecryptedFile(decryptedData, fileData.type, fileData.name);
      } else {
        downloadDecryptedFile(decryptedData, fileData.type, fileData.name);
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      alert(`Failed to ${action} file: ${error.message}`);
    }
  };

  const viewDecryptedFile = (data: Uint8Array, mimeType: string, fileName: string) => {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      if (mimeType.includes('pdf') || 
          mimeType.startsWith('image/') || 
          mimeType.startsWith('text/')) {
        window.open(url, '_blank');
      } else {
        downloadDecryptedFile(data, mimeType, fileName);
      }
    } catch (error) {
      console.error('View file error:', error);
      alert('Failed to display file. Trying download instead...');
      downloadDecryptedFile(data, mimeType, fileName);
    }
  };

  const downloadDecryptedFile = (data: Uint8Array, mimeType: string, fileName: string) => {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to remove this shared file?')) return;
    
    try {
      const response = await fetch(`/api/files/delete/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Server responded with error');
      
      setFiles(files.filter(file => file._id !== fileId));
      setFilteredFiles(filteredFiles.filter(file => file._id !== fileId));
      alert('File removed successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const hasNoFiles = !loading && filteredFiles.length === 0;

  return (
    <div className='w-full h-full px-4 flex flex-col gap-3 relative'>
      {/* Search Bar */}
      <div className="flex items-center gap-2 rounded-xl mt-4 px-4 py-2.5 mx-1 w-full max-w-2xl" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <Search className="text-text-muted h-5 w-5 shrink-0" />
        <input 
          onChange={handleChangeSearch} 
          value={search}
          type="search" 
          placeholder="Search files shared with you..."
          className='flex-1 py-0.5 text-text-primary text-base focus:outline-none bg-transparent placeholder:text-text-muted' 
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="filescontainer grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 sm:gap-5 p-2">
          {loading && (
            <div className='col-span-full text-center'>
              <ContentLoader type='grid'/>
            </div>
          )}
          
          {hasNoFiles && (
            <EmptyFiles 
              title="No Shared Files" 
              message="No one has shared any files with you yet. When they do, those files will appear here securely encrypted."
              onUploadClick={() => { window.dispatchEvent(new CustomEvent('openUploadModal')); }}
            />
          )}

          {paginatedFiles.map((file) => (
            <SharedFileItem 
              key={file._id} 
              file={file} 
              keyPair={keyPair} 
              onRefresh={fetchSharedFiles} 
              onAction={handleAction}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4 mt-auto">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="btn btn-secondary btn-sm disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-text-secondary text-sm font-medium px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="btn btn-secondary btn-sm disabled:opacity-40"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;