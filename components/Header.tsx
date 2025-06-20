'use client'
import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SessionPayload, User } from '@/lib/definitions'
const Header = () => {

    const [session, setSession] = useState<User | null>(null)
    useEffect(() => {
        const fetchSession = async () => {
            const res = await fetch('/api/session')
            const data = await res.json();
            const ses: User = {
                userId: data?.session?.userId,
                userName: data?.session?.userId,
                userRole: data?.session?.role,
                userProfile: 'profile.png'
            }
            if(ses != null)
                setSession(ses)
            console.log('session is : ', data)
        }

        fetchSession();
    }, [])

    return (
        <header className="py-6 px-4">
            <div className="container mx-auto flex justify-between items-center">

                <Link href={'#'} className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">SecureShare</span>
                </Link>

                <nav className="hidden md:flex space-x-8">
                    <Link href="/features" className="text-gray-600 hover:text-indigo-600">Features</Link>
                    <Link href="/security" className="text-gray-600 hover:text-indigo-600">Security</Link>
                    <Link href="/pricing" className="text-gray-600 hover:text-indigo-600">Pricing</Link>
                    <Link href="/about" className="text-gray-600 hover:text-indigo-600">About</Link>
                </nav>

                {session && <div className='flex gap-3 items-center cursor-pointer'>
                    <label htmlFor="dash" className='text-black font-bold text-xl'>{session.userId}</label>
                    <Link id='dash' href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        Dashboard
                    </Link>
                </div>}

                {session == null && <div className="flex items-center space-x-4">
                    <Link href="/login" className="text-gray-600 hover:text-indigo-600 font-medium">
                        Log in
                    </Link>
                    <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        Sign up
                    </Link>
                </div>}
            </div>
        </header>
    )
}

export default Header
