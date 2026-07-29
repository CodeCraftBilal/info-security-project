import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, FileText, Download, Trash2, Image as ImageIcon, File, Info } from 'lucide-react';
import { KeyPair } from '@/lib/crypto';
import { fetchAndDecryptFile, deleteFileAction, getDecryptedFileBlob } from '@/lib/fileUtils';

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
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleAction = async (action: 'view' | 'download') => {
    setIsOpen(false);
    try {
      await fetchAndDecryptFile(file.id.toString(), action, keyPair);
    } catch (error: any) {
      alert(`Failed to ${action} file: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    setIsOpen(false);
    const success = await deleteFileAction(file.id.toString());
    if (success) {
      onRefresh();
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-200 w-full min-w-0 sm:min-w-[200px]">
      
      {/* Thumbnail Area */}
      <div className="relative w-full h-32 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
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

        {/* 3-dot Menu Button */}
        <div 
          className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity" 
          ref={menuRef}
        >
           <button 
             onClick={() => setIsOpen(!isOpen)} 
             className="p-1 sm:p-1.5 bg-white hover:bg-gray-100 rounded-full shadow-sm text-gray-700"
           >
             <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
           </button>
           
           {isOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                 <button 
                   onClick={() => {
                     setShowDetails(!showDetails);
                     setIsOpen(false);
                   }} 
                   className="md:hidden w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                 >
                   <Info className="mr-2 h-4 w-4" />
                   {showDetails ? 'Hide Details' : 'Show Details'}
                 </button>
                 <button
                   onClick={() => handleAction('view')}
                   className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                 >
                   <FileText className="mr-2 h-4 w-4" />
                   View
                 </button>
                 <button
                   onClick={() => handleAction('download')}
                   className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                 >
                   <Download className="mr-2 h-4 w-4" />
                   Download
                 </button>
                 <button
                   onClick={handleDelete}
                   className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                 >
                   <Trash2 className="mr-2 h-4 w-4" />
                   Delete
                 </button>
              </div>
           )}
        </div>
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
  );
};

export default FileItem;
