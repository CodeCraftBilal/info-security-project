import React from 'react';
import { FileText, Image as ImageIcon, XCircle } from 'lucide-react';
import { FileUploadState } from './UploadModal';

interface TemporaryFileItemProps {
  fileState: FileUploadState;
}

const TemporaryFileItem: React.FC<TemporaryFileItemProps> = ({ fileState }) => {
  return (
    <div className="group relative w-full min-w-0 sm:min-w-[200px] flex flex-col h-full opacity-80">
      
      {/* Progress Indicator Above Preview */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden z-20" style={{ background: 'var(--surface-elevated)' }}>
        <div 
          className={`h-full transition-all duration-300 ${fileState.status === 'error' ? 'bg-danger' : 'bg-primary'}`}
          style={{ width: `${fileState.progress}%` }}
        />
      </div>

      <div className="card flex flex-col h-full w-full" style={{ borderColor: 'var(--border-strong)' }}>
        {/* Thumbnail Area */}
        <div className="relative w-full h-32 sm:h-48 flex items-center justify-center overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
          {fileState.previewUrl ? (
            <img src={fileState.previewUrl} alt={fileState.file.name} className="object-cover w-full h-full opacity-60 grayscale-[50%]" />
          ) : fileState.file.type.startsWith('image/') ? (
            <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-text-muted animate-pulse" />
          ) : (
            <FileText className="w-10 h-10 sm:w-16 sm:h-16 text-text-muted animate-pulse" />
          )}

          {/* Overlay Status */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            {fileState.status === 'error' ? (
               <XCircle className="w-10 h-10 text-danger" />
            ) : (
               <span className="text-white font-bold text-lg drop-shadow-md">{fileState.progress}%</span>
            )}
          </div>
        </div>

        {/* Details Area */}
        <div className="flex flex-col p-2 sm:p-3">
           <div className="font-semibold text-xs sm:text-sm text-text-primary truncate" title={fileState.file.name}>{fileState.file.name}</div>
           <div className="flex justify-between items-center text-[10px] sm:text-xs text-text-muted mt-1 sm:mt-2">
              <span className="truncate max-w-[60%]">{fileState.file.type}</span>
              <span>{(fileState.file.size / (1024 * 1024)).toFixed(2)} MB</span>
           </div>
           
           {fileState.status === 'error' ? (
             <div className="text-[10px] text-danger mt-1 truncate" title={fileState.errorMessage || 'Error'}>
               {fileState.errorMessage || 'Upload failed'}
             </div>
           ) : (
             <div className="text-[10px] text-primary-light mt-1 animate-pulse">Uploading...</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TemporaryFileItem;
