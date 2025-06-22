'use client'
import React, { useActionState, useState, useEffect } from 'react'
import { registerAction } from '@/Action/registerAction'
import {
  generateAndStoreKeyPair,
  getKeyPairFromIndexedDB,
  exportPublicKeyAsBase64,
} from '@/lib/keyManagement'
import { KeyPair } from '@/lib/crypto'
import Link from 'next/link'

const Register = () => {
  const [state, action, pending] = useActionState(registerAction, undefined)
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [publicKeyStr, setPublicKeyStr] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    const initializeKeyPair = async () => {
      try {
        setIsInitializing(true);
        setDbError(null);

        // First try to get existing key pair
        const existingKeyPair = await getKeyPairFromIndexedDB();

        if (existingKeyPair) {
          if (isMounted) {
            setKeyPair(existingKeyPair);
            const exportedStr = await exportPublicKeyAsBase64(existingKeyPair.publicKey);
            setPublicKeyStr(exportedStr);
          }
        } else {
          // Generate new key pair if none exists
          const newKeyPair = await generateAndStoreKeyPair();
          if (isMounted) {
            setKeyPair(newKeyPair);
            const exportedStr = await exportPublicKeyAsBase64(newKeyPair.publicKey);
            setPublicKeyStr(exportedStr);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setDbError('Failed to initialize cryptographic storage. Please refresh the page.');
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeKeyPair();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className='bg-radial bg-bottom from-blue-800 to-black h-[86vh]'>
      <form action={action} className='w-1/2 my-10 flex flex-col gap-4 mx-auto p-10'>
        <h1 className='text-4xl font-bold text-center'>Sign up</h1>

        <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='email'>Email</label>
          <input
            className='border-white border-2 rounded-xl px-2 py-2'
            type="text"
            name='email'
            id='email'
            required
          />
          {state?.errors?.email && <p className='text-sm text-red-600'>{state.errors.email}</p>}
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='username'>Username</label>
          <input
            className='border-white border-2 rounded-xl px-2 py-2'
            type="text"
            name='username'
            id='username'
            required
          />
          {state?.errors?.username && <p className='text-sm text-red-600'>{state.errors.username}</p>}
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-xl' htmlFor='password'>Password</label>
          <input
            className='px-2 py-2 border-white border-2 rounded-xl'
            type="password"
            name='password'
            id='password'
            required
          />
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

        <input type="text" name='role' value={'admin'} readOnly className='hidden' />
        <input type="text" readOnly name='publicKeyStr' value={publicKeyStr} className='hidden' />

        <div className='flex items-center flex-col gap-2'>
          <Link className='hover:text-blue-400 text-white self-end' href={'/login'}>Already have account?</Link>

          <button
            disabled={pending || !publicKeyStr}
            className='bg-blue-800 w-1/2 mx-auto text-center p-3 rounded-2xl disabled:opacity-50 hover:bg-blue-700 transition-colors'
            type='submit'
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                Registering...
              </span>
            ) : 'Register'}
          </button>
        </div>
      </form>
    </div>
  )
};

export default Register;