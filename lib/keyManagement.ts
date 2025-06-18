import { KeyPair } from '@/lib/crypto';

const DB_NAME = 'KeyStore';
const STORE_NAME = 'keyPairs';
const KEYPAIR_ID = 'secureShareKeyPair';

// Singleton DB instance with version management
let dbInstance: IDBDatabase | null = null;
const DB_VERSION = 3; // Increment when schema changes

const getDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Add error handling for future transactions
      dbInstance.onerror = (e) => {
        console.error('Database error:', e);
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Failed to open DB:', request.error);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('Database access blocked');
      reject('Database access blocked');
    };
  });
};

const withTransaction = async <T>(
  operation: (store: IDBObjectStore) => Promise<T>
): Promise<T> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    // tx.oncomplete = () => db.close();
    tx.onerror = () => {
      console.error('Transaction error:', tx.error);
      reject(tx.error);
    };

    const store = tx.objectStore(STORE_NAME);
    operation(store)
      .then(resolve)
      .catch(reject);
  });
};

export const saveKeyPairToIndexedDB = async (keyPair: KeyPair): Promise<void> => {
  try {
    const [privateKey, publicKey] = await Promise.all([
      window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
      window.crypto.subtle.exportKey('spki', keyPair.publicKey)
    ]);

    await withTransaction((store) => new Promise<void>((resolve, reject) => {
      const request = store.put({
        id: KEYPAIR_ID,
        privateKey,
        publicKey,
        createdAt: new Date()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    }));
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
};

export const getKeyPairFromIndexedDB = async (): Promise<KeyPair | null> => {
  try {
    const result = await withTransaction((store) => new Promise<any>((resolve, reject) => {
      const request = store.get(KEYPAIR_ID);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));

    if (!result) return null;

    const [privateKey, publicKey] = await Promise.all([
      window.crypto.subtle.importKey(
        'pkcs8',
        result.privateKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
      ),
      window.crypto.subtle.importKey(
        'spki',
        result.publicKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt', 'wrapKey'] // Add wrapKey usage here
      )
    ]);

    return { privateKey, publicKey };
  } catch (error) {
    console.error('Retrieval error:', error);
    return null;
  }
};

// Other functions (delete, generate, etc.) remain similar but use withTransaction

// Add these to your existing exports in keyManagement.ts
export const generateAndStoreKeyPair = async (): Promise<KeyPair> => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-256' }
      },
      true, // Extractable
      ['encrypt', 'decrypt'] // For private key
    );

    // Explicitly specify usages when importing keys
    const formattedKeyPair: KeyPair = {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey
    };

    await saveKeyPairToIndexedDB(formattedKeyPair);
    return formattedKeyPair;
  } catch (error) {
    console.error('Key generation error:', error);
    throw error;
  }
};

export const exportPublicKeyAsBase64 = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

export const keyPairExists = async (): Promise<boolean> => {
  try {
    const result = await withTransaction((store) => new Promise<boolean>((resolve, reject) => {
      const request = store.get(KEYPAIR_ID);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    }));
    return result;
  } catch (error) {
    console.error('Existence check error:', error);
    return false;
  }
};