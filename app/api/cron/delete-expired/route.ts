import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function GET(request: Request) {
  // Optional: check Authorization header if you want to secure this route using VERCEL_CRON_SECRET
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.VERCEL_CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    
    const now = new Date();
    
    // Find expired files
    const expiredFiles = await db.collection('sharedFiles').find({
      expiresAt: { $lt: now }
    }).toArray();

    if (expiredFiles.length === 0) {
      return NextResponse.json({ message: 'No expired files to delete', deletedCount: 0 });
    }

    let deletedCount = 0;
    const failedDeletions = [];

    for (const file of expiredFiles) {
      try {
        // Delete from Cloudinary
        // The public_id used during upload was `secure-share/${file.fileId}`
        const publicId = `secure-share/${file.fileId}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: file.fileType?.startsWith('image/') ? 'image' : (file.fileType?.startsWith('video/') ? 'video' : 'raw') });
        
        // Delete from MongoDB
        await db.collection('sharedFiles').deleteOne({ _id: file._id });
        
        deletedCount++;
      } catch (err: any) {
        console.error(`Failed to delete expired file ${file.fileId}:`, err);
        failedDeletions.push(file.fileId);
      }
    }

    return NextResponse.json({
      message: 'Cleanup process completed',
      deletedCount,
      failedDeletions
    });

  } catch (error: any) {
    console.error('Error during expired files cleanup:', error);
    return NextResponse.json(
      { message: 'Failed to run cleanup process', error: error.message },
      { status: 500 }
    );
  }
}
