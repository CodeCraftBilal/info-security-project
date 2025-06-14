'use server'
import clientPromise from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";

export async function uploadFileAction(formData: FormData) {
    const files = formData.getAll('files');
    const keys = formData.getAll('encryptedKey');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    if (!files || files.length === 0) {
        return { message: 'No file is selected', error: true };
    }

    let uploadedUrls: string[] = [];

    try {
        for (const file of files) {
            if (file instanceof Blob) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer); // Convert to Node.js Buffer
                console.log('Uploading buffer:', buffer.length, buffer.constructor.name);
                
                const uploadResult: any = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'encryptedFiles', resource_type: 'raw' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer); // Write buffer to stream
                });

                uploadedUrls.push(uploadResult.secure_url);
            }
        }
        console.log('urls : ', uploadedUrls)
        return { message: 'Upload successful', urls: uploadedUrls, error: false };

    } catch (error) {
        console.error('Upload failed:', error);
        return { message: 'Upload failed', error: true };
    }
}
