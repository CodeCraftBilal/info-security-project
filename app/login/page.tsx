'use client'
import React, { useActionState, useEffect } from 'react'
import { loginAction } from '@/Action/loginAction'
import { generateAndStoreKeyPair, keyPairExists } from '@/lib/keyManagement'
import Link from 'next/link'

const Login = () => {
  const [state, action, isPending] = useActionState(loginAction, {
    success: false,
    message: '',
  });

  useEffect(() => {
    const handleKeyPairCreation = async () => {
      if (state?.success) {
        try {
          // Check if key pair already exists
          const exists = await keyPairExists();
          if (!exists) {
            // Generate and store new key pair
            await generateAndStoreKeyPair();
          }
          
          // Redirect to dashboard or perform other actions
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('Error handling key pair:', error);
        }
      }
    };

    handleKeyPairCreation();
  }, [state?.success]);

  return (
    <div className='bg-radial bg-bottom from-blue-800 to-black h-[86vh]'>
      <form action={action} className='w-1/2 mt-20 flex flex-col gap-4 mx-auto p-10 max-md:w-full'>
        <h1 className='text-4xl font-bold text-center'>Login</h1>
        {!state?.success && <p className='text-sm text-red-500 text-center'>{state?.message}</p>}
        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='email'>Username or Email</label>
            <input 
              className='border-white border-2 rounded-xl px-2 py-2' 
              type="text" 
              name='email' 
              id='email'
              required
            />
        </div>

        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='password'>Password</label>
            <input 
              className='px-2 py-2 border-white border-2 rounded-xl' 
              type="password"  // Changed from text to password
              name='password' 
              id='password'
              required
            />
        </div>

        <div className='flex items-center flex-col gap-2'>
          <Link className='hover:text-blue-400 text-white self-end' href={'/register'}>Don't have account?</Link>
          <button 
            disabled={isPending} 
            className='bg-blue-800 w-1/2 mx-auto text-center p-3 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50' 
            type='submit'
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login