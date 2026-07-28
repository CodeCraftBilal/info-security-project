import { CryptoService, KeyPair, EncryptedFile } from './crypto';

export interface EncryptedFileWithMetaData extends EncryptedFile {
  fileName: string,
  fileType: string
}

export function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const viewDecryptedFile = (data: Uint8Array, mimeType: string, fileName: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  if (mimeType.includes('pdf') ||
    mimeType.startsWith('image/') ||
    mimeType.startsWith('text/')) {
    window.open(url, '_blank');
  } else {
    downloadDecryptedFile(data, mimeType, fileName);
  }
};

export const downloadDecryptedFile = (data: Uint8Array, mimeType: string, fileName: string) => {
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

export const fetchAndDecryptFile = async (fileId: string, action: 'view' | 'download', keyPair: KeyPair | null) => {
  try {
    const response = await fetch(`/api/files/${fileId}`);
    const fileData = await response.json()

    const privateKey = keyPair?.privateKey;

    if (!privateKey) {
      throw new Error('Private key not found');
    }

    const fileResponse = await fetch(fileData.url);
    const encryptedFileBuffer = await fileResponse.arrayBuffer();
    const encryptedFileArray = new Uint8Array(encryptedFileBuffer);

    const encryptedKey = base64ToArrayBuffer(fileData.encryptedKey);
    const iv = base64ToUint8Array(fileData.iv)

    const aesKey = await CryptoService.decryptAesKey(encryptedKey, privateKey);

    const decryptedData = await CryptoService.decryptFile(
      { file: encryptedFileArray, iv, encryptedKey },
      aesKey
    );

    if (action === 'view') {
      viewDecryptedFile(decryptedData, fileData.type, fileData.name);
    } else {
      downloadDecryptedFile(decryptedData, fileData.type, fileData.name);
    }
  } catch (error) {
    throw error;
  }
};

export const getDecryptedFileBlob = async (fileId: string, keyPair: KeyPair | null): Promise<Blob> => {
  try {
    const response = await fetch(`/api/files/${fileId}`);
    const fileData = await response.json();

    const privateKey = keyPair?.privateKey;

    if (!privateKey) {
      throw new Error('Private key not found');
    }

    const fileResponse = await fetch(fileData.url);
    const encryptedFileBuffer = await fileResponse.arrayBuffer();
    const encryptedFileArray = new Uint8Array(encryptedFileBuffer);

    const encryptedKey = base64ToArrayBuffer(fileData.encryptedKey);
    const iv = base64ToUint8Array(fileData.iv);

    const aesKey = await CryptoService.decryptAesKey(encryptedKey, privateKey);

    const decryptedData = await CryptoService.decryptFile(
      { file: encryptedFileArray, iv, encryptedKey },
      aesKey
    );

    return new Blob([decryptedData], { type: fileData.type });
  } catch (error) {
    throw error;
  }
};

export const deleteFileAction = async (fileId: string): Promise<boolean> => {
  if (!confirm('Are you sure you want to permanently delete this file?')) return false;

  try {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete file');
    }

    if (result.success) {
      alert(result.message || 'File deleted successfully');
      return true;
    } else {
      throw new Error(result.error || 'Failed to delete file');
    }
  } catch (error: any) {
    console.error('Error deleting file:', error);
    alert(`Failed to delete file: ${error.message}`);
    return false;
  }
};

export const encryptFiles = async (files: File[], keyPair: KeyPair | null) => {
  if (!keyPair || files?.length === 0) {
    console.error('Missing key pair or files');
    return;
  }

  const result: EncryptedFileWithMetaData[] = [];

  for (const file of files) {
    try {
      const aesKey = await CryptoService.generateAesKey();
      const encryptedFile = await CryptoService.encryptFile(file, aesKey);

      let encryptedAesKey: ArrayBuffer;
      try {
        encryptedAesKey = await CryptoService.encryptAesKey(aesKey, keyPair.publicKey);
      } catch (encryptError) {
        throw encryptError;
      }

      result.push({
        ...encryptedFile,
        fileName: file.name,
        fileType: file.type,
        encryptedKey: encryptedAesKey
      });

    } catch (error) {
      continue;
    }
  }

  return result;
};
