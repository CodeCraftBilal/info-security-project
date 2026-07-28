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

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

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

      <div className="filescontainer flex flex-wrap gap-3 min-h-0 max-h-full overflow-auto text-blue-600">
        {isLoading ? (
          <div className='text-center w-full'>Loading files...</div>
        ) : !isLoading && filteredFiles?.length === 0 ? (
          <div className='text-center w-full'>No files found</div>
        ) : null}

        {filteredFiles?.map((file) => (
          <FileItem 
            key={file.id} 
            file={file} 
            keyPair={keyPair} 
            onRefresh={getFilesDataFromServer} 
          />
        ))}
      </div>
    </div>
  );
}
