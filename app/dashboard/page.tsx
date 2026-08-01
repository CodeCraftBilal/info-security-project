"use client"
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import FileItem, { FileMetaData } from '@/components/dashboard/FileItem';
import { useKeyPair } from '@/hooks/useKeyPair';
import ContentLoader from '@/components/Loader/ContentLoader';
import EmptyFiles from '@/components/dashboard/EmptyFiles';
import TemporaryFileItem from '@/components/dashboard/TemporaryFileItem';
import UploadModal, { FileUploadState } from '@/components/dashboard/UploadModal';

export default function DashboardPage() {
  const [search, setSearch] = useState<string>('');
  const [filesToDisplay, setFilesToDisplay] = useState<FileMetaData[] | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<FileMetaData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [temporaryUploads, setTemporaryUploads] = useState<FileUploadState[]>([]);
  
  const { keyPair } = useKeyPair();

  useEffect(() => {
    const handleOpenModal = () => setIsUploadModalOpen(true);
    window.addEventListener('openUploadModal', handleOpenModal);
    return () => window.removeEventListener('openUploadModal', handleOpenModal);
  }, []);

  const getFilesDataFromServer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/getfiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data: FileMetaData[] = await response.json();
      setFilesToDisplay(data);
      
      // Maintain search filter if any
      if (search !== '') {
        const filtered = data.filter(file =>
          file.name.toLowerCase().includes(search) ||
          file.type.toLowerCase().includes(search)
        );
        setFilteredFiles(filtered);
      } else {
        setFilteredFiles(data);
      }
    } catch (error) {
      alert('Failed to load files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesDataFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        file.name.toLowerCase().includes(searchTerm) ||
        file.type.toLowerCase().includes(searchTerm)
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

  // Upload Handlers
  const handleUploadStart = (files: FileUploadState[]) => {
    setTemporaryUploads(prev => [...files, ...prev]);
    setIsUploadModalOpen(false); // Close modal when upload starts to show optimistic UI
  };

  const handleUploadProgress = (id: string, progress: number) => {
    setTemporaryUploads(prev => prev.map(f => f.id === id ? { ...f, progress } : f));
  };

  const handleUploadComplete = async (id: string, savedFileId: string) => {
    // Refresh files to get the newly uploaded one
    await getFilesDataFromServer();
    
    // Remove from temporary uploads since it's now in the fetched list
    setTemporaryUploads(prev => prev.filter(f => f.id !== id));
  };

  const handleUploadError = (id: string, error: string) => {
    setTemporaryUploads(prev => prev.map(f => f.id === id ? { ...f, status: 'error', errorMessage: error } : f));
    // We could keep it in the list for a while so user sees error, 
    // or auto-remove after a few seconds. Let's keep it until they refresh or we add a dismiss button.
  };

  const hasNoFiles = !isLoading && (filesToDisplay?.length === 0) && (temporaryUploads.length === 0);

  return (
    <div className='w-full h-full px-4 flex flex-col gap-3 relative'>
      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadStart={handleUploadStart}
        onUploadProgress={handleUploadProgress}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
      />

      {/* Search Bar */}
      <div className="flex items-center gap-2 rounded-xl mt-4 px-4 py-2.5 mx-1 w-full max-w-2xl" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <Search className="text-text-muted h-5 w-5 shrink-0" />
        <input 
          onChange={handleChangeSearch} 
          value={search}
          type="search" 
          placeholder="Search files..."
          className='flex-1 py-0.5 text-text-primary text-base focus:outline-none bg-transparent placeholder:text-text-muted' 
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="filescontainer grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 sm:gap-5 p-2">
          
          {isLoading && <div className='col-span-full text-center'>
              <ContentLoader type='grid'/>
            </div>}
          
          {hasNoFiles && (
            <EmptyFiles 
              title="No Files Found" 
              message="You haven't uploaded any files yet. Click the upload button to get started and securely store your data."
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          )}

          {/* Render Temporary Uploading Files */}
          {temporaryUploads.map((fileState) => (
            <TemporaryFileItem key={fileState.id} fileState={fileState} />
          ))}

          {/* Render Fetched Files */}
          {paginatedFiles?.map((file) => (
            <FileItem 
              key={file.id} 
              file={file} 
              keyPair={keyPair} 
              onRefresh={getFilesDataFromServer} 
            />
          ))}
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-4 mt-auto">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="btn btn-secondary btn-sm disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-text-secondary text-sm font-medium px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="btn btn-secondary btn-sm disabled:opacity-40"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
