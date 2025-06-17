'use server'

import clientPromise from "@/lib/mongodb"
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import bcrypt from 'bcrypt'

export async function loginAction(state: any, formData: FormData) {

    console.log('login requested')
    const email = formData.get('email')
    const passwrod = formData.get('password')

    const client = await clientPromise;
    const db = client.db('secureShare')

    const user = await db.collection('users').findOne({ email: email?.toString() })

    if (!user) {
        console.log('User does not exists');
        return { message: 'invalid username or passwrod', success: false }
    } 
    
    if(!passwrod) return;
    const isMatch = await bcrypt.compare(passwrod?.toString(), user.password)

    if (!isMatch) {
        console.log('Password does not Match');
        return { message: 'invalid username or passwrod', success: false }
    } 

    if(email) {
        await createSession(user.userName, email.toString(), user.role)
        redirect('/dashboard')
    } else {
        return {message: 'Login Failed. Please Try again', success: false}
    }

    return { message: 'login Successfull', success: true }
}