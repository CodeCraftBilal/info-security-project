import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const username = session.user.email; // We use email as the username usually, let's verify how it's done elsewhere

    const client = await clientPromise;
    const db = client.db('secureShare');
    
    // Also fetch the sender's profile picture by joining with users collection
    const notifications = await db.collection('notifications').aggregate([
      { $match: { recipientUsername: username, read: false } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'senderUsername',
          foreignField: 'email',
          as: 'senderDetails'
        }
      },
      {
        $addFields: {
          senderProfilePic: { $arrayElemAt: ['$senderDetails.profilePic', 0] }
        }
      },
      {
        $project: {
          senderDetails: 0
        }
      }
    ]).toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    const client = await clientPromise;
    const db = client.db('secureShare');

    if (notificationId) {
       await db.collection('notifications').updateOne(
        { _id: new ObjectId(notificationId), recipientUsername: session.user.email },
        { $set: { read: true } }
      );
    } else {
       // Mark all as read
       await db.collection('notifications').updateMany(
        { recipientUsername: session.user.email, read: false },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
