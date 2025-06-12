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
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
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
    return await window.crypto.subtle.wrapKey(
      "raw",
      aesKey,
      publicKey,
      {
        name: "RSA-OAEP",
      }
    );
  }

  // Decrypt AES key with RSA private key
  static async decryptAesKey(encryptedKey: ArrayBuffer, privateKey: CryptoKey): Promise<CryptoKey> {
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
}
