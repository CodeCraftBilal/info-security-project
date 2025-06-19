import { NextResponse } from 'next/server'
import { getSessionPayload } from '@/lib/session'

export async function GET() {
  const session = await getSessionPayload()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  console.log('session is : ', session)

  return NextResponse.json({ session })
}
