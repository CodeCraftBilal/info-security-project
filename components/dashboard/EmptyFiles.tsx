import React from 'react';
import { UploadCloud } from 'lucide-react';

interface EmptyFilesProps {
  title: string;
  message: string;
  onUploadClick: () => void;
}

const EmptyFiles: React.FC<EmptyFilesProps> = ({ title, message, onUploadClick }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center w-full h-full min-h-[300px] p-6 text-center border-2 border-dashed border-blue-300 rounded-xl bg-[#26305aec] bg-opacity-30">
      <div className="p-4 mb-4 bg-blue-300/20 rounded-full text-blue-400">
        <UploadCloud size={48} />
      </div>
      <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
      <p className="mb-6 text-gray-300 max-w-sm">{message}</p>
      <button
        onClick={onUploadClick}
        className="px-6 py-2.5 text-black font-bold bg-blue-300 rounded-xl hover:bg-blue-400 transition-colors shadow-sm"
      >
        Upload File
      </button>
    </div>
  );
};

export default EmptyFiles;
