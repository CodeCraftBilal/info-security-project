import { NextResponse } from 'next/server'
import { getSessionPayload } from '@/lib/session'

export async function GET() {
  const session = await getSessionPayload()

  if (!session) {
    return NextResponse.json(null);
  }

  return NextResponse.json({ session })
}
