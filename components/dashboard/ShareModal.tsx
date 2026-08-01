import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, File as FileIcon, XCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CryptoService } from '@/lib/crypto';
import { useKeyPair } from '@/hooks/useKeyPair';
import { saveSharedFileMetadataAction } from '@/Action/saveSharedFileMetadataAction';

export type ShareStatus = 'pending' | 'encrypting' | 'uploading' | 'completed' | 'error';

export interface FileShareState {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number;
  status: ShareStatus;
  errorMessage: string | null;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareStart?: () => void;
  onShareComplete?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 3;

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, onClose, onShareStart, onShareComplete 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileShareState[]>([]);
  const [username, setUsername] = useState('');
  const [receiverPublicKey, setReceiverPublicKey] = useState<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: authSession } = useSession();
  const { keyPair } = useKeyPair();

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setUsername('');
      setReceiverPublicKey(null);
      setError(null);
      setIsSharing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let isMounted = true;

    const fetchPublicKey = async () => {
      if (!username) {
        setReceiverPublicKey(null);
        return;
      }

      setIsVerifying(true);
      try {
        setError(null);
        const res = await fetch(`/api/users/public-key?username=${encodeURIComponent(username)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const d = await res.json();

        if (!res.ok) {
          throw new Error('User not found or public key not available');
        }

        const importedKey = await CryptoService.importPublicKey(d.publicKey);

        if (isMounted) {
          setReceiverPublicKey(importedKey);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to verify recipient');
          setReceiverPublicKey(null);
        }
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    const timer = setTimeout(fetchPublicKey, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [username]);


  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const addFiles = (files: File[]) => {
    const currentCount = selectedFiles.length;
    const toAdd = files.slice(0, MAX_FILES - currentCount);

    if (files.length + currentCount > MAX_FILES) {
      setError(`You can only select up to ${MAX_FILES} files at a time.`);
    }

    const newFileStates = toAdd.map(file => {
      let errorMessage = null;
      let status: ShareStatus = 'pending';
      let previewUrl = null;

      if (file.size > MAX_FILE_SIZE) {
        errorMessage = 'File exceeds 10 MB limit.';
        status = 'error';
      }

      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl,
        progress: 0,
        status,
        errorMessage
      };
    });

    setSelectedFiles(prev => [...prev, ...newFileStates]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return filtered;
    });
  };

  const shareFile = async (fileState: FileShareState, senderUsername: string) => {
    if (!receiverPublicKey) return;

    try {
      setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'encrypting' } : f));
      
      // 1. Generate AES key and Encrypt the file
      const aesKey = await CryptoService.generateAesKey();
      const encryptedResult = await CryptoService.encryptFile(fileState.file, aesKey);
      
      // 2. Encrypt AES key with receiver's public key
      const encryptedAesKey = await CryptoService.encryptAesKey(aesKey, receiverPublicKey);

      setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'uploading' } : f));

      // 3. Get Signature
      const sigRes = await fetch('/api/share/signature', { method: 'POST' });
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const sigData = await sigRes.json();

      // 4. Upload to Cloudinary using XMLHttpRequest for progress
      const encryptedBlob = new Blob([encryptedResult.file], { type: fileState.file.type });
      const formData = new FormData();
      formData.append('file', encryptedBlob);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', 'secure-share'); // Different folder for shared files

      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/raw/upload`);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, progress: percent } : f));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error('Cloudinary upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      // 5. Save metadata
      const keyBlob = new Blob([encryptedAesKey], { type: 'application/octet-stream' });
      const ivBlob = new Blob([encryptedResult.iv], { type: 'application/octet-stream' });

      const keyBuffer = await keyBlob.arrayBuffer();
      const ivBuffer = await ivBlob.arrayBuffer();
      const base64Key = Buffer.from(keyBuffer).toString('base64');
      const base64Iv = Buffer.from(ivBuffer).toString('base64');

      const metadataRes = await saveSharedFileMetadataAction({
        fileName: fileState.file.name,
        fileSize: fileState.file.size,
        cloudinaryUrl,
        encryptedAesKey: base64Key,
        mimeType: fileState.file.type,
        iv: base64Iv,
        senderUsername,
        recipientUsername: username
      });

      if (metadataRes.error) {
        throw new Error(metadataRes.message);
      }

      setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'completed', progress: 100 } : f));

    } catch (err: any) {
      setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'error', errorMessage: err.message } : f));
    }
  };

  const handleShareClick = async () => {
    if (!authSession?.user?.email || !receiverPublicKey) return;
    const senderUsername = authSession.user.email;
    
    const filesToShare = selectedFiles.filter(f => f.status === 'pending');
    if (filesToShare.length === 0) return;

    setIsSharing(true);
    if (onShareStart) onShareStart();

    // Share files concurrently
    await Promise.all(filesToShare.map(f => shareFile(f, senderUsername)));
    
    setIsSharing(false);
    if (onShareComplete) onShareComplete();
  };

  const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;
  const isFormValid = username && receiverPublicKey && pendingCount > 0 && !error && !isVerifying;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-text-primary text-xl font-bold">Share Files</h2>
          <button onClick={onClose} disabled={isSharing} className="text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors p-1 rounded-lg hover:bg-primary/10">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* Recipient Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Recipient Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSharing}
              className="input-field"
              placeholder="Enter recipient's username or email"
            />
            {isVerifying && <p className="text-xs text-primary-light animate-pulse">Verifying recipient...</p>}
            {receiverPublicKey && !isVerifying && <p className="text-xs text-success">✓ Recipient verified</p>}
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          {/* Dropzone / Input */}
          {!isSharing && selectedFiles.length < MAX_FILES && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:border-primary/50 mt-1"
              style={{ border: '2px dashed var(--border-strong)', background: 'var(--surface-card)' }}
            >
              <UploadCloud size={48} className="text-primary-light mb-3" />
              <p className="text-text-primary font-medium mb-1">Click or drag files here</p>
              <p className="text-text-muted text-sm">Max {MAX_FILES} files. Up to 10MB each.</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple 
                onChange={handleFileChange}
                accept=".pdf, .doc, .docx, .jpg, .png, .mp4" 
              />
            </div>
          )}

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-sm font-medium text-text-secondary">Selected Files ({selectedFiles.length}/{MAX_FILES})</label>
              {selectedFiles.map(f => (
                <div key={f.id} className="glass rounded-lg p-3 flex items-center gap-3 relative overflow-hidden">
                  
                  {/* Progress bar background */}
                  {(f.status === 'uploading' || f.status === 'encrypting') && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-primary/15 transition-all duration-300 z-0" 
                      style={{ width: `${f.progress}%` }} 
                    />
                  )}

                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-lg shrink-0 overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
                    {f.previewUrl ? (
                      <img src={f.previewUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : f.file.type.startsWith('image/') ? (
                      <ImageIcon className="text-primary-light" size={20} />
                    ) : (
                      <FileIcon className="text-primary-light" size={20} />
                    )}
                  </div>
                  
                  <div className="z-10 flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{f.file.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                      {f.status === 'error' && <span className="text-danger ml-2">{f.errorMessage}</span>}
                      {f.status === 'encrypting' && <span className="text-primary-light ml-2">Encrypting...</span>}
                      {f.status === 'uploading' && <span className="text-primary-light ml-2">{f.progress}% uploaded</span>}
                      {f.status === 'completed' && <span className="text-success ml-2">Shared successfully</span>}
                    </div>
                  </div>

                  <div className="z-10 shrink-0">
                    {f.status === 'completed' ? (
                      <CheckCircle className="text-success" size={20} />
                    ) : f.status === 'error' ? (
                      <XCircle className="text-danger" size={20} />
                    ) : !isSharing ? (
                      <button onClick={() => removeFile(f.id)} className="text-text-muted hover:text-danger p-1 transition-colors">
                        <X size={18} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-3 rounded-b-2xl" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
          <button 
            onClick={onClose} 
            disabled={isSharing}
            className="btn btn-ghost disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleShareClick}
            disabled={!isFormValid || isSharing}
            className="btn btn-primary"
          >
            {isSharing ? 'Sharing...' : `Share ${pendingCount > 0 ? pendingCount : ''} Files`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShareModal;
