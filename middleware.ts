import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const protectedRoutes = ['/dashboard', '/share']
const publicRoutes = ['/login', '/register', '/']
 
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // Get the cookie value
  const cookie = (await cookies()).get('session')?.value

  let session = null
  if (cookie) {
    try {
      session = await decrypt(cookie)
    } catch (error) {
      console.error('Failed to decrypt session:', error)
      // Clear invalid cookie
      const response = NextResponse.redirect(new URL('/login', req.nextUrl))
      response.cookies.delete('session')
      return response
    }
  }
 
  // Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}