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
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in" style={{ background: 'rgba(0, 0, 0, 0.9)' }}>
      <div className="absolute top-4 right-4 flex gap-3">
        <button 
          onClick={onClose} 
          className="p-2.5 rounded-full text-text-secondary hover:text-text-primary transition-colors"
          style={{ background: 'var(--surface-elevated)' }}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full flex-1 min-h-0 flex items-center justify-center py-8">
        <img 
          src={imageUrl} 
          alt={file.name} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      <div className="w-full pb-8 flex flex-wrap justify-center gap-6 sm:gap-10 mt-auto">
        <button onClick={() => { onAction('download'); onClose(); }} className="group flex flex-col items-center text-text-muted hover:text-text-primary transition-colors">
          <div className="p-4 rounded-full mb-2 transition-all duration-200" style={{ background: 'var(--surface-elevated)' }}>
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Download</span>
        </button>
        
        <div className="relative flex flex-col items-center" ref={detailsRef}>
          {showDetails && (
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 rounded-xl shadow-xl p-4 text-left z-10 animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h4 className="font-semibold text-text-primary text-sm mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>Image Details</h4>
              <div className="space-y-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-text-muted font-medium">Name</span>
                  <span className="text-text-primary break-all">{file.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-text-muted font-medium">Type</span>
                  <span className="text-text-primary">{file.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-medium">Size</span>
                  <span className="text-text-primary font-medium">{file.size}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-text-muted font-medium">Uploaded At</span>
                  <span className="text-text-primary">{file.uploadedAt}</span>
                </div>
              </div>
            </div>
          )}
          
          <button onClick={() => setShowDetails(!showDetails)} className="group flex flex-col items-center text-text-muted hover:text-text-primary transition-colors">
            <div className={`p-4 rounded-full mb-2 transition-all duration-200 ${showDetails ? 'ring-2 ring-primary' : ''}`} style={{ background: 'var(--surface-elevated)' }}>
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-sm font-medium">Details</span>
          </button>
        </div>
        
        <button onClick={() => { onAction('share'); onClose(); }} className="group flex flex-col items-center text-text-muted hover:text-text-primary transition-colors">
          <div className="p-4 rounded-full mb-2 transition-all duration-200" style={{ background: 'var(--surface-elevated)' }}>
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Share</span>
        </button>
        
        <button onClick={() => { onDelete(); onClose(); }} className="group flex flex-col items-center text-text-muted hover:text-danger transition-colors">
          <div className="p-4 rounded-full mb-2 transition-all duration-200" style={{ background: 'var(--danger-bg)' }}>
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-danger" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-danger">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
