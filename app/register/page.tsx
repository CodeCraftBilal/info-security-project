
import React from 'react'

const register = () => {
  return (
    <div className='bg-radial bg-bottom from-blue-800 to-black h-[86vh]'>
      <form action="" className='w-1/2 my-10 flex flex-col gap-4 mx-auto p-10'>
        <h1 className='text-4xl font-bold text-center'>Register</h1>
        
        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='email'>Email</label>
            <input className='border-white border-2 rounded-xl px-2 py-2' type="text" name='email' id='email'/>
        </div>
        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='username'>Username</label>
            <input className='border-white border-2 rounded-xl px-2 py-2' type="text" name='username' id='username'/>
        </div>

        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='password'>Password</label>
            <input className='px-2 py-2 border-white border-2 rounded-xl' type="text" name='password' id='password'/>
        </div>

        <div className='flex flex-col gap-1'>
            <label className='text-xl' htmlFor='confirmpassword'>Confirm Password</label>
            <input className='px-2 py-2 border-white border-2 rounded-xl' type="text" name='confirmpassword' id='confirmpassword'/>
        </div>

        <div className='flex items-center'>
          <button className='bg-blue-800 w-1/2 mx-auto text-center p-3 rounded-2xl' type='submit'>Login</button>
        </div>
      </form>
    </div>
  )
}

export default register
