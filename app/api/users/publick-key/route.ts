import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {
    const body = await req.json(); // ✅ read POST body
    const username: string = body.username || body.userName || body.email;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const publicKey = await getUserPublicKey(username);

    if (!publicKey) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error('Error in POST /api/users/public-key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const getUserPublicKey = async (username: string) => {

  const client = await clientPromise;
  const db = client.db('secureShare');
  const user = await db.collection('users').findOne({
    $or: [{ userName: username }, { email: username }]
  });

  if (user && user.publicKey) {
    return user.publicKey;
  } else {
    return null;
  }
}
