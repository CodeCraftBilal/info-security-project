import React, { useEffect, useState, useRef } from 'react';
import { X, Download, Trash2, Info, Share2 } from 'lucide-react';
import { FileMetaData } from './FileItem';

interface ImagePreviewModalProps {
  file: FileMetaData;
  imageUrl: string;
  onClose: () => void;
  onAction: (action: 'view' | 'download' | 'share') => void;
  onDelete: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  file,
  imageUrl,
  onClose,
  onAction,
  onDelete,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDetails && detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        setShowDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetails]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
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
        
        <div className="relative flex flex-col items-center" ref={detailsRef}>
          {showDetails && (
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl p-4 text-left z-10 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="font-semibold text-gray-800 text-sm mb-3 border-b pb-2">Image Details</h4>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Name</span>
                  <span className="text-gray-800 break-all">{file.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Type</span>
                  <span className="text-gray-800">{file.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Size</span>
                  <span className="text-gray-800 font-medium">{file.size}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Uploaded At</span>
                  <span className="text-gray-800">{file.uploadedAt}</span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
            </div>
          )}
          
          <button onClick={() => setShowDetails(!showDetails)} className="group flex flex-col items-center text-gray-300 hover:text-white transition-colors">
            <div className={`p-4 rounded-full mb-2 transition-colors ${showDetails ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10'}`}>
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-sm font-medium">Details</span>
          </button>
        </div>
        
        <button onClick={() => { onAction('share'); onClose(); }} className="group flex flex-col items-center text-gray-300 hover:text-white transition-colors">
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
