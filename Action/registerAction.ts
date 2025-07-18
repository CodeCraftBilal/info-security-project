'use server'
import { SignupFormSchema, FormState } from "@/lib/definitions"
import clientPromise from "@/lib/mongodb";
import { createSession } from "@/lib/session";
import bcrypt from 'bcrypt'
import { redirect } from "next/navigation";
import { stringify } from "querystring";
export async function registerAction(state: FormState, formData: FormData) {

  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role')
  })


  const publicKeyStr = formData.get('publicKeyStr');

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, email, password, role } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const client = await clientPromise;
  const db = client.db('secureShare');

  const existingUser = await db.collection('users').findOne({
    userName: username,
    email: email
  })


  if (existingUser) {
    return;
  }
  await db.collection('users').insertOne({
    userName: username,
    email: email,
    role: role,
    password: hashedPassword,
    publicKey: publicKeyStr,
    date: new Date()
  })

  // creating session
  await createSession(username, email, role)
  redirect('/dashboard')
  // return {message: "registered Successfuly", error: false}
}