'use client'
import React, { useActionState, useState, useEffect } from 'react'
import { registerAction } from '@/Action/registerAction'
import { CryptoService, KeyPair } from '@/lib/crypto'

const register = () => {

  const [state, action, pending] = useActionState(registerAction, undefined)
  const [keyPair, setKeyPair] = useState< KeyPair | null>(null)
  const [publicKeyStr, setPublicKeyStr] = useState<string>('')

  // saving the private key
  const savePrivateKeyToIndexedDB = async (privateKey: CryptoKey) => {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey)
    const dbRequest = window.indexedDB.open('KeyStore', 1)

    dbRequest.onupgradeneeded = () => {
      const db = dbRequest.result
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys')
      }
    }

    dbRequest.onsuccess = () => {
      const db = dbRequest.result
      const tx = db.transaction('keys', 'readwrite')
      const store = tx.objectStore('keys')
      store.put(exported, 'secureSharePrivateKey') // Save under the key 'privateKey'
      tx.oncomplete = () => db.close()
    }

    dbRequest.onerror = () => {
      console.error('Failed to open IndexedDB for private key storage')
    }
  }

  const genrateKeyPair = async () => {
      const pair = await CryptoService.generateKeyPair();
      setKeyPair(pair);
  
      // export public key to sent to others
  
      const exported = await window.crypto.subtle.exportKey('spki', pair.publicKey);
      const exportedAsString = btoa(String.fromCharCode(...new Uint8Array(exported)))
      setPublicKeyStr(exportedAsString);

      await savePrivateKeyToIndexedDB(pair.privateKey);
    }

    useEffect(() => {
      genrateKeyPair();
    }, [])

  return (
    <div className='bg-radial bg-bottom from-blue-800 to-black h-[86vh]'>
      <form action={action} className='w-1/2 my-10 flex flex-col gap-4 mx-auto p-10'>
        <h1 className='text-4xl font-bold text-center'>Register</h1>

        <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='email'>Email</label>
          <input className='border-white border-2 rounded-xl px-2 py-2' type="text" name='email' id='email' />
          {state?.errors?.email && <p className='text-sm text-red-600'>{state.errors.email}</p>}
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='username'>Username</label>
          <input className='border-white border-2 rounded-xl px-2 py-2' type="text" name='username' id='username' />
          {state?.errors?.username && <p className='text-sm text-red-600'>{state.errors.username}</p>}
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='password'>Password</label>
          <input className='px-2 py-2 border-white border-2 rounded-xl' type="text" name='password' id='password' />
          {state?.errors?.password && (
            <div className='text-sm text-red-600'>
              <p>Password must:</p>
              <ul>
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='confirmpassword'>Confirm Password</label>
          <input className='px-2 py-2 border-white border-2 rounded-xl' type="text" name='confirmpassword' id='confirmpassword' />
          {state?.errors?.confirmpassword && <p className='text-sm text-red-600'>{state.errors.confirmpassword}</p>}
        </div> */}
        <input type="text" name='role' value={'admin'} readOnly className='hidden'/>
          <input type="text" readOnly name='publicKeyStr' value={publicKeyStr} className='hidden' />
        <div className='flex items-center'>
          <button disabled={pending} className='bg-blue-800 w-1/2 mx-auto text-center p-3 rounded-2xl' type='submit'>Register</button>
        </div>
      </form>
    </div>
  )
}

export default register
