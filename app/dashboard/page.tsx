"use client"
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import FileItem, { FileMetaData } from '@/components/dashboard/FileItem';
import { useKeyPair } from '@/hooks/useKeyPair';

export default function DashboardPage() {
  const [search, setSearch] = useState<string>('');
  const [filesToDisplay, setFilesToDisplay] = useState<FileMetaData[] | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<FileMetaData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { keyPair } = useKeyPair();

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
      setFilteredFiles(data);
    } catch (error) {
      alert('Failed to load files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesDataFromServer();
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

  const paginatedFiles = filteredFiles?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = filteredFiles ? Math.ceil(filteredFiles.length / itemsPerPage) : 0;

  return (
    <div className='w-full h-full mx-4 flex flex-col gap-2'>
      <div className="search flex items-center gap-2 rounded-lg mt-4 p-1 bg-blue-300 mx-2 w-[90%]">
        <input 
          onChange={handleChangeSearch} 
          value={search}
          type="search" 
          placeholder="Search files..."
          className='w-[calc(100%-60px)] py-1 px-2 text-black out text-xl focus:outline-hidden bg-transparent' 
        />
        <button className="p-1">
          <Search className="text-black h-8 w-8" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="filescontainer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2 text-blue-600">
          {isLoading ? (
            <div className='col-span-full text-center'>Loading files...</div>
          ) : !isLoading && filteredFiles?.length === 0 ? (
            <div className='col-span-full text-center'>No files found</div>
          ) : null}

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
