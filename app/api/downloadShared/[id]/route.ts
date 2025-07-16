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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    const file = await db.collection('sharedFiles').findOne({ _id: new ObjectId(params.id) });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: file._id,
      name: file.fileName,
      size: file.fileSize,
      type: file.mimeType,
      url: file.fileUrl,
      uploadDate: file.uploadDate,
      encryptedKey: file.encryptedAesKey,
      iv: file.iv
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    
    // 1. Find the file in MongoDB
    const file = await db.collection('files').findOne({ _id: new ObjectId(params.id) });
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    // 2. Extract public_id from Cloudinary URL
    const url = new URL(file.cloudinaryUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    const publicId = pathParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, '');

    // 3. Delete from Cloudinary
    const cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
      invalidate: true
    });

    if (cloudinaryResult.result !== 'ok') {
      return NextResponse.json({ 
        success: false, 
        error: `Cloudinary deletion failed: ${cloudinaryResult.result}`,
        details: {
          publicIdUsed: publicId,
          cloudinaryResponse: cloudinaryResult
        }
      }, { status: 400 });
    }

    // 4. Delete from MongoDB
    const deleteResult = await db.collection('files').deleteOne({ _id: new ObjectId(params.id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'MongoDB deletion failed - document not found'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully',
      cloudinaryResult,
      mongoResult: deleteResult
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