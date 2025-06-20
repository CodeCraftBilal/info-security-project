"use client"
import React, { useState, useRef, useEffect } from 'react';
import { CryptoService } from '@/lib/crypto';
import { getKeyPairFromIndexedDB } from '@/lib/keyManagement';
import Link from 'next/link';
import { User } from '@/lib/definitions'

const FileShareForm = () => {
  const [username, setUsername] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptedFile, setEncryptedFile] = useState<Uint8Array | null>(null);
  const [iv, setIv] = useState<Uint8Array | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareLink, setShareLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [receiverPublicKey, setReceiverPublicKey] = useState<CryptoKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setSessionLoading(true);
      try {
        const res = await fetch('/api/session');
        const data = await res.json();
        const ses: User = {
          userId: data?.session?.userId,
          userName: data?.session?.userId,
          userRole: data?.session?.role,
          userProfile: 'profile.png'
        }
        setSession(ses);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Get receiver's public key when username changes
  useEffect(() => {
    let isMounted = true; // To prevent state updates after component unmount

    const fetchPublicKey = async () => {
      if (!username) {
        setReceiverPublicKey(null);
        return;
      }

      try {
        setError(null);
        const res = await fetch('/api/users/publick-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userName: username,
            email: username
          })
        });

        const d = await res.json();
        console.log('user is : ', d?.publicKey); // User created


        if (!res.ok) {
          throw new Error('User not found or public key not available');
        }

        // The backend returns the public key as a string (in spki format)
        const publicKeyStr = d.publicKey;

        // Import the string public key as a CryptoKey
        const importedKey = await CryptoService.importPublicKey(publicKeyStr);

        if (isMounted) {
          setReceiverPublicKey(importedKey);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch public key for this user');
          setReceiverPublicKey(null);
        }
      }
    };

    // Add debounce to avoid too many requests
    const timer = setTimeout(fetchPublicKey, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [username]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setEncryptedFile(null);
      setIv(null);
    }
  };

  const encryptFile = async () => {
    if (!selectedFile) return;

    setIsEncrypting(true);
    try {
      // Generate AES key
      const aesKey = await CryptoService.generateAesKey();

      // Encrypt the file
      const encryptedResult = await CryptoService.encryptFile(selectedFile, aesKey);
      setEncryptedFile(encryptedResult.file);
      setIv(encryptedResult.iv);

      return { aesKey, encryptedData: encryptedResult.file, iv: encryptedResult.iv };
    } catch (error) {
      console.error('Encryption error:', error);
      setError('Failed to encrypt file');
      return null;
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile || !username || !receiverPublicKey) {
      setError(!receiverPublicKey ? 'Could not verify recipient' : 'Please fill all fields');
      return;
    }

    // First encrypt the file
    const encryptionResult = await encryptFile();
    if (!encryptionResult) return;

    const { aesKey, encryptedData, iv } = encryptionResult;

    // Now encrypt the AES key with receiver's public key
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const encryptedAesKey = await CryptoService.encryptAesKey(aesKey, receiverPublicKey);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      // Prepare form data
      const formData = new FormData();
      formData.append('recipientUsername', username);
      if (session)
        formData.append('senderUsername', session?.userName)
      formData.append('file', new Blob([encryptedData], { type: selectedFile.type }), selectedFile.name);
      formData.append('encryptedAesKey', new Blob([encryptedAesKey]));
      formData.append('iv', new Blob([iv]));
      formData.append('fileName', selectedFile.name);
      formData.append('fileType', selectedFile.type);

      const response = await fetch('/api/share', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('recieved data after file upload is: ', data)
      setShareLink(`${window.location.origin}/download/${data.fileId}`);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to share file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white relative">
          <Link
            href="/dashboard"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-200 hover:text-white transition-colors"
            title="Return to Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h2 className="text-2xl font-bold text-center">Secure File Sharing</h2>
          <p className="text-indigo-100 text-center">Send files with end-to-end encryption</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter recipient's username"
              required
            />
            {username && !receiverPublicKey && !error && (
              <p className="text-sm text-gray-500 mt-1">Verifying recipient...</p>
            )}
            {receiverPublicKey && (
              <p className="text-sm text-green-600 mt-1">Recipient verified</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File to Share
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                required
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  {encryptedFile && (
                    <p className="text-sm text-green-600">File encrypted and ready to share</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">Files up to 50MB</p>
                </div>
              )}
            </div>
          </div>

          {isEncrypting && (
            <div className="flex items-center space-x-2 text-indigo-600">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Encrypting file...</span>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">Uploading {uploadProgress}%</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || isEncrypting || !selectedFile || !username || !receiverPublicKey}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${isUploading || isEncrypting || !selectedFile || !username || !receiverPublicKey
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {isUploading ? 'Sharing...' : 'Share File Securely'}
          </button>

        {/*  {shareLink && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">File shared successfully!</p>
              <div className="flex">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 text-black px-3 py-2 text-sm border border-green-300 rounded-l-lg focus:outline-none"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-r-lg hover:bg-green-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
};

export default FileShareForm;