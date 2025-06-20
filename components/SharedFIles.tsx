"use client"
import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, MoreVertical } from 'lucide-react';
import { CryptoService } from '@/lib/crypto';
import { getKeyPairFromIndexedDB } from '@/lib/keyManagement';

interface SharedFile {
  _id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  senderUsername: string;
  recipientUsername: string;
  createdAt: string;
  encryptedKey: string;
  iv: string;
}

interface User {
  userId: string;
  userName: string;
  userRole: string;
  userProfile: string;
}

const SharedWithMe = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [keyPair, setKeyPair] = useState<any>(null);
  const menuRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

    const setMenuRef = (id: string) => (el: HTMLDivElement | null) => {
    menuRefs.current[id] = el;
  };

  // Fetch session and key pair
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get session
        const res = await fetch('/api/session');
        const data = await res.json();
        const ses: User = {
          userId: data?.session?.userId,
          userName: data?.session?.userId,
          userRole: data?.session?.role,
          userProfile: 'profile.png'
        };
        setSession(ses);

        // Get key pair
        const pair = await getKeyPairFromIndexedDB();
        setKeyPair(pair);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  // Fetch shared files when session is available
  useEffect(() => {
    if (!session?.userName) return;

    const fetchSharedFiles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/files/shared-with-me?recipient=${session.userName}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (!data.files) throw new Error('Invalid response format');
        
        setFiles(data.files);
      } catch (error) {
        console.error('Error fetching shared files:', error);
        alert('Failed to load shared files. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFiles();
  }, [session]);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutside = Object.values(menuRefs.current).every(
        (ref) => ref && !ref.contains(target)
      );
      if (clickedOutside) setOpenMenuId(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Robust base64 decoder with error handling
 const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

function base64ToUint8Array(base64: string) {
  // Decode the base64 string to binary string
  const binaryString = atob(base64);

  // Create a Uint8Array from the binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

  const fetchAndDecryptFile = async (fileId: string, action: 'view' | 'download') => {
    try {
      // 1. Get file metadata from API
      const response = await fetch(`/api/downloadShared/${fileId}`);
      const fileData = await response.json();
      console.log('file data is : ', fileData)
  
      // 2. Retrieve private key from IndexedDB
      // const privateKey = await getPrivateKeyFromIndexedDB(); // Implement this function
      const privateKey = keyPair?.privateKey;
      console.log('private key is: ', privateKey)
  
      if (!privateKey) {
        throw new Error('Private key not found in IndexedDB');
      }
  
      // 3. Download the encrypted file from Cloudinary
      const fileResponse = await fetch(fileData.url);
      const encryptedFileBuffer = await fileResponse.arrayBuffer();
      const encryptedFileArray = new Uint8Array(encryptedFileBuffer);
      console.log('encrypted file is : ', encryptedFileArray);
  
      // 4. Prepare the encrypted AES key and IV
      const encryptedKey = base64ToArrayBuffer(fileData.encryptedKey);
      // const iv = base64ToArrayBuffer(fileData.iv);
      const iv = base64ToUint8Array(fileData.iv)
  
      // 5. Decrypt the AES key with RSA private key
      console.log('start decrypting aes key');
      const aesKey = await CryptoService.decryptAesKey(encryptedKey, privateKey);
      console.log('after decrypting aes key')
  
      // 6. Decrypt the file
      const decryptedData = await CryptoService.decryptFile(
        { file: encryptedFileArray, iv, encryptedKey },
        aesKey
      );
  
  
      // 7. Handle based on action
      if (action === 'view') {
        viewDecryptedFile(decryptedData, fileData.type, fileData.name);
      } else {
        downloadDecryptedFile(decryptedData, fileData.type, fileData.name);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // alert(`Failed to ${action} file: ${error.message}`);
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
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`/api/files/delete/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Server responded with error');
      
      setFiles(files.filter(file => file.fileId !== fileId));
      alert('File deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="right flex flex-col items-center gap-2 bg-blue-200 w-[70%] h-full rounded-2xl px-2">
      <div className="search flex items-center gap-2 rounded-lg mt-4 p-1 bg-blue-300 mx-2 w-[90%]">
        <input 
          type="search" 
          placeholder="Search shared files..."
          className='w-[calc(100%-60px)] py-1 px-2 text-black out text-xl focus:outline-hidden' 
        />
        <button><img src="/search.png" width={35} height={35} alt="search" /></button>
      </div>

      <div className="filescontainer flex flex-wrap gap-3 min-h-[85%] max-h-full overflow-auto w-full p-2">
        {loading ? (
          <div className="w-full text-center py-8">Loading shared files...</div>
        ) : files.length === 0 ? (
          <div className="w-full text-center py-8 flex flex-col items-center">
            <FileText className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No files shared with you yet</h3>
            <p className="text-gray-600">Files shared with you will appear here</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file._id}
              ref={setMenuRef(file._id)}
              className={`${
                openMenuId === file._id ? 'border-gray-300 border-2 shadow-xl' : ''
              } relative min-w-[250px] max-h-[150px] flex flex-grow flex-col items-start gap-2 text-black bg-white py-3 px-3 rounded-xl max-w-[48%]`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{file.fileName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Shared by: {file.senderUsername}
                  </p>
                </div>
                <div className="menu absolute right-2 top-2">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === file._id ? null : file._id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {openMenuId === file._id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <button
                        onClick={() => fetchAndDecryptFile(file._id, 'view')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => fetchAndDecryptFile(file._id, 'download')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(file._id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between w-full text-sm text-gray-600">
                <span>{formatFileSize(file.fileSize)}</span>
                <span>{formatDate(file.createdAt)}</span>
              </div>

              <button
                onClick={() => fetchAndDecryptFile(file.fileId, 'download')}
                className="mt-2 w-full py-1 px-3 bg-blue-100 hover:bg-blue-200 rounded-md text-sm font-medium flex items-center justify-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SharedWithMe;