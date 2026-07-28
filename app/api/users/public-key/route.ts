import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicKey } = await req.json();

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('secureShare');

    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { publicKey } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update public key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating public key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
