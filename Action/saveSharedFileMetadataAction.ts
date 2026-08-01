'use server'
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from 'uuid';

export async function saveSharedFileMetadataAction(metadata: {
    fileName: string;
    fileSize: number;
    cloudinaryUrl: string;
    encryptedAesKey: string;
    mimeType: string;
    iv: string;
    senderUsername: string;
    recipientUsername: string;
}) {
    if (!metadata || !metadata.fileName || !metadata.cloudinaryUrl || !metadata.recipientUsername) {
        return { message: 'Invalid metadata provided', error: true };
    }

    try {
        const client = await clientPromise;
        const db = client.db('secureShare');

        const fileId = uuidv4();
        
        const sharedFileDoc = {
            fileId,
            fileName: metadata.fileName,
            fileType: metadata.mimeType,
            fileUrl: metadata.cloudinaryUrl,
            fileSize: metadata.fileSize,
            senderUsername: metadata.senderUsername,
            recipientUsername: metadata.recipientUsername,
            encryptedAesKey: metadata.encryptedAesKey,
            iv: metadata.iv,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            downloadCount: 0
        };

        const insertResult = await db.collection('sharedFiles').insertOne(sharedFileDoc);

        // Create a notification for the recipient
        await db.collection('notifications').insertOne({
            recipientUsername: metadata.recipientUsername,
            senderUsername: metadata.senderUsername,
            message: `Shared a new file with you: ${metadata.fileName}`,
            type: 'FILE_SHARED',
            read: false,
            createdAt: new Date(),
            relatedFileId: fileId
        });

        return { 
            message: 'Shared file metadata saved successfully', 
            error: false, 
            id: insertResult.insertedId.toString(),
            fileId: fileId
        };

    } catch (error) {
        console.error('Save shared file metadata failed:', error);
        return { message: 'Failed to save shared file metadata', error: true };
    }
}
