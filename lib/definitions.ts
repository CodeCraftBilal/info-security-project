import { z } from 'zod'

export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email.' })
    .max(25, { message: 'email should be less 25 characters' })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
    role: z.string().trim()
})
export type FormState =
  | {
    errors?: {
      name?: string[]
      email?: string[]
      password?: string[]
      role?: string[]
    }
    message?: string
  }
  | undefined

 export interface SessionPayload {
  userId: string;
  email: string;
  role?: string;
  expiresAt: Date;
}

export type User = {
    userId: number,
    userName: string,
    userRole: string,
    userProfile: string
  }

export type Session = {
  userId: string,
  email: string,
  expiresAt: Date,
  role: string,
  iat: number,
  exp: number
}