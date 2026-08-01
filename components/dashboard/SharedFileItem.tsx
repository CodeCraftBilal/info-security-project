import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, File, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CryptoService } from '@/lib/crypto';
import FileItemMenu from './FileItemMenu';
import ImagePreviewModal from './ImagePreviewModal';
import { useSession } from 'next-auth/react';

export interface SharedFile {
  _id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  senderUsername: string;
  recipientUsername: string;
  createdAt: string;
  expiresAt: string;
  encryptedKey: string;
  iv: string;
  senderProfilePic?: string;
  recipientProfilePic?: string;
}

interface SharedFileItemProps {
  file: SharedFile;
  keyPair: any;
  onRefresh: () => void;
  onAction: (fileId: string, action: 'view' | 'download' | 'share') => void;
  onDelete: (fileId: string) => void;
}

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

const SharedFileItem: React.FC<SharedFileItemProps> = ({ file, keyPair, onRefresh, onAction, onDelete }) => {
  const { data: authSession } = useSession();
  const currentUsername = authSession?.user?.email;
  const isOutgoing = currentUsername === file.senderUsername;
  
  const otherPersonName = isOutgoing ? file.recipientUsername : file.senderUsername;
  const otherPersonPic = isOutgoing ? file.recipientProfilePic : file.senderProfilePic;
  const otherPersonLabel = isOutgoing ? 'Shared to' : 'Shared by';

  const [showDetails, setShowDetails] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let url: string | null = null;
    const loadThumbnail = async () => {
      if (file.fileType.startsWith('image/')) {
        setIsDecrypting(true);
        try {
          if (!keyPair?.privateKey) {
            throw new Error('No private key to decrypt preview');
          }
          
          const response = await fetch(`/api/downloadShared/${file._id}`);
          if (!response.ok) throw new Error('Failed to fetch file metadata');
          const fileData = await response.json();
          
          const fileResponse = await fetch(fileData.url);
          const encryptedFileBuffer = await fileResponse.arrayBuffer();
          const encryptedFileArray = new Uint8Array(encryptedFileBuffer);
          
          const encryptedKey = base64ToArrayBuffer(fileData.encryptedKey);
          const iv = base64ToUint8Array(fileData.iv);
          
          const aesKey = await CryptoService.decryptAesKey(encryptedKey, keyPair.privateKey);
          const decryptedData = await CryptoService.decryptFile(
            { file: encryptedFileArray, iv, encryptedKey },
            aesKey
          );
          
          const blob = new Blob([decryptedData], { type: fileData.type });
          
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
  }, [file._id, file.fileType, keyPair]);

  const handleAction = (action: 'view' | 'download' | 'share') => {
    onAction(file._id, action);
  };

  const handleDelete = () => {
    onDelete(file._id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fileMetaData = {
    id: file._id as any,
    icon: '',
    name: file.fileName,
    size: formatFileSize(file.fileSize),
    type: file.fileType,
    uploadedAt: formatDate(file.createdAt),
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
        {/* Direction Indicator */}
        <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur rounded-full p-1 shadow-sm">
          {isOutgoing ? (
            <span title="Shared by you">
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
            </span>
          ) : (
            <span title="Shared with you">
              <ArrowDownLeft className="w-4 h-4 text-green-500" />
            </span>
          )}
        </div>

        {/* Thumbnail Area */}
        <div 
          className={`relative w-full h-32 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden ${file.fileType.startsWith('image/') ? 'cursor-pointer hover:opacity-90' : ''}`}
          onClick={() => { if (file.fileType.startsWith('image/')) setIsPreviewOpen(true); }}
        >
          {file.fileType.startsWith('image/') ? (
             thumbnailUrl ? (
               <img src={thumbnailUrl} alt={file.fileName} className="object-cover w-full h-full" />
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
           <div className="font-semibold text-xs sm:text-sm truncate" title={file.fileName}>{file.fileName}</div>
           <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
              <span className="truncate max-w-[60%]">{file.fileType}</span>
              <span>{formatFileSize(file.fileSize)}</span>
           </div>
           
           <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
              <img 
                src={otherPersonPic || '/colImg.gif'} 
                alt="Profile" 
                className="w-6 h-6 rounded-full object-cover shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/colImg.gif'; }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-gray-400 leading-tight">{otherPersonLabel}:</span>
                <span className="text-xs font-medium text-gray-700 truncate" title={otherPersonName}>{otherPersonName}</span>
              </div>
           </div>
           <div className="text-[10px] text-red-400 mt-1">Expires: {formatDate(file.expiresAt)}</div>
        </div>
      </div>

      {isPreviewOpen && thumbnailUrl && (
        <ImagePreviewModal
          file={fileMetaData}
          imageUrl={thumbnailUrl}
          onClose={() => setIsPreviewOpen(false)}
          onAction={handleAction}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default SharedFileItem;
