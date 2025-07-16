import { deleteSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET () {
    await deleteSession()

    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL))

    // return NextResponse({message: 'faild to logout', success: false});
    
}