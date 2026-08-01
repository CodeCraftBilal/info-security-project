"use client"
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useKeyPair } from '@/hooks/useKeyPair';
import ContentLoader from '@/components/Loader/ContentLoader';
import EmptyFiles from '@/components/dashboard/EmptyFiles';
import ShareModal from '@/components/dashboard/ShareModal';
import SharedFileItem, { SharedFile } from '@/components/dashboard/SharedFileItem';
import { useSession } from 'next-auth/react';

export default function SharePage() {
  const [search, setSearch] = useState<string>('');
  const [filesToDisplay, setFilesToDisplay] = useState<SharedFile[] | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<SharedFile[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { data: authSession } = useSession();
  
  const { keyPair } = useKeyPair();

  const getSharedFilesDataFromServer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/files/shared', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      const files: SharedFile[] = data.files;
      setFilesToDisplay(files);
      
      if (search !== '') {
        const filtered = files.filter(file =>
          file.fileName.toLowerCase().includes(search) ||
          file.fileType.toLowerCase().includes(search)
        );
        setFilteredFiles(filtered);
      } else {
        setFilteredFiles(files);
      }
    } catch (error) {
      alert('Failed to load shared files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authSession?.user) {
      getSharedFilesDataFromServer();
    }
  }, [authSession]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to first page on search

    if (searchTerm === '') {
      setFilteredFiles(filesToDisplay);
    } else {
      if (!filesToDisplay) return;
      const filtered = filesToDisplay.filter(file =>
        file.fileName.toLowerCase().includes(searchTerm) ||
        file.fileType.toLowerCase().includes(searchTerm)
      );
      setFilteredFiles(filtered);
    }
  };

  // Pagination logic
  const paginatedFiles = filteredFiles?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = filteredFiles ? Math.ceil(filteredFiles.length / itemsPerPage) : 0;

  const handleShareComplete = () => {
    getSharedFilesDataFromServer();
  };

  // Temporary function for not implemented handlers
  const handleAction = (fileId: string, action: 'view' | 'download' | 'share') => {
    console.log(`Action ${action} triggered for ${fileId}`);
  };
  const handleDelete = (fileId: string) => {
    console.log(`Delete triggered for ${fileId}`);
  };

  const hasNoFiles = !isLoading && (filesToDisplay?.length === 0);

  return (
    <div className='w-full h-full px-4 flex flex-col gap-2 relative'>
      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        onShareComplete={handleShareComplete}
      />

      <div className="flex items-center justify-between mt-4 mx-2 w-[90%] gap-4">
        <div className="search flex items-center gap-2 rounded-lg p-1 bg-blue-300 flex-1">
          <input 
            onChange={handleChangeSearch} 
            value={search}
            type="search" 
            placeholder="Search shared files..."
            className='w-[calc(100%-60px)] py-1 px-2 text-black out text-xl focus:outline-none bg-transparent' 
          />
          <button className="p-1">
            <Search className="text-black h-8 w-8" />
          </button>
        </div>
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Share File
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="filescontainer grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 sm:gap-6 p-2 text-blue-600">
          
          {isLoading && <div className='col-span-full text-center'>
              <ContentLoader type='grid'/>
            </div>}
          
          {hasNoFiles && (
            <div className="col-span-full">
              <EmptyFiles 
                title="No Shared Files" 
                message="You haven't shared any files yet, and no files have been shared with you."
                onUploadClick={() => setIsShareModalOpen(true)}
              />
            </div>
          )}

          {/* Render Shared Files */}
          {paginatedFiles?.map((file) => (
            <SharedFileItem 
              key={file._id} 
              file={file} 
              keyPair={keyPair} 
              onRefresh={getSharedFilesDataFromServer} 
              onAction={handleAction}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4 mt-auto">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}