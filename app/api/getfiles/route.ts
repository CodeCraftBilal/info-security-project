import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface MongoDBFile {
  _id: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  uploadDate: Date;
  // Add other fields as needed
}

interface FileMetaData {
  id: string;
  icon: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('secureShare');
    const files = await db.collection('files').find({}).toArray();

    const fileMetadata: FileMetaData[] = files.map(file => ({
      id: file._id.toString(),
      icon: getFileIcon(file.mimeType), // Helper function to get appropriate icon
      name: file.fileName,
      size: formatFileSize(Number(file.fileSize)), // Helper function to format size
      type: file.mimeType,
      uploadedAt: file.uploadDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    }));

    return NextResponse.json(fileMetadata);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to determine file icon based on mime type
function getFileIcon(mimeType: string): string {
  const type = mimeType.split('/')[0];
  switch(type) {
    case 'image': return 'img.png';
    case 'application': 
      if (mimeType.includes('pdf')) return 'pdf.png';
      if (mimeType.includes('word')) return 'doc.png';
      if (mimeType.includes('excel')) return 'xls.png';
      if (mimeType.includes('powerpoint')) return 'ppt.png';
      return 'file.png';
    case 'video': return 'video.png';
    case 'audio': return 'audio.png';
    default: return 'file.png';
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}