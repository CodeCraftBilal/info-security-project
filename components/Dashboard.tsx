"use client"
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { uploadFileAction } from '@/Action/uploadFileAction';
import Link from 'next/link';
import { CryptoService, KeyPair, EncryptedFile } from '@/lib/crypto';
import { blob } from 'stream/consumers';

const Dashboard = (): React.JSX.Element => {

  interface EncryptedFileWithMetaData extends EncryptedFile {
    fileName: string,
    fileType: string,
    encryptedKey: ArrayBuffer
  }

  type FileMetaData = {
    id: number,
    icon: string,
    name: string,
    size: string,
    type: string,
    uploadedAt: string,
  };

  const fileMetaData: FileMetaData[] = [
    {
      id: 1,
      icon: "pdf.png",
      name: "Report.pdf",
      size: "1.2 MB",
      type: "PDF",
      uploadedAt: "2025-06-09",
    },
    {
      id: 2,
      icon: "doc.png",
      name: "Resume.docx",
      size: "350 KB",
      type: "Word Document",
      uploadedAt: "2025-06-08",
    },
    {
      id: 3,
      icon: "img.png",
      name: "Screenshot.png",
      size: "800 KB",
      type: "Image",
      uploadedAt: "2025-06-07",
    },
    {
      id: 4,
      icon: "video.png",
      name: "DemoVideo.mp4",
      size: "25 MB",
      type: "Video",
      uploadedAt: "2025-06-06",
    },
    {
      id: 5,
      icon: "ppt.png",
      name: "Presentation.pptx",
      size: "2.5 MB",
      type: "PowerPoint",
      uploadedAt: "2025-06-05",
    },
    {
      id: 6,
      icon: "zip.png",
      name: "Assets.zip",
      size: "12 MB",
      type: "Archive",
      uploadedAt: "2025-06-04",
    },
    {
      id: 7,
      icon: "xls.png",
      name: "Budget.xlsx",
      size: "1.1 MB",
      type: "Excel Spreadsheet",
      uploadedAt: "2025-06-03",
    },
    {
      id: 8,
      icon: "img.png",
      name: "Banner.jpg",
      size: "950 KB",
      type: "Image",
      uploadedAt: "2025-06-02",
    },
    {
      id: 9,
      icon: "code.png",
      name: "AppCode.js",
      size: "120 KB",
      type: "JavaScript File",
      uploadedAt: "2025-06-01",
    },
    {
      id: 10,
      icon: "audio.png",
      name: "VoiceNote.mp3",
      size: "3.2 MB",
      type: "Audio",
      uploadedAt: "2025-05-31",
    },
    {
      id: 11,
      icon: "img.png",
      name: "Banner.jpg",
      size: "950 KB",
      type: "Image",
      uploadedAt: "2025-06-02",
    },
    {
      id: 12,
      icon: "code.png",
      name: "AppCode.js",
      size: "120 KB",
      type: "JavaScript File",
      uploadedAt: "2025-06-01",
    },
    {
      id: 13,
      icon: "audio.png",
      name: "VoiceNote.mp3",
      size: "3.2 MB",
      type: "Audio",
      uploadedAt: "2025-05-31",
    },
  ];

  type User = {
    userId: number,
    userName: string,
    userRole: string,
    userProfile: string
  }
  const users: User[] = [
    {
      userId: 0,
      userName: 'Bilal Khan',
      userRole: 'admin',
      userProfile: 'profile.png'
    },
    {
      userId: 1,
      userName: 'Rashid Khan',
      userRole: 'Viewer',
      userProfile: 'profile.png'
    },
  ]

  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [publicKeyStr, setPublicKeyStr] = useState<string>('')
  const [encryptedFiles, setencryptedFiles] = useState<EncryptedFileWithMetaData[]>([])

  const genrateKeyPair = async () => {
    const pair = await CryptoService.generateKeyPair();
    setKeyPair(pair);

    // export public key to sent to others

    const exported = await window.crypto.subtle.exportKey('spki', pair.publicKey);
    const exportedAsString = btoa(String.fromCharCode(...new Uint8Array(exported)))
    setPublicKeyStr(exportedAsString);
  }

  // encrypting the files
  const encryptFiles = async (files: File[]) => {
    if (!keyPair && files?.length === 0) return;

    const result: EncryptedFileWithMetaData[] = [];

    for (const file of files) {
      try {
        const aesKey = await CryptoService.generateAesKey();
        let encryptedAesKey: ArrayBuffer;

        // encrypt the file
        const encryptedFile = await CryptoService.encryptFile(file, aesKey)
        if (keyPair)
          encryptedFile.encryptedKey = await CryptoService.encryptAesKey(aesKey, keyPair?.publicKey);
        encryptedAesKey = encryptedFile.encryptedKey;
        result.push({
          ...encryptedFile,
          fileName: file.name,
          fileType: file.type,
          encryptedKey: encryptedAesKey
        });
      }
      catch (error) {
        console.log(`error encrypting ${file.name} : `, error);
      }
    }
    setencryptedFiles(result);
    return result;
  }

  // decrypting the files
  const decryptionFiles = async () => {
    if (!keyPair) return;

    for (const encryptedFile of encryptedFiles) {
      try {

        // decrypt aes key
        const aesKey = await CryptoService.decryptAesKey(
          encryptedFile.encryptedKey,
          keyPair.privateKey
        )

        // decrypt the file
        const decryptData = await CryptoService.decryptFile(encryptedFile, aesKey)
        const blob = new Blob([decryptData], {type: encryptedFile.fileType})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a');
        a.href = url;
        a.download = `decrypt ${encryptedFile.fileName}`
        a.click();
        URL.revokeObjectURL(url);
      }
      catch (error) {
        console.log(`error decrypting ${encryptedFile.fileName}`)
      }
    }
  }

  const [search, setSearch] = useState<string | null>('')
  const [filteredFiles, setFilteredFiles] = useState<FileMetaData[]>(fileMetaData)
  const [subMenu, setSubMenu] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<null | number>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filesToBeUploaded, setFilesToBeUploaded] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
  // menu disappear feature
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedOutside = Object.values(menuRefs.current).every(
        (ref) => ref && !ref.contains(target)
      );

      if (clickedOutside) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // upload file feature

  const handleUploadClick = (): void => {
    console.log('upload button clicked')
    fileInputRef.current?.click();
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('upload button clicked and files are selected')
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFilesToBeUploaded(files);
      await uploadFiles(files)
    }
  };


  const uploadFiles = async (files: File[]): Promise<void> => {
    const result = await encryptFiles(files);
    if(!result) return
    console.log('upload function is in working')
  const formData = new FormData();

  for (const file of result) {
    const encryptedBlob = new Blob([file.file], { type: file.fileType });

    formData.append('files', encryptedBlob, file.fileName);

    // Optional: add metadata if needed
    formData.append('encryptedKey', new Blob([file.encryptedKey]), file.fileName + '.key');
  }

  const r = await uploadFileAction(formData);
  console.log(r);
};

  return (
    <div className="bg-[#0b1338] h-screen p-2 flex flex-col">
      {/* Fixed: Corrected height class */}
      <div className="topbar p-2 flex items-center justify-between h-[60px]">
        <Link className='logo gap-0 flex items-center cursor-pointer' href={'http://localhost:3000/'}>
          <img className='' src="/logo.png" alt="profile" width={100} height={100} />
          <span className="text-white font-bold text-2xl ">SecureShare</span>
        </Link>

        <div className="actionbtns flex gap-3">
          <input type="file" name='fileupload' className='hidden' ref={fileInputRef} onChange={handleFileChange}
            accept='.pdf, .doc, .docx, .jpg, .png, .mp4' multiple />
          <button onClick={handleUploadClick} className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold">Upload File</button>
          <button className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold">Encrypt & File</button>
          <button className="bg-blue-300 cursor-pointer hover:bg-blue-400 transition-all rounded-xl p-2 text-black font-bold">Share File</button>
        </div>

        <div className="toggle">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:start-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-lg font-medium text-gray-300">Theme</span>
          </label>
        </div>
      </div>

      {/* Corrected layout below */}
      <div className="bottom flex flex-1 min-h-0">
        <div className="left w-[30%] h-full flex flex-col min-h-0">
          {/* Menu */}
          <div className="menu flex flex-col gap-3 p-2">
            <button className="bg-[#26305aec] cursor-pointer transition-all hover:bg-[#5968a3ec] p-3 rounded-2xl text-lg text-white">My Files</button>
            <button className="bg-[#26305aec] cursor-pointer transition-all hover:bg-[#5968a3ec] p-3 rounded-2xl text-lg text-white">Shared With Me</button>
            <button className="bg-[#26305aec] cursor-pointer transition-all hover:bg-[#5968a3ec] p-3 rounded-2xl text-lg text-white">Activity Logs</button>
          </div>

          {/* Collaborator section with working scroll */}
          <div className="collaborator flex flex-col gap-2 overflow-auto p-2 h-0 flex-grow justify-end">
            {users.map((user) => (
              <div key={user.userId} className="container bg-[#26305aec] flex items-center p-3 rounded-2xl text-lg text-white">
                <div className="image mr-3">
                  <img src={user.userProfile} alt="collaborator" width={60} height={60} />
                </div>
                <div className="description flex flex-col">
                  <span>{user.userName}</span>
                  <span>{user.userRole}</span>
                </div>
              </div>
            ))}

            {/* Account holder or owner */}
            <div className="container bg-[#26305aec] flex items-center p-3 rounded-2xl text-lg text-white">
              <div className="image mr-3">
                <img src="colImg.gif" alt="collaborator" width={60} height={60} />
              </div>
              <div className="description flex flex-col">
                <span>Collab Name</span>
                <span>Role</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="right flex flex-col items-center gap-2 bg-blue-200 w-[70%] h-full rounded-2xl px-2">
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
      </div>
    </div>
  );
};

export default Dashboard;