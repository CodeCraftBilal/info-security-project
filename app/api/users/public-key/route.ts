import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('secureShare');
    const user = await db.collection('users').findOne({
      $or: [{ userName: username }, { email: username }]
    });

    console.log('Username:', username);
    console.log('Fetched user:', user);

    if (user && user.publicKey) {
      return NextResponse.json({ 
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        privateKeyIV: user.privateKeyIV
      });
    } else {
      return NextResponse.json({ error: 'User not found or no public key available' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching public key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicKey, encryptedPrivateKey, privateKeyIV } = await req.json();

    console.log('Received public key:', publicKey);

    if (!publicKey) {
      console.error('Public key is required');
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('secureShare');

    const updateFields: any = { publicKey };
    if (encryptedPrivateKey) updateFields.encryptedPrivateKey = encryptedPrivateKey;
    if (privateKeyIV) updateFields.privateKeyIV = privateKeyIV;

    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update user keys' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating public key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
