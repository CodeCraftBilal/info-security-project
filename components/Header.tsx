'use client'
import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="py-6 px-4 fixed top-0 w-full bg-[#180c35] h-18 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link href={'/'} className="flex items-center">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <img src="/logo2.png" alt="secureShare" />
                    </div>
                    <span className="text-2xl font-bold text-gray-100">SecureShare</span>
                </Link>

                <nav className="hidden md:flex space-x-8">
                    <Link href="/features" className="text-gray-200 hover:text-indigo-600">Features</Link>
                    <Link href="/security" className="text-gray-200 hover:text-indigo-600">Security</Link>
                    <Link href="/pricing" className="text-gray-200 hover:text-indigo-600">Pricing</Link>
                    <Link href="/about" className="text-gray-200 hover:text-indigo-600">About</Link>
                </nav>

                {session?.user ? (
                    <div className='flex gap-3 items-center cursor-pointer'>
                        <label htmlFor="dash" className='text-white font-bold text-lg'>{session.user.name || session.user.email}</label>
                        <Link id='dash' href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                            Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link href="/api/auth/signin" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                            Log in / Sign up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header
