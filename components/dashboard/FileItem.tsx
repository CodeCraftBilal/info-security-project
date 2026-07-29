import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';
import { KeyPair } from '@/lib/crypto';
import { fetchAndDecryptFile, deleteFileAction, getDecryptedFileBlob } from '@/lib/fileUtils';
import FileItemMenu from './FileItemMenu';
import ImagePreviewModal from './ImagePreviewModal';
import ShareFileDialog from './ShareFileDialog';

export type FileMetaData = {
  id: number;
  icon: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
};

interface FileItemProps {
  file: FileMetaData;
  keyPair: KeyPair | null;
  onRefresh: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, keyPair, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let url: string | null = null;
    const loadThumbnail = async () => {
      if (file.type.startsWith('image/')) {
        setIsDecrypting(true);
        try {
          if (!keyPair?.privateKey) {
            throw new Error('No private key to decrypt preview');
          }
          const blob = await getDecryptedFileBlob(file.id.toString(), keyPair);
          if (active) {
            url = URL.createObjectURL(blob);
            setThumbnailUrl(url);
          }
        } catch (err: any) {
          if (active) setThumbnailError(err.message);
        } finally {
          if (active) setIsDecrypting(false);
        }
      }
    };
    loadThumbnail();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id, file.type, keyPair]);

  const handleAction = async (action: 'view' | 'download' | 'share') => {
    if (action === 'share') {
      setIsShareOpen(true);
      return;
    }
    
    try {
      await fetchAndDecryptFile(file.id.toString(), action, keyPair);
    } catch (error: any) {
      alert(`Failed to ${action} file: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    const success = await deleteFileAction(file.id.toString());
    if (success) {
      onRefresh();
    }
  };

  return (
    <div className="group relative w-full min-w-0 sm:min-w-[200px] flex flex-col h-full">
      <FileItemMenu 
        showDetails={showDetails} 
        onToggleDetails={() => setShowDetails(!showDetails)}
        onAction={handleAction}
        onDelete={handleDelete}
      />
      
      <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-200 h-full w-full">
        {/* Thumbnail Area */}
        <div 
          className={`relative w-full h-32 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden ${file.type.startsWith('image/') ? 'cursor-pointer hover:opacity-90' : ''}`}
          onClick={() => { if (file.type.startsWith('image/')) setIsPreviewOpen(true); }}
        >
          {file.type.startsWith('image/') ? (
             thumbnailUrl ? (
               <img src={thumbnailUrl} alt={file.name} className="object-cover w-full h-full" />
             ) : thumbnailError ? (
               <div className="text-red-500 text-xs text-center p-2 flex flex-col items-center">
                 <File className="w-6 h-6 sm:w-8 sm:h-8 mb-1 opacity-50 text-red-400" />
                 <span className="max-w-[120px] leading-tight">{thumbnailError}</span>
               </div>
             ) : isDecrypting ? (
               <div className="text-gray-400 text-xs sm:text-sm animate-pulse">Decrypting...</div>
             ) : (
               <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
             )
          ) : (
             <FileText className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300" />
          )}
        </div>

        {/* Details Area */}
        <div className={`flex flex-col p-2 sm:p-3 ${!showDetails ? 'hidden md:flex' : 'flex'}`}>
           <div className="font-semibold text-xs sm:text-sm truncate" title={file.name}>{file.name}</div>
           <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
              <span className="truncate max-w-[60%]">{file.type}</span>
              <span>{file.size}</span>
           </div>
           <div className="text-[8px] sm:text-[10px] text-gray-400 mt-1">{file.uploadedAt}</div>
        </div>
      </div>

      {isPreviewOpen && thumbnailUrl && (
        <ImagePreviewModal
          file={file}
          imageUrl={thumbnailUrl}
          onClose={() => setIsPreviewOpen(false)}
          onAction={handleAction}
          onDelete={handleDelete}
        />
      )}

      <ShareFileDialog
        file={file}
        keyPair={keyPair}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};

export default FileItem;
