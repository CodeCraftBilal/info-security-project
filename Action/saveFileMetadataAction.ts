'use server'
import clientPromise from "@/lib/mongodb";

export async function saveFileMetadataAction(metadata: {
    fileName: string;
    fileSize: number;
    cloudinaryUrl: string;
    encryptedAesKey: string;
    mimeType: string;
    iv: string;
    uploaderId: number;
}) {
    if (!metadata || !metadata.fileName || !metadata.cloudinaryUrl) {
        return { message: 'Invalid metadata provided', error: true };
    }

    try {
        const client = await clientPromise;
        const db = client.db('secureShare');

        const insertResult = await db.collection('files').insertOne({
            fileName: metadata.fileName,
            fileSize: metadata.fileSize,
            cloudinaryUrl: metadata.cloudinaryUrl,
            encryptedAesKey: metadata.encryptedAesKey,
            mimeType: metadata.mimeType,
            iv: metadata.iv,
            uploaderId: metadata.uploaderId.toString(),
            uploadDate: new Date()
        });

        return { 
            message: 'File metadata saved successfully', 
            error: false, 
            id: insertResult.insertedId.toString() 
        };

    } catch (error) {
        console.error('Save metadata failed:', error);
        return { message: 'Failed to save file metadata', error: true };
    }
}
