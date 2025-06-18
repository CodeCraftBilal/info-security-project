import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    console.log('finding file')
    const file = await db.collection('files').findOne({ _id: new ObjectId(params.id) });
    console.log('after file found')

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
      encryptedKey: file.encryptedAesKey,
      iv: file.iv
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    
    // 1. Find the file in MongoDB
    const file = await db.collection('files').findOne({ _id: new ObjectId(params.id) });
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    // 2. Extract public_id from Cloudinary URL
    const urlParts = file.cloudinaryUrl.split('/');
    const publicId = urlParts
      .slice(urlParts.indexOf('upload') + 1)
      .join('/')
      .replace(/\.[^/.]+$/, ''); // Remove file extension

    // 3. Delete from Cloudinary
    const cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw' // Important for non-image files
    });

    if (cloudinaryResult.result !== 'ok') {
      throw new Error(`Cloudinary deletion failed: ${cloudinaryResult.result}`);
    }

    // 4. Delete from MongoDB
    await db.collection('files').deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully',
      cloudinaryResult
    });

  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete file',
      details: error.message 
    }, { status: 500 });
  }
}