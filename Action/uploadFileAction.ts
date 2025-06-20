'use server'
import clientPromise from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

export async function uploadFileAction(formData: FormData) {
    const files = formData.getAll('files');
    const keys = formData.getAll('encryptedKey');
    const ivs = formData.getAll('iv');
    const uploaderId = formData.getAll('uploaderId')

    console.log('keys: ', keys)

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    if (!files || files.length == 0) {
        return { message: 'No file is selected', error: true };
    }

    let uploadedUrls: string[] = [];

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file instanceof Blob) {
                // Process main file
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Process key - ensure it's handled as a File/Blob
                const keyEntry = keys[i];
                if (!(keyEntry instanceof Blob)) {
                    throw new Error('Key is not a Blob');
                }
                const keyBuffer = Buffer.from(await keyEntry.arrayBuffer());
                console.log('encrypted aes key length', keyBuffer.length);

                // Process IV
                const ivEntry = ivs[i];
                if (!(ivEntry instanceof Blob)) {
                    throw new Error('IV is not a Blob');
                }
                const ivBuffer = Buffer.from(await ivEntry.arrayBuffer());

                // Upload to Cloudinary
                const uploadResult: any = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'encryptedFiles', resource_type: 'raw' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });

                uploadedUrls.push(uploadResult.secure_url);

                // Store in MongoDB
                const client = await clientPromise;
                const db = client.db('secureShare');

                await db.collection('files').insertOne({
                    fileName: file.name,
                    fileSize: file.size,
                    cloudinaryUrl: uploadResult.secure_url,
                    encryptedAesKey: keyBuffer.toString('base64'),
                    mimeType: file.type,
                    iv: ivBuffer.toString('base64'),
                    uploaderId: uploaderId[i],
                    uploadDate: new Date()
                });
            }
        }

        return { message: 'Upload successful', urls: uploadedUrls, error: false };

    } catch (error) {
        console.error('Upload failed:', error);
        return { message: 'Upload failed', error: true };
    }
}