import React from 'react';
import { UploadCloud } from 'lucide-react';

interface EmptyFilesProps {
  title: string;
  message: string;
  onUploadClick: () => void;
}

const EmptyFiles: React.FC<EmptyFilesProps> = ({ title, message, onUploadClick }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center w-full h-full min-h-[300px] p-8 text-center rounded-2xl" style={{ border: '2px dashed var(--border-strong)', background: 'var(--surface-card)' }}>
      <div className="p-5 mb-5 rounded-full animate-float" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
        <UploadCloud size={48} className="text-primary-light" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-text-primary">{title}</h2>
      <p className="mb-6 text-text-secondary max-w-sm text-sm leading-relaxed">{message}</p>
      <button
        onClick={onUploadClick}
        className="btn btn-primary"
      >
        <UploadCloud className="w-4 h-4" />
        Upload File
      </button>
    </div>
  );
};

export default EmptyFiles;
