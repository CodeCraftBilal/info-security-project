# 1. Project Overview
SecureShare is a modern, end-to-end encrypted file sharing web application designed to protect sensitive data. It leverages military-grade encryption in the browser (using the Web Crypto API) before uploading, ensuring only authorized users and intended recipients can access the files.

# 2. Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Next.js Route Handlers & Server Actions
- **Language:** TypeScript
- **Database & ORM:** MongoDB (Native Driver) with `@auth/mongodb-adapter`
- **Key Infrastructure/Tools:** Cloudinary (File Storage), Web Crypto API (AES-256-GCM, RSA-OAEP for encryption), Auth.js / NextAuth v5 (Authentication via Google, GitHub, and Resend Magic Links).

# 3. Folder Structure
```text
/
├── app/               # Next.js App Router pages (routing, layouts, and API routes)
│   ├── api/           # API routes for dynamic data operations (fetching/deleting)
│   │   ├── auth/      # NextAuth.js endpoints ([...nextauth])
│   │   └── users/     # User specific APIs (e.g., public-key saving)
│   ├── dashboard/     # Protected user dashboard view
│   └── share/         # File sharing view
├── Action/            # Next.js Server Actions for secure backend operations (upload)
├── components/        # Reusable React components (UI elements)
├── lib/               # Utility functions, MongoDB client setup, and cryptography services
│   └── models/        # Strongly typed TypeScript interfaces (e.g., User.ts)
└── public/            # Static public assets
```

# 4. Core Architecture & Patterns
- **Architecture:** Next.js App Router paradigm utilizing both Server Components and Client Components. It uses Auth.js middleware (`middleware.ts`) to protect the dashboard and share routes.
- **State Management:** Native React state management (`useState`, `useEffect`, `useRef`) within Client Components. NextAuth's `SessionProvider` wraps the app to provide authentication state context globally.
- **Data Fetching:** Standard native `fetch` combined with Next.js App Router caching mechanisms, Server Actions for mutations, and Route Handlers for specific API endpoints.
- **Key Management Onboarding:** When a new OAuth user logs in for the first time, a post-login check on the dashboard detects if they are missing a `publicKey`. If so, a Web Crypto API keypair is generated and the public key is pushed to `/api/users/public-key`. 

# 5. Key Coding Conventions
- **Client/Server Boundary:** Strict separation of client-side logic (e.g., Web Crypto API operations requiring the browser environment, marked with `"use client"`) and server-side logic (database calls, Cloudinary uploads).
- **Security First:** Cryptographic keys (RSA) are managed locally via IndexedDB on the client. Sensitive operations like encryption and decryption happen strictly in the browser. Never send or store private keys on the server.
- **Styling & UI:** Functional components with hooks are exclusively used. Tailwind CSS is utilized for styling alongside Lucide React for iconography.

# 6. Environment Setup
**Required `.env.local` Variables:**
- `AUTH_SECRET` (NextAuth / Auth.js standard secret)
- `AUTH_URL` (NextAuth base URL)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (OAuth)
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` (OAuth)
- `RESEND_API_KEY` (Magic Link Email)
- `EMAIL_FROM` (Email sender address)
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Core Commands:**
- **Install dependencies:** `npm install`
- **Run development server:** `npm run dev`
- **Build for production:** `npm run build`
