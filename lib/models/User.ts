import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name?: string;
  email: string;
  image?: string;
  role: string;
  publicKey?: string;
  encryptedPrivateKey?: string;
  privateKeyIV?: string;
  emailVerified?: Date | null;
  createdAt: Date;
}
