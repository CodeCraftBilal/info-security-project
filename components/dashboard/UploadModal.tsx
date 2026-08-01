import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, File as FileIcon, XCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { encryptFiles } from '@/lib/fileUtils';
import { useKeyPair } from '@/hooks/useKeyPair';
import { saveFileMetadataAction } from '@/Action/saveFileMetadataAction';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface FileUploadState {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number;
  status: UploadStatus;
  errorMessage: string | null;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadStart: (files: FileUploadState[]) => void;
  onUploadProgress: (id: string, progress: number) => void;
  onUploadComplete: (id: string, savedFileId: string) => void;
  onUploadError: (id: string, error: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, onClose, onUploadStart, onUploadProgress, onUploadComplete, onUploadError 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: authSession } = useSession();
  const { keyPair } = useKeyPair();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setIsUploading(false);
    }
  }, [isOpen]);

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
    const newFileStates = files.map(file => {
      let errorMessage = null;
      let status: UploadStatus = 'pending';
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

  const uploadFile = async (fileState: FileUploadState, uploaderId: string) => {
    try {
      // 1. Encrypt the file
      const encryptedDataArray = await encryptFiles([fileState.file], keyPair);
      if (!encryptedDataArray || encryptedDataArray.length === 0) {
        throw new Error('Encryption failed');
      }
      const encryptedFileData = encryptedDataArray[0];

      // 2. Get Signature
      const sigRes = await fetch('/api/upload/signature', { method: 'POST' });
      if (!sigRes.ok) throw new Error('Failed to get upload signature');
      const sigData = await sigRes.json();

      // 3. Upload to Cloudinary using XMLHttpRequest for progress
      const encryptedBlob = new Blob([encryptedFileData.file], { type: encryptedFileData.fileType });
      const formData = new FormData();
      formData.append('file', encryptedBlob);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', 'encryptedFiles');

      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/raw/upload`);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, progress: percent } : f));
            onUploadProgress(fileState.id, percent);
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

      // 4. Save metadata
      const keyBlob = new Blob([encryptedFileData.encryptedKey], { type: 'application/octet-stream' });
      const ivBlob = new Blob([encryptedFileData.iv], { type: 'application/octet-stream' });

      // Convert Blobs to Base64 for Server Action
      const keyBuffer = await keyBlob.arrayBuffer();
      const ivBuffer = await ivBlob.arrayBuffer();
      const base64Key = Buffer.from(keyBuffer).toString('base64');
      const base64Iv = Buffer.from(ivBuffer).toString('base64');

      const metadataRes = await saveFileMetadataAction({
        fileName: fileState.file.name,
        fileSize: fileState.file.size,
        cloudinaryUrl,
        encryptedAesKey: base64Key,
        mimeType: fileState.file.type,
        iv: base64Iv,
        uploaderId
      });

      if (metadataRes.error) {
        throw new Error(metadataRes.message);
      }

      setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'completed', progress: 100 } : f));
      onUploadComplete(fileState.id, metadataRes.id as string);

    } catch (error: any) {
      setSelectedFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'error', errorMessage: error.message } : f));
      onUploadError(fileState.id, error.message);
    }
  };

  const handleUploadClick = async () => {
    if (!authSession?.user?.id) return;
    const uploaderId = authSession.user.id;
    
    const filesToUpload = selectedFiles.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    
    // Set status to uploading
    setSelectedFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));
    onUploadStart(filesToUpload);

    // Upload files concurrently
    await Promise.all(filesToUpload.map(f => uploadFile(f, uploaderId)));
    
    setIsUploading(false);
  };

  const pendingCount = selectedFiles.filter(f => f.status === 'pending').length;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-text-primary text-xl font-bold">Upload Files</h2>
          <button onClick={onClose} disabled={isUploading} className="text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors p-1 rounded-lg hover:bg-primary/10">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* Dropzone / Input */}
          {!isUploading && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:border-primary/50"
              style={{ border: '2px dashed var(--border-strong)', background: 'var(--surface-card)' }}
            >
              <UploadCloud size={48} className="text-primary-light mb-3" />
              <p className="text-text-primary font-medium mb-1">Click or drag files here</p>
              <p className="text-text-muted text-sm">Supports PDF, DOC, JPG, PNG, MP4 (Max 10MB)</p>
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
            <div className="flex flex-col gap-2">
              {selectedFiles.map(f => (
                <div key={f.id} className="glass rounded-lg p-3 flex items-center gap-3 relative overflow-hidden">
                  
                  {/* Progress bar background */}
                  {f.status === 'uploading' && (
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
                      {f.status === 'uploading' && <span className="text-primary-light ml-2">{f.progress}% uploaded</span>}
                      {f.status === 'completed' && <span className="text-success ml-2">Completed</span>}
                    </div>
                  </div>

                  <div className="z-10 shrink-0">
                    {f.status === 'completed' ? (
                      <CheckCircle className="text-success" size={20} />
                    ) : f.status === 'error' ? (
                      <XCircle className="text-danger" size={20} />
                    ) : !isUploading ? (
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
            disabled={isUploading}
            className="btn btn-ghost disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleUploadClick}
            disabled={isUploading || pendingCount === 0 || !keyPair?.publicKey}
            className="btn btn-primary"
          >
            {isUploading ? 'Uploading...' : `Upload ${pendingCount > 0 ? pendingCount : ''} Files`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadModal;
