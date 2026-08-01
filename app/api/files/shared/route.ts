import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const username = session.user.email;

    const client = await clientPromise;
    const db = client.db('secureShare');

    // Aggregate to fetch files where the user is either sender or recipient
    // and join with users collection to get profile pictures
    const files = await db.collection('sharedFiles').aggregate([
      { 
        $match: { 
          $or: [
            { recipientUsername: username },
            { senderUsername: username }
          ] 
        } 
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'senderUsername',
          foreignField: 'email',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recipientUsername',
          foreignField: 'email',
          as: 'recipientDetails'
        }
      },
      {
        $addFields: {
          senderProfilePic: { $arrayElemAt: ['$senderDetails.profilePic', 0] },
          recipientProfilePic: { $arrayElemAt: ['$recipientDetails.profilePic', 0] }
        }
      },
      {
        $project: {
          senderDetails: 0,
          recipientDetails: 0
        }
      }
    ]).toArray();

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching shared files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared files' },
      { status: 500 }
    );
  }
}
