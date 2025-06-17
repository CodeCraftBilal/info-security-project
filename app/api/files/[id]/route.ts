import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Simplified GET endpoint - just returns metadata, no decryption
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    const file = await db.collection('files').findOne({ _id: new ObjectId(params.id) });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: file._id,
      name: file.fileName,
      size: file.fileSize,
      type: file.mimeType,
      url: file.cloudinaryUrl,
      uploadDate: file.uploadDate,
      encryptedKey: file.encryptedAesKey, // base64 encoded
      iv: file.iv // base64 encoded
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}