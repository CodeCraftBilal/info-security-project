import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, FileText, Download, Trash2 } from 'lucide-react';
import { KeyPair } from '@/lib/crypto';
import { fetchAndDecryptFile, deleteFileAction } from '@/lib/fileUtils';

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
    <div
      className={`${isOpen ? 'border-gray-300 border-2 shadow-xl' : ''} relative min-w-[250px] max-h-[76px] flex flex-grow items-center gap-2 text-black bg-white py-2 px-2 rounded-xl max-w-[48%]`}
    >
      <div className="icon rounded-full">
        <img className='rounded-full' src="/File.jpg" alt="file icon" width={60} height={60} />
      </div>
      <div className="data w-[calc(100%-65px)]">
        <div className="filename text-lg font-bold"><span>{file.name}</span></div>
        <div className='other flex gap-2 w-full justify-between pr-3'>
          <span className="size">{file.size}</span>
          <span className="date">{file.uploadedAt}</span>
          <span className="type">{file.type}</span>
        </div>
      </div>
      
      <div className="menu absolute right-2 top-2" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
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
  );
};

export default FileItem;
