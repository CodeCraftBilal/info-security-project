import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, Download, Trash2, Info, Share2 } from 'lucide-react';

interface FileItemMenuProps {
  showDetails: boolean;
  onToggleDetails: () => void;
  onAction: (action: 'view' | 'download' | 'share') => void;
  onDelete: () => void;
}

const FileItemMenu: React.FC<FileItemMenuProps> = ({
  showDetails,
  onToggleDetails,
  onAction,
  onDelete
}) => {
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

  return (
    <div 
      className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10" 
      ref={menuRef}
    >
       <button 
         onClick={() => setIsOpen(!isOpen)} 
         className="p-1 sm:p-1.5 bg-white hover:bg-gray-100 rounded-full shadow-sm text-gray-700"
       >
         <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
       </button>
       
       {isOpen && (
          <div className="absolute right-0 mt-1 w-32 sm:w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
             <button 
               onClick={() => {
                 onToggleDetails();
                 setIsOpen(false);
               }} 
               className="md:hidden w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center"
             >
               <Info className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               {showDetails ? 'Hide Details' : 'Show Details'}
             </button>
             <button
               onClick={() => { onAction('view'); setIsOpen(false); }}
               className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center"
             >
               <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               View
             </button>
             <button
               onClick={() => { onAction('download'); setIsOpen(false); }}
               className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center"
             >
               <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               Download
             </button>
             <button
               onClick={() => { onAction('share'); setIsOpen(false); }}
               className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center"
             >
               <Share2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               Share
             </button>
             <button
               onClick={() => { onDelete(); setIsOpen(false); }}
               className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 flex items-center text-red-600"
             >
               <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
               Delete
             </button>
          </div>
       )}
    </div>
  );
};

export default FileItemMenu;
