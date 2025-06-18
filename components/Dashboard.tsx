"use client"
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { uploadFileAction } from '@/Action/uploadFileAction';
import Link from 'next/link';
import { CryptoService, KeyPair, EncryptedFile } from '@/lib/crypto';
import { getKeyPairFromIndexedDB, generateAndStoreKeyPair, keyPairExists } from '@/lib/keyManagement';

const Dashboard = (): React.JSX.Element => {

  interface EncryptedFileWithMetaData extends EncryptedFile {
    fileName: string,
    fileType: string
  }
  // encryptedKey: ArrayBuffer
  type FileMetaData = {
    id: number,
    icon: string,
    name: string,
    size: string,
    type: string,
    uploadedAt: string,
  };

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


  useEffect(() => {
    const initializeKeys = async () => {
      const exists = await keyPairExists();
      if (!exists) {
        // Option 1: Redirect to registration
        // window.location.href = '/register';

        // Option 2: Generate new keys
        const newKeyPair = await generateAndStoreKeyPair();
        setKeyPair(newKeyPair);
      } else {
        const pair = await getKeyPairFromIndexedDB();
        console.log('pair initialized: ', pair)
        setKeyPair(pair);
      }
    };

    initializeKeys();
  }, []);


  const encryptFiles = async (files: File[]) => {
    if (!keyPair || files?.length === 0) {
      console.error('Missing key pair or files');
      return;
    }

    console.log('Encrypting files with key pair:', keyPair);
    const result: EncryptedFileWithMetaData[] = [];

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);

        // Generate AES key
        const aesKey = await CryptoService.generateAesKey();
        console.log('AES key generated:', aesKey);

        // Encrypt the file
        const encryptedFile = await CryptoService.encryptFile(file, aesKey);
        console.log('File encrypted, now encrypting AES key...');

        // Encrypt the AES key with RSA public key
        let encryptedAesKey: ArrayBuffer;
        try {
          encryptedAesKey = await CryptoService.encryptAesKey(aesKey, keyPair.publicKey);
          console.log('AES key encrypted successfully');
        } catch (encryptError) {
          console.error(`Failed to encrypt AES key for ${file.name}:`, encryptError);
          throw encryptError;
        }

        result.push({
          ...encryptedFile,
          fileName: file.name,
          fileType: file.type,
          encryptedKey: encryptedAesKey
        });

        console.log('File processed successfully:', file.name);
      } catch (error) {
        console.error(`Error encrypting ${file.name}:`, error);
        // Continue with next file even if one fails
        continue;
      }
    }

    setencryptedFiles(result);
    return result;
  };


  const logout = async () => {
    console.log('logout clicked')
    await fetch('/api/logout')
    window.location.href = '/login'
  }

  const [search, setSearch] = useState<string | null>('')
  const [filesToDisplay, setFilesToDisplay] = useState<FileMetaData[] | null>(null);
  const [filteredFiles, setFilteredFiles] = useState<FileMetaData[] | null>()
  const [openMenuId, setOpenMenuId] = useState<null | number>(null);
  const [filesToBeUploaded, setFilesToBeUploaded] = useState<File[]>([]);
  const [isuploading, setIsuploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // search feature
  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(e.target.value);

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

  // loading feature

  const [isLoading, setIsLoading] = useState(true);


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

  // fetch files metadata from server
  const getFilesDataFromServer = async () => {
    setIsLoading(true);
    try {
      console.log('get files request sent');
      const response = await fetch('/api/getfiles');
      const data: FileMetaData[] = await response.json();
      console.log('Received files:', data);
      setFilesToDisplay(data);
      setFilteredFiles(data); // Update filtered files as well
    } catch (error) {
      console.error('Error fetching files:', error);
      // Fallback to default data if there's an error
      // setFilesToDisplay(fileMetaData);
      // setFilteredFiles(fileMetaData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesDataFromServer();
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
      console.log('files to upload are: ', files)
      setFilesToBeUploaded(files);
      await uploadFiles(files)
    }
  };


  const uploadFiles = async (files: File[]): Promise<void> => {
    setIsuploading(true);
    const result = await encryptFiles(files);
    if (!result) return;
    console.log('upload function is in working');
    const formData = new FormData();

    for (const file of result) {
      const encryptedBlob = new Blob([file.file], { type: file.fileType });
      formData.append('files', encryptedBlob, file.fileName);

      // Create proper Blobs for the key and IV
      const keyBlob = new Blob([file.encryptedKey], { type: 'application/octet-stream' });
      formData.append('encryptedKey', keyBlob, `${file.fileName}.key`);

      const ivBlob = new Blob([file.iv], { type: 'application/octet-stream' });
      formData.append('iv', ivBlob, `${file.fileName}.iv`);
    }

    const r = await uploadFileAction(formData);
    console.log(r);
    setIsuploading(false);
  };


  // implementing view, download and delete functionalities
  // Add these functions to your Dashboard component

  function base64ToUint8Array(base64: string) {
    // Decode the base64 string to binary string
    const binaryString = atob(base64);

    // Create a Uint8Array from the binary string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }


  const fetchAndDecryptFile = async (fileId: string, action: 'view' | 'download') => {
    try {
      // 1. Get file metadata from API
      const response = await fetch(`/api/files/${fileId}`);
      const fileData = await response.json();
      console.log('file data is : ', fileData)

      // 2. Retrieve private key from IndexedDB
      // const privateKey = await getPrivateKeyFromIndexedDB(); // Implement this function
      const privateKey = keyPair?.privateKey;
      console.log('private key is: ' , privateKey)
      
      if (!privateKey) {
        throw new Error('Private key not found in IndexedDB');
      }

      // 3. Download the encrypted file from Cloudinary
      const fileResponse = await fetch(fileData.url);
      const encryptedFileBuffer = await fileResponse.arrayBuffer();
      const encryptedFileArray = new Uint8Array(encryptedFileBuffer);
      console.log('encrypted file is : ', encryptedFileArray);

      // 4. Prepare the encrypted AES key and IV
      const encryptedKey = base64ToArrayBuffer(fileData.encryptedKey);
      // const iv = base64ToArrayBuffer(fileData.iv);
      const iv = base64ToUint8Array(fileData.iv)

      // 5. Decrypt the AES key with RSA private key
      const aesKey = await CryptoService.decryptAesKey(encryptedKey, privateKey);

      // 6. Decrypt the file
      const decryptedData = await CryptoService.decryptFile(
        { file: encryptedFileArray, iv, encryptedKey },
        aesKey
      );


      // 7. Handle based on action
      if (action === 'view') {
        viewDecryptedFile(decryptedData, fileData.type, fileData.name);
      } else {
        downloadDecryptedFile(decryptedData, fileData.type, fileData.name);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // alert(`Failed to ${action} file: ${error.message}`);
    }
  };

  const viewDecryptedFile = (data: Uint8Array, mimeType: string, fileName: string) => {
    // Convert Uint8Array to Blob - Blob constructor can accept Uint8Array directly
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // For PDFs, images, and text files we can display in a new tab
    if (mimeType.includes('pdf') ||
      mimeType.startsWith('image/') ||
      mimeType.startsWith('text/')) {
      window.open(url, '_blank');
    } else {
      // For unsupported types, download instead
      downloadDecryptedFile(data, mimeType, fileName);
    }
  };

  const downloadDecryptedFile = (data: Uint8Array, mimeType: string, fileName: string) => {
    // Convert Uint8Array to Blob
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to convert base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Example function to get private key from IndexedDB
  const getPrivateKeyFromIndexedDB = async (): Promise<CryptoKey | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('KeyStore', 1);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('keys', 'readonly');
        const store = transaction.objectStore('keys');
        const getRequest = store.get('secureSharePrivateKey');

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
          console.error('Error getting private key from IndexedDB');
          resolve(null);
        };
      };

      request.onerror = () => {
        console.error('Error opening IndexedDB');
        resolve(null);
      };
    });
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        await getFilesDataFromServer();
        alert('File deleted successfully');
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
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

        <div>

          <div className="toggle flex gap-2 text-lg">
            <button
              className='bg-blue-300 p-2 rounded-xl text-black font-bold hover:bg-blue-400 hover:cursor-pointer'
              onClick={logout}
            >Logout</button>

          </div>
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
            {isLoading ? (
              <div>Loading files...</div>
            ) : filteredFiles?.length === 0 ? (
              <div>No files found matching your search</div>
            ) : ''}

            {filteredFiles?.map((file) => {
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
                      <li onClick={() => fetchAndDecryptFile((file.id).toString(), 'view')} className='cursor-pointer hover:bg-gray-500 p-1 rounded-sm'>View</li>
                      <li onClick={() => deleteFile((file.id).toString())} className='cursor-pointer hover:bg-gray-500 p-1 rounded-sm'>Delete</li>
                      <li onClick={() => fetchAndDecryptFile((file.id).toString(), 'download')} className='cursor-pointer hover:bg-gray-500 p-1 rounded-sm'>Download</li>
                    </ul>
                  </div>
                </div>
              );
            })}
            {filteredFiles?.length === 0 && (
              <div>
                No fileFound matching your search
              </div>
            )}

            {isuploading && (
              <div className='relative min-w-[250px] max-h-[76px] flex flex-grow items-center gap-2 text-black bg-white py-2 px-2 rounded-xl max-w-[48%]'>uploading file...</div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;