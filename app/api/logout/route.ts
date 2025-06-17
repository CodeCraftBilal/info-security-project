import { deleteSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET () {
    console.log('logout request recieved')
    await deleteSession()

    console.log('session deleted')

    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL))

    // return NextResponse({message: 'faild to logout', success: false});
    
}