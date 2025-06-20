import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';
// import { PutBlobResult } from '@vercel/blob';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  console.log('Request to share file received');
  
  try {
    const formData = await request.formData();
    
    // Access form fields
    const recipientUsername = formData.get('recipientUsername') as string;
    const senderUsername = formData.get('senderUsername') as string;
    const file = formData.get('file') as File;
    const encryptedAesKey = formData.get('encryptedAesKey') as File;
    const iv = formData.get('iv') as File;
    const fileName = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;

    console.log('Received data:', {
      recipientUsername,
      senderUsername,
      fileName,
      fileType,
      fileSize: file.size,
      aesKeySize: encryptedAesKey.size,
      ivSize: iv.size
    });

    // Generate a unique file ID
    const fileId = uuidv4();

    // 1. Store the encrypted file in Cloudinary
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    
    const cloudinaryUpload = await cloudinary.uploader.upload(
      `data:${fileType};base64,${fileBase64}`,
      {
        public_id: `secure-share/${fileId}`,
        resource_type: "auto",
        overwrite: true,
      }
    );

    // 2. Convert the encrypted AES key and IV to base64 for storage
    const aesKeyBuffer = await encryptedAesKey.arrayBuffer();
    const ivBuffer = await iv.arrayBuffer();
    
    const encryptedAesKeyBase64 = Buffer.from(aesKeyBuffer).toString('base64');
    const ivBase64 = Buffer.from(ivBuffer).toString('base64');

    // 3. Save metadata to MongoDB
    const client = await clientPromise;
    const db = client.db('secureShare');
    
    const sharedFileDoc = {
      fileId,
      fileName,
      fileType,
      fileUrl: cloudinaryUpload.secure_url,
      fileSize: file.size,
      senderUsername,
      recipientUsername,
      encryptedAesKey: encryptedAesKeyBase64,
      iv: ivBase64,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      downloadCount: 0
    };

    const result = await db.collection('sharedFiles').insertOne(sharedFileDoc);

    // 4. Return the file ID for share link generation
    return NextResponse.json({
      message: 'File shared successfully',
      success: true,
      fileId,
      downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/download/${fileId}`
    });

  } catch (error: any) {
    console.error('Error processing file share:', error);
    return NextResponse.json(
      { message: 'Failed to process file share', error: error.message },
      { status: 500 }
    );
  }
}