import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get('recipient');

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient username is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('secureShare');

    const files = await db.collection('sharedFiles')
      .find({ recipientUsername: recipient })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching shared files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared files' },
      { status: 500 }
    );
  }
}