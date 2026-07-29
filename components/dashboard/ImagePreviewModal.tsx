import React, { useEffect } from 'react';
import { X, Download, Trash2, Info, Share2 } from 'lucide-react';
import { FileMetaData } from './FileItem';

interface ImagePreviewModalProps {
  file: FileMetaData;
  imageUrl: string;
  onClose: () => void;
  onAction: (action: 'view' | 'download') => void;
  onDelete: () => void;
  onToggleDetails: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  file,
  imageUrl,
  onClose,
  onAction,
  onDelete,
  onToggleDetails
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="absolute top-4 right-4 flex gap-4">
        <button 
          onClick={onClose} 
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full flex-1 min-h-0 flex items-center justify-center py-8">
        <img 
          src={imageUrl} 
          alt={file.name} 
          className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
        />
      </div>

      <div className="w-full pb-8 flex flex-wrap justify-center gap-6 sm:gap-12 mt-auto">
        <button onClick={() => { onAction('download'); onClose(); }} className="group flex flex-col items-center text-gray-300 hover:text-white transition-colors">
          <div className="p-4 bg-white/5 hover:bg-white/10 rounded-full mb-2 transition-colors">
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Download</span>
        </button>
        
        <button onClick={() => { onToggleDetails(); onClose(); }} className="group flex flex-col items-center text-gray-300 hover:text-white transition-colors">
          <div className="p-4 bg-white/5 hover:bg-white/10 rounded-full mb-2 transition-colors">
            <Info className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Details</span>
        </button>
        
        <button onClick={() => { alert('Share feature coming soon'); onClose(); }} className="group flex flex-col items-center text-gray-300 hover:text-white transition-colors">
          <div className="p-4 bg-white/5 hover:bg-white/10 rounded-full mb-2 transition-colors">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Share</span>
        </button>
        
        <button onClick={() => { onDelete(); onClose(); }} className="group flex flex-col items-center text-gray-300 hover:text-red-400 transition-colors">
          <div className="p-4 bg-red-500/10 hover:bg-red-500/20 rounded-full mb-2 transition-colors">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-red-400">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
