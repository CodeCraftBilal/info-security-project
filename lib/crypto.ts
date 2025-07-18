// crypto.ts (or lib/crypto.ts)
import { randomBytes } from 'crypto';

// ✅ Export interfaces so you can import them anywhere
export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedFile {
  file: Uint8Array;
  iv: Uint8Array;
  encryptedKey: ArrayBuffer;
}

// ✅ Export the service class
export class CryptoService {
  // Generate RSA key pair for key exchange
  static async generateKeyPair(): Promise<KeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 1048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      } as RsaHashedKeyGenParams,
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
  }

  // Generate AES key for file encryption
  static async generateAesKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt file with AES key
  static async encryptFile(file: File, aesKey: CryptoKey): Promise<EncryptedFile> {
    const fileBuffer = await file.arrayBuffer();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      fileBuffer
    );

    return {
      file: new Uint8Array(encryptedData),
      iv,
      encryptedKey: new ArrayBuffer(0), // placeholder for now
    };
  }

  // Encrypt AES key with RSA public key
  static async encryptAesKey(aesKey: CryptoKey, publicKey: CryptoKey): Promise<ArrayBuffer> {
  try {
    // Verify the public key can be used for wrapping
    if (!publicKey.usages.includes('wrapKey')) {
      // If not, re-import the key with correct usages
      const exported = await window.crypto.subtle.exportKey('spki', publicKey);
      publicKey = await window.crypto.subtle.importKey(
        'spki',
        exported,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt', 'wrapKey']
      );
    }

    const encryptedKey = await window.crypto.subtle.wrapKey(
      "raw",
      aesKey,
      publicKey,
      { name: "RSA-OAEP" }
    );

    return encryptedKey;
  } catch (error) {
    console.error('Error in encryptAesKey:', error);
    throw error;
  }
}

  // Decrypt AES key with RSA private key
  static async decryptAesKey(encryptedKey: ArrayBuffer, privateKey: CryptoKey): Promise<CryptoKey> {
  try {
    // Verify the private key has unwrapKey usage
    if (!privateKey.usages.includes('unwrapKey')) {
      throw new Error('Private key does not have unwrapKey usage');
    }

    return await window.crypto.subtle.unwrapKey(
      "raw",
      encryptedKey,
      privateKey,
      {
        name: "RSA-OAEP",
      },
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error('Error in decryptAesKey:', error);
    throw error;
  }
}

  // Decrypt file with AES key
  static async decryptFile(encryptedFile: EncryptedFile, aesKey: CryptoKey): Promise<Uint8Array> {
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedFile.iv,
      },
      aesKey,
      encryptedFile.file
    );

    return new Uint8Array(decryptedData);
  }

  static async importPublicKey(publicKeyStr: string): Promise<CryptoKey> {
    // Convert the base64 string to ArrayBuffer
    const binaryDer = this.base64ToArrayBuffer(publicKeyStr);
    
    return window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    let binary = '';
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
