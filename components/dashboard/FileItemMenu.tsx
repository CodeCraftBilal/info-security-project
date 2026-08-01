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

  const menuItemClass = "w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center gap-2 transition-colors duration-150 text-text-secondary hover:text-text-primary hover:bg-primary/10";

  return (
    <div 
      className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10" 
      ref={menuRef}
    >
       <button 
         onClick={() => setIsOpen(!isOpen)} 
         className="p-1 sm:p-1.5 rounded-full shadow-sm transition-colors duration-150"
         style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
       >
         <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
       </button>
       
       {isOpen && (
          <div className="absolute right-0 mt-1 w-40 sm:w-48 rounded-xl shadow-lg z-20 overflow-hidden animate-scale-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
             <button 
               onClick={() => {
                 onToggleDetails();
                 setIsOpen(false);
               }} 
               className={`md:hidden ${menuItemClass}`}
             >
               <Info className="h-3.5 w-3.5" />
               {showDetails ? 'Hide Details' : 'Show Details'}
             </button>
             <button
               onClick={() => { onAction('view'); setIsOpen(false); }}
               className={menuItemClass}
             >
               <FileText className="h-3.5 w-3.5" />
               View
             </button>
             <button
               onClick={() => { onAction('download'); setIsOpen(false); }}
               className={menuItemClass}
             >
               <Download className="h-3.5 w-3.5" />
               Download
             </button>
             <button
               onClick={() => { onAction('share'); setIsOpen(false); }}
               className={menuItemClass}
             >
               <Share2 className="h-3.5 w-3.5" />
               Share
             </button>
             <button
               onClick={() => { onDelete(); setIsOpen(false); }}
               className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center gap-2 transition-colors duration-150 text-danger hover:text-danger-light hover:bg-danger/10"
             >
               <Trash2 className="h-3.5 w-3.5" />
               Delete
             </button>
          </div>
       )}
    </div>
  );
};

export default FileItemMenu;
