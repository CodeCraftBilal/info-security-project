import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    // Get session from server
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('secureShare');
    
    // Query files for the current user
    const files = await db.collection('files')
      .find({ uploaderId: session.user.id })
      .toArray();

    // Format response
    const fileMetadata = files.map(file => ({
      id: file._id.toString(),
      icon: file.mimeType,
      name: file.fileName,
      size: formatFileSize(Number(file.fileSize)),
      type: file.mimeType,
      uploadedAt: file.uploadDate.toISOString().split('T')[0],
    }));
    
    return NextResponse.json(fileMetadata);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// ... keep your existing helper functions
// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const dynamic = 'force-dynamic'; // Ensure this is a dynamic route