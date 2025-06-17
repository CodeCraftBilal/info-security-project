'use client'
import React, { useActionState } from 'react'
import { loginAction } from '@/Action/loginAction'
import { stat } from 'fs';

const login = () => {

  const [state, action, isPending] = useActionState(loginAction, {
    success: false,
    message: '',
  });
  console.log(state)

  return (
    <div className='bg-radial bg-bottom from-blue-800 to-black h-[86vh]'>
      <form action={action} className='w-1/2 mt-20 flex flex-col gap-4 mx-auto p-10'>
        <h1 className='text-4xl font-bold text-center'>Login</h1>
        {!state?.success && <p className='text-sm text-red-500 text-center'>{state?.message}</p>}
        {/* <img className='mx-auto' src="/lock.png" alt="login" width={250} height={250} /> */}
        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='email'>Username or Email</label>
            <input className='border-white border-2 rounded-xl px-2 py-2' type="text" name='email' id='email'/>
        </div>

        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='password'>Password</label>
            <input className='px-2 py-2 border-white border-2 rounded-xl' type="text" name='password' id='password'/>
        </div>

        <div className='flex items-center'>
          <button disabled={isPending} className='bg-blue-800 w-1/2 mx-auto text-center p-3 rounded-2xl' type='submit'>Login</button>
        </div>
      </form>
    </div>
  )
}

export default login
