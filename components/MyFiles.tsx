'use client'
import React from 'react'
import { useState } from 'react'
const MyFiles = () => {

    const [search, setSearch] = useState<string | null>('')
    const [filteredFiles, setFilteredFiles] = useState<FileMetaData[]>(fileMetaData)
    // search feature
      const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const searchTerm = e.target.value.toLowerCase();
        setSearch(e.target.value);
        console.log(search)
        if (searchTerm === '') {
          setFilteredFiles(fileMetaData)
        }
        else {
          const filtered = fileMetaData.filter(file =>
            file.name.toLowerCase().includes(searchTerm) ||
            file.type.toLowerCase().includes(searchTerm)
          )
          setFilteredFiles(filtered);
        }
      }

  return (
    <div>
        <span>hello from my files</span>
      <div className="search flex items-center gap-2 rounded-lg mt-4 p-1 bg-blue-300 mx-2 w-[90%]">
            <input onChange={(e) => handleChangeSearch(e)} type="search" className='w-[calc(100%-60px)] py-1 px-2 text-black out text-xl focus:outline-hidden' />
            <button><img className='' src="/search.png" width={35} height={35} alt="search" /></button>
          </div>
          {/* flex flex-wrap gap-3 w-full h-[80%] overflow-auto */}
          <div className="filescontainer flex flex-wrap gap-3 min-h-0 max-h-full overflow-auto">
            {filteredFiles.map((file) => {
              return (
                <div
                  key={file.id}
                  ref={(el) => {
                    menuRefs.current[file.id] = el
                  }}
                  className={`${openMenuId === file.id ? 'border-gray-300 border-2 shadow-xl' : ''} relative min-w-[250px] max-h-[76px] flex flex-grow items-center gap-2 text-black bg-white py-2 px-2 rounded-xl max-w-[48%]`}
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
                  <div className="menu absolute right-4 top-2">
                    <img
                      className='cursor-pointer'
                      onClick={() =>
                        setOpenMenuId(openMenuId === file.id ? null : file.id)
                      }
                      src="/menu_dots.png"
                      alt="menu"
                      width={20}
                      height={30}
                    />
                    <ul
                      className={`${openMenuId === file.id ? '' : 'hidden'
                        } rounded-sm p-2 bg-gray-400 absolute right-0 z-10`}
                    >
                      <li className='cursor-pointer hover:bg-gray-500 p-1 rounded-sm'>View</li>
                      <li className='cursor-pointer hover:bg-gray-500 p-1 rounded-sm'>Delete</li>
                      <li className='cursor-pointer hover:bg-gray-500 p-1 rounded-sm'>Download</li>
                    </ul>
                  </div>
                </div>
              );
            })}
            {filteredFiles.length === 0 && (
              <div>
                No fileFound matching your search
              </div>
            )}

          </div>
    </div>
  )
}

export default MyFiles
