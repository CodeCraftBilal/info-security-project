import { NextResponse } from 'next/server'
import { getSessionPayload } from '@/lib/session'

export async function GET() {
  const session = await getSessionPayload()

  if (!session) {
    return null;
  }
  console.log('session is : ', session)

  return NextResponse.json({ session })
}
