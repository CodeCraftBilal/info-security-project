import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name?: string;
  email: string;
  image?: string;
  role: string;
  publicKey?: string;
  emailVerified?: Date | null;
  createdAt: Date;
}
